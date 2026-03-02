/**
 * Security Headers Middleware
 * 
 * Comprehensive security header configuration for protection against common attacks.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// ============================================================================
// Security Headers
// ============================================================================

export interface SecurityHeadersOptions {
  /** Content Security Policy */
  csp?: {
    enabled: boolean;
    directives?: Record<string, string[]>;
    reportUri?: string;
  };
  /** HSTS options */
  hsts?: {
    enabled: boolean;
    maxAge: number;           // seconds
    includeSubDomains: boolean;
    preload: boolean;
  };
  /** Additional headers */
  additionalHeaders?: Record<string, string>;
}

const defaultOptions: SecurityHeadersOptions = {
  csp: {
    enabled: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"], // Allow inline scripts for now
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
      'frame-ancestors': ["'none'"],
      'form-action': ["'self'"],
      'base-uri': ["'self'"]
    }
  },
  hsts: {
    enabled: true,
    maxAge: 31536000,         // 1 year
    includeSubDomains: true,
    preload: true
  }
};

// ============================================================================
// Middleware Factory
// ============================================================================

export function createSecurityHeaders(options: SecurityHeadersOptions = {}) {
  const config = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction): void => {
    // Prevent XSS attacks
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Control referrer information
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Control browser features
    res.setHeader('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');
    
    // DNS prefetch control
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    
    // Transport layer security
    if (config.hsts?.enabled && req.secure) {
      let hstsValue = `max-age=${config.hsts.maxAge}`;
      if (config.hsts.includeSubDomains) {
        hstsValue += '; includeSubDomains';
      }
      if (config.hsts.preload) {
        hstsValue += '; preload';
      }
      res.setHeader('Strict-Transport-Security', hstsValue);
    }
    
    // Content Security Policy
    if (config.csp?.enabled) {
      const cspValue = buildCSPValue(config.csp.directives!);
      res.setHeader('Content-Security-Policy', cspValue);
      
      // Report CSP violations
      if (config.csp.reportUri) {
        res.setHeader('Content-Security-Policy-Report-Only', 
          buildCSPValue({ ...config.csp.directives, 'report-uri': [config.csp.reportUri] })
        );
      }
    }
    
    // Cross-Origin policies
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    
    // Cache control for sensitive pages
    if (req.path.includes('/auth/') || req.path.includes('/admin/')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
    }
    
    // Custom additional headers
    if (config.additionalHeaders) {
      for (const [key, value] of Object.entries(config.additionalHeaders)) {
        res.setHeader(key, value);
      }
    }
    
    next();
  };
}

/**
 * Build CSP header value from directives
 */
function buildCSPValue(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .map(([directive, sources]) => {
      // Handle special sources
      const formattedSources = sources.map(source => {
        if (source === "'self'") return "'self'";
        if (source === "'none'") return "'none'";
        if (source === "'unsafe-inline'") return "'unsafe-inline'";
        if (source === "'unsafe-eval'") return "'unsafe-eval'";
        if (source.startsWith("'nonce-")) return source;
        if (source.startsWith("'sha256-")) return source;
        if (source === 'data:') return 'data:';
        if (source === 'https:') return 'https:';
        if (source === 'http:') return 'http:';
        if (source === '*') return '*';
        return source;
      });
      return `${directive} ${formattedSources.join(' ')}`;
    })
    .join('; ');
}

// ============================================================================
// CSP Nonce Generator
// ============================================================================

/**
 * Generate a nonce for CSP
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Middleware to add nonce to request
 */
export const cspNonce = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.locals.nonce = generateNonce();
  next();
};

// ============================================================================
// Request ID
// ============================================================================

export function requestId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const id = req.headers['x-request-id'] || 
            `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  
  res.setHeader('X-Request-ID', id);
  res.locals.requestId = id;
  next();
}

// ============================================================================
// No Sniff
// ============================================================================

export const noSniff = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
};

// ============================================================================
// Iframe Protection
// ============================================================================

export const iframeProtection = (
  req: Request,
  res: Response,
  option: 'DENY' | 'SAMEORIGIN' = 'DENY'
): Response => {
  res.setHeader('X-Frame-Options', option);
  return res;
};

// ============================================================================
// Export default security headers middleware
// ============================================================================

export const securityHeaders = createSecurityHeaders();
