import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Custom format for console logging
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Custom format for file logging
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Daily rotate file transport for general logs
const dailyRotateTransport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
});

// Daily rotate file transport for error logs
const errorRotateTransport = new DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  format: fileFormat,
});

// Daily rotate file transport for security logs
const securityRotateTransport = new DailyRotateFile({
  filename: 'logs/security-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'info',
  maxSize: '20m',
  maxFiles: '90d', // Keep security logs longer
  format: fileFormat,
});

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // File transports
    dailyRotateTransport,
    errorRotateTransport,
    securityRotateTransport,
  ],
});
 
 // In production prefer structured JSON on stdout for log shipping
 if (process.env.NODE_ENV === 'production' || process.env.LOG_JSON === 'true') {
   logger.clear();
   logger.add(new winston.transports.Console({
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.json(),
       winston.format((info) => {
         info.service = process.env.SERVICE_NAME || 'atlas-backend';
         return info;
       })()
     )
   }));
 }

// Security-specific logger
export const securityLogger = {
  info: (message: string, meta?: any) => {
    logger.log('info', `[SECURITY] ${message}`, meta);
  },
  warn: (message: string, meta?: any) => {
    logger.log('warn', `[SECURITY] ${message}`, meta);
  },
  error: (message: string, meta?: any) => {
    logger.log('error', `[SECURITY] ${message}`, meta);
  },
  audit: (event: string, actorId?: string, details?: any) => {
    logger.log('info', `[AUDIT] ${event}`, {
      actorId,
      timestamp: new Date().toISOString(),
      ...details
    });
  }
};

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip || req.socket?.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
    };

    if (res.statusCode >= 400) {
      logger.warn(`HTTP ${res.statusCode} ${req.method} ${req.url}`, logData);
    } else {
      logger.http(`HTTP ${res.statusCode} ${req.method} ${req.url}`, logData);
    }
  });

  next();
};

// Audit logging function for security events
export const logSecurityEvent = (
  eventType: string,
  actorId: string | null,
  details: any,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
) => {
  const auditData = {
    eventType,
    actorId,
    details,
    severity,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent,
  };

  securityLogger.audit(eventType, actorId || undefined, auditData);

  // Log to database if available
  if ((global as any).dbQuery) {
    try {
      (global as any).dbQuery(
        'INSERT INTO security_audit_logs (event_type, actor_id, details, severity, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6)',
        [eventType, actorId, JSON.stringify(details), severity, details.ip, details.userAgent]
      ).catch((err: any) => {
        logger.error('Failed to log security event to database', { error: err.message, auditData });
      });
    } catch (err: any) {
      logger.error('Failed to log security event', { error: err.message, auditData });
    }
  }
};