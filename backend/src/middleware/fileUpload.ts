import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import path from 'path';
import fs from 'fs/promises';
import {
  validateFile,
  createSecureFilePath,
  createQuarantinePath,
  saveFileSecurely,
  logFileAccess,
  getFileUploadPolicy,
  FileUploadConfig,
  DEFAULT_FILE_CONFIG,
  FileValidationResult
} from '../utils/fileSecurity';
import { logSecurityEvent } from '../utils/logger';
import { authenticate } from './auth';

// Extend Express Request to include file information
declare global {
  namespace Express {
    interface Request {
      fileValidation?: FileValidationResult;
      uploadSession?: {
        id: string;
        totalSize: number;
        uploadedSize: number;
      };
    }
  }
}

// Rate limiter for file uploads (per user)
const uploadRateLimiter = new RateLimiterMemory({
  keyPrefix: 'file_upload',
  points: 10, // Number of uploads
  duration: 60 * 60, // Per hour
});

// Configure multer for memory storage (we'll handle file saving ourselves for security)
const createMulterConfig = (config: FileUploadConfig) => ({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSize,
    files: 1, // Single file uploads only
    fields: 10, // Limit form fields
    fieldSize: 1024 * 1024, // 1MB for field values
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Basic extension check (detailed validation happens later)
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (config.allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File extension ${ext} not allowed`));
    }
  }
});

/**
 * File upload validation middleware
 */
export const validateFileUpload = (policyName: string = 'default') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get upload policy
      const policy = await getFileUploadPolicy(policyName) || DEFAULT_FILE_CONFIG;

      // Configure multer with policy
      const upload = multer(createMulterConfig(policy)).single('file');

      // Handle multer upload
      upload(req, res, async (err) => {
        if (err) {
          logSecurityEvent('file_upload_error', (req as any).user?.id || null, {
            error: err.message,
            policy: policyName,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          }, 'medium');

          return res.status(400).json({
            code: 'file_upload_error',
            message: err.message,
            timestamp: new Date().toISOString()
          });
        }

        if (!req.file) {
          return res.status(400).json({
            code: 'no_file_provided',
            message: 'No file provided in upload',
            timestamp: new Date().toISOString()
          });
        }

        // Validate file content
        const validation = await validateFile(req.file.buffer, req.file.originalname, policy);
        req.fileValidation = validation;

        if (!validation.isValid) {
          // Log security event
          logSecurityEvent('file_validation_failed', (req as any).user?.id || null, {
            errors: validation.errors,
            warnings: validation.warnings,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            detectedMimeType: validation.detectedMimeType,
            shouldQuarantine: validation.shouldQuarantine,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          }, validation.shouldQuarantine ? 'high' : 'medium');

          return res.status(400).json({
            code: 'file_validation_failed',
            message: 'File validation failed',
            errors: validation.errors,
            warnings: validation.warnings,
            timestamp: new Date().toISOString()
          });
        }

        // File is valid, proceed
        next();
      });
    } catch (error) {
      console.error('File upload validation error:', error);
      res.status(500).json({
        code: 'server_error',
        message: 'File upload validation failed',
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * Rate limiting middleware for file uploads
 */
export const rateLimitFileUploads = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id || req.ip || 'anonymous';

      await uploadRateLimiter.consume(userId);
      next();
    } catch (rejRes: any) {
      logSecurityEvent('file_upload_rate_limited', (req as any).user?.id || null, {
        userId: (req as any).user?.id || req.ip,
        retryAfter: rejRes.msBeforeNext / 1000,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }, 'low');

      res.status(429).json({
        code: 'rate_limit_exceeded',
        message: 'File upload rate limit exceeded',
        retryAfter: Math.ceil(rejRes.msBeforeNext / 1000),
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * CSRF protection for file uploads
 */
export const csrfProtection = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // For file uploads, we can use a simpler CSRF check
    // In production, integrate with your main CSRF protection
    const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;

    if (!csrfToken) {
      logSecurityEvent('csrf_token_missing', (req as any).user?.id || null, {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }, 'medium');

      return res.status(403).json({
        code: 'csrf_token_missing',
        message: 'CSRF token required for file uploads',
        timestamp: new Date().toISOString()
      });
    }

    // In a real implementation, validate the token against session
    // For now, we'll just check if it exists
    next();
  };
};

/**
 * File processing and storage middleware
 */
export const processFileUpload = (policyName: string = 'default') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file || !req.fileValidation) {
      return next();
    }

    try {
      const userId = (req as any).user?.id || 'anonymous';
      const policy = await getFileUploadPolicy(policyName) || DEFAULT_FILE_CONFIG;
      const validation = req.fileValidation;

      let filePath: string;
      let status: string;

      if (validation.shouldQuarantine && policy.quarantineEnabled) {
        // Move to quarantine
        filePath = createQuarantinePath(req.file.originalname, policy);
        status = 'quarantined';

        logSecurityEvent('file_quarantined', userId, {
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileHash: validation.fileHash,
          reason: 'Security scan detected threats',
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }, 'high');
      } else {
        // Store normally
        filePath = createSecureFilePath(userId, req.file.originalname, policy);
        status = 'approved';
      }

      // Save file securely
      const saveResult = await saveFileSecurely(req.file.buffer, filePath, validation.fileHash);

      if (!saveResult.success) {
        logSecurityEvent('file_save_failed', userId, {
          fileName: req.file.originalname,
          error: saveResult.error,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }, 'high');

        return res.status(500).json({
          code: 'file_save_failed',
          message: 'Failed to save uploaded file',
          timestamp: new Date().toISOString()
        });
      }

      // Update request with file information
      req.file.path = filePath;
      req.fileValidation.filePath = filePath;
      req.fileValidation.status = status;

      // Log successful upload
      await logFileAccess(
        'temp', // Will be updated when asset is created
        userId,
        'upload',
        req.ip,
        req.get('User-Agent'),
        true,
        undefined,
        {
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileHash: validation.fileHash,
          mimeType: validation.detectedMimeType,
          status
        }
      );

      next();
    } catch (error) {
      console.error('File processing error:', error);
      res.status(500).json({
        code: 'file_processing_error',
        message: 'File processing failed',
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * Cleanup middleware for failed uploads
 */
export const cleanupFailedUploads = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    const originalSend = res.send;
    const originalStatus = res.status;

    // Track if response has been sent
    let responseSent = false;

    res.json = function(data: any) {
      responseSent = true;
      return originalJson.call(this, data);
    };

    res.send = function(data: any) {
      responseSent = true;
      return originalSend.call(this, data);
    };

    res.status = function(code: number) {
      // If setting an error status and we have a temp file, clean it up
      if (code >= 400 && req.file?.path) {
        fs.unlink(req.file.path).catch(err =>
          console.error('Failed to cleanup temp file:', err)
        );
      }
      return originalStatus.call(this, code);
    };

    // Call next middleware
    next();
  };
};

/**
 * Multipart form data validation middleware
 */
export const validateMultipartData = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Validate Content-Type
    const contentType = req.get('Content-Type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({
        code: 'invalid_content_type',
        message: 'Content-Type must be multipart/form-data for file uploads',
        timestamp: new Date().toISOString()
      });
    }

    // Check for suspicious multipart boundaries
    if (contentType.includes('boundary=')) {
      const boundary = contentType.split('boundary=')[1];
      if (boundary && /[<>'"]/.test(boundary)) {
        logSecurityEvent('suspicious_multipart_boundary', (req as any).user?.id || null, {
          boundary,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }, 'medium');

        return res.status(400).json({
          code: 'invalid_boundary',
          message: 'Invalid multipart boundary',
          timestamp: new Date().toISOString()
        });
      }
    }

    next();
  };
};

/**
 * Combined file upload middleware with all security features
 */
export const secureFileUpload = (policyName: string = 'default') => {
  return [
    authenticate, // Require authentication
    rateLimitFileUploads(), // Rate limiting
    csrfProtection(), // CSRF protection
    validateMultipartData(), // Multipart validation
    cleanupFailedUploads(), // Cleanup on failure
    validateFileUpload(policyName), // File validation
    processFileUpload(policyName) // File processing
  ];
};