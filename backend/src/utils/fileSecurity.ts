import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';
import { logSecurityEvent } from './logger';
import { query } from '../db';

// File upload security configuration
export interface FileUploadConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  blockedPatterns: RegExp[];
  quarantineEnabled: boolean;
  scanEnabled: boolean;
  storagePath: string;
  tempPath: string;
}

// Default security configuration
export const DEFAULT_FILE_CONFIG: FileUploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/json'
  ],
  allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt', 'json'],
  blockedPatterns: [
    /\.(exe|bat|cmd|scr|pif|com)$/i,
    /<\?php/i,
    /<%/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i
  ],
  quarantineEnabled: true,
  scanEnabled: true,
  storagePath: path.join(process.cwd(), 'uploads'),
  tempPath: path.join(process.cwd(), 'temp')
};

// File validation result
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  detectedMimeType?: string;
  detectedExtension?: string;
  fileHash?: string;
  shouldQuarantine: boolean;
  filePath?: string;
  status?: string;
}

// Security threat levels
export enum ThreatLevel {
  CLEAN = 'clean',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Malware signatures (basic implementation - in production, use proper AV engine)
const MALWARE_SIGNATURES = [
  Buffer.from('4D5A', 'hex'), // MZ header (EXE)
  Buffer.from('CAFEBABE', 'hex'), // Java class
  Buffer.from('7F454C46', 'hex'), // ELF
  Buffer.from('23212F62696E2F62617368', 'hex'), // Shebang bash
  Buffer.from('3C3F706870', 'hex'), // <?php
  Buffer.from('3C736372697074', 'hex'), // <script
];

/**
 * Validates file name for security issues
 */
export function validateFileName(fileName: string): { isValid: boolean; sanitizedName: string; errors: string[] } {
  const errors: string[] = [];
  let sanitizedName = fileName;

  // Remove path traversal attempts
  sanitizedName = sanitizedName.replace(/(\.\.[\/\\])+/g, '');

  // Remove dangerous characters
  sanitizedName = sanitizedName.replace(/[<>:"|?*\x00-\x1f]/g, '');

  // Check for suspicious patterns
  if (sanitizedName !== fileName) {
    errors.push('File name contained suspicious characters');
  }

  // Check length
  if (sanitizedName.length > 255) {
    errors.push('File name too long');
    sanitizedName = sanitizedName.substring(0, 255);
  }

  // Check for hidden files
  if (sanitizedName.startsWith('.')) {
    errors.push('Hidden files not allowed');
  }

  return {
    isValid: errors.length === 0,
    sanitizedName,
    errors
  };
}

/**
 * Detects file type using magic numbers
 */
export async function detectFileType(buffer: Buffer, originalName: string): Promise<{
  mimeType?: string;
  extension?: string;
  confidence: number;
}> {
  try {
    const result = await fileTypeFromBuffer(buffer);
    if (result) {
      return {
        mimeType: result.mime,
        extension: result.ext,
        confidence: 1.0
      };
    }
  } catch (error) {
    // Fallback to extension-based detection
  }

  // Fallback: detect based on file extension
  const ext = path.extname(originalName).toLowerCase().replace('.', '');
  const mimeTypeMap: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'json': 'application/json'
  };

  return {
    mimeType: mimeTypeMap[ext],
    extension: ext,
    confidence: 0.5
  };
}

/**
 * Performs content-based malware scanning
 */
export function scanFileContent(buffer: Buffer): {
  threatLevel: ThreatLevel;
  threats: string[];
  confidence: number;
} {
  const threats: string[] = [];
  let threatLevel = ThreatLevel.CLEAN;
  let confidence = 0;

  // Check for known malware signatures
  for (const signature of MALWARE_SIGNATURES) {
    if (buffer.includes(signature)) {
      threats.push(`Detected malware signature: ${signature.toString('hex')}`);
      threatLevel = ThreatLevel.CRITICAL;
      confidence = 1.0;
    }
  }

  // Check for suspicious patterns in text files
  const content = buffer.toString('utf8', 0, Math.min(1024, buffer.length));

  if (content.includes('<?php')) {
    threats.push('PHP code detected in file');
    threatLevel = ThreatLevel.HIGH;
    confidence = Math.max(confidence, 0.9);
  }

  if (content.includes('<script')) {
    threats.push('Script tag detected');
    threatLevel = ThreatLevel.MEDIUM;
    confidence = Math.max(confidence, 0.7);
  }

  // Check for encoded content
  if (/[A-Za-z0-9+/]{100,}/.test(content)) {
    threats.push('Large base64/encoded content detected');
    threatLevel = ThreatLevel.MEDIUM;
    confidence = Math.max(confidence, 0.6);
  }

  return { threatLevel, threats, confidence };
}

/**
 * Generates file hash for integrity verification
 */
export function generateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Validates file against security configuration
 */
export async function validateFile(
  buffer: Buffer,
  originalName: string,
  config: FileUploadConfig = DEFAULT_FILE_CONFIG
): Promise<FileValidationResult> {
  const result: FileValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    shouldQuarantine: false
  };

  // Check file size
  if (buffer.length > config.maxFileSize) {
    result.errors.push(`File size ${buffer.length} exceeds maximum ${config.maxFileSize}`);
    result.isValid = false;
  }

  // Validate file name
  const nameValidation = validateFileName(originalName);
  if (!nameValidation.isValid) {
    result.errors.push(...nameValidation.errors);
    result.isValid = false;
  }

  // Detect file type
  const typeDetection = await detectFileType(buffer, originalName);
  result.detectedMimeType = typeDetection.mimeType;
  result.detectedExtension = typeDetection.extension;

  // Check MIME type
  if (typeDetection.mimeType && !config.allowedMimeTypes.includes(typeDetection.mimeType)) {
    result.errors.push(`MIME type ${typeDetection.mimeType} not allowed`);
    result.isValid = false;
  }

  // Check file extension
  const extension = path.extname(originalName).toLowerCase().replace('.', '');
  if (extension && !config.allowedExtensions.includes(extension)) {
    result.errors.push(`File extension ${extension} not allowed`);
    result.isValid = false;
  }

  // Check for blocked patterns
  const content = buffer.toString('utf8', 0, Math.min(1024, buffer.length));
  for (const pattern of config.blockedPatterns) {
    if (pattern.test(content) || pattern.test(originalName)) {
      result.errors.push(`File matches blocked pattern: ${pattern}`);
      result.isValid = false;
      result.shouldQuarantine = true;
    }
  }

  // Perform content scanning
  if (config.scanEnabled) {
    const scanResult = scanFileContent(buffer);
    if (scanResult.threatLevel !== ThreatLevel.CLEAN) {
      result.errors.push(`Security scan detected threats: ${scanResult.threats.join(', ')}`);
      result.isValid = false;
      result.shouldQuarantine = true;
    }
  }

  // Generate file hash
  result.fileHash = generateFileHash(buffer);

  // Additional warnings
  if (typeDetection.confidence < 0.8) {
    result.warnings.push('File type detection confidence is low');
  }

  return result;
}

/**
 * Creates secure file path with directory structure
 */
export function createSecureFilePath(userId: string, fileName: string, config: FileUploadConfig = DEFAULT_FILE_CONFIG): string {
  // Create directory structure: uploads/userId/year/month/day/
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const sanitizedName = validateFileName(fileName).sanitizedName;
  const randomPrefix = crypto.randomBytes(4).toString('hex');

  return path.join(
    config.storagePath,
    userId,
    String(year),
    month,
    day,
    `${randomPrefix}_${sanitizedName}`
  );
}

/**
 * Creates quarantine file path
 */
export function createQuarantinePath(fileName: string, config: FileUploadConfig = DEFAULT_FILE_CONFIG): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const sanitizedName = validateFileName(fileName).sanitizedName;

  return path.join(
    config.storagePath,
    'quarantine',
    `${timestamp}_${sanitizedName}`
  );
}

/**
 * Saves file securely with integrity verification
 */
export async function saveFileSecurely(
  buffer: Buffer,
  filePath: string,
  expectedHash?: string
): Promise<{ success: boolean; actualHash: string; error?: string }> {
  try {
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Write file
    await fs.writeFile(filePath, buffer);

    // Verify integrity
    const actualHash = generateFileHash(buffer);

    if (expectedHash && actualHash !== expectedHash) {
      // Integrity check failed - delete file
      await fs.unlink(filePath).catch(() => {});
      return {
        success: false,
        actualHash,
        error: 'File integrity check failed'
      };
    }

    return { success: true, actualHash };
  } catch (error) {
    return {
      success: false,
      actualHash: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Logs file access for security auditing
 */
export async function logFileAccess(
  assetId: string,
  userId: string | null,
  action: 'upload' | 'download' | 'delete' | 'access' | 'scan' | 'quarantine',
  ipAddress?: string,
  userAgent?: string,
  success: boolean = true,
  errorMessage?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await query(
      `INSERT INTO file_access_logs (asset_id, user_id, action, ip_address, user_agent, success, error_message, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [assetId, userId, action, ipAddress, userAgent, success, errorMessage, JSON.stringify(metadata || {})]
    );
  } catch (error) {
    // Log the logging failure but don't throw
    console.error('Failed to log file access:', error);
  }
}

/**
 * Gets file upload policy from database
 */
export async function getFileUploadPolicy(policyName: string = 'default'): Promise<FileUploadConfig | null> {
  try {
    const result = await query(
      'SELECT * FROM file_upload_policies WHERE name = $1 AND is_active = true',
      [policyName]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const policy = result.rows[0];
    return {
      maxFileSize: parseInt(policy.max_file_size),
      allowedMimeTypes: policy.allowed_mime_types || [],
      allowedExtensions: policy.allowed_extensions || [],
      blockedPatterns: (policy.blocked_patterns || []).map((p: string) => new RegExp(p, 'i')),
      quarantineEnabled: policy.quarantine_suspicious,
      scanEnabled: policy.require_scan,
      storagePath: DEFAULT_FILE_CONFIG.storagePath,
      tempPath: DEFAULT_FILE_CONFIG.tempPath
    };
  } catch (error) {
    console.error('Failed to load file upload policy:', error);
    return null;
  }
}