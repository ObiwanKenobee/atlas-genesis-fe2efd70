import { body, param, query, validationResult } from 'express-validator';
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Express-validator middleware to handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      code: 'validation_error',
      message: 'Invalid input data',
      errors: errors.array().map(err => ({
        field: (err as any).path || (err as any).param || 'unknown',
        message: err.msg,
        type: err.type
      }))
    });
  }
  next();
};

// User registration validation
export const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('displayName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_.]+$/)
    .withMessage('Display name contains invalid characters'),
  handleValidationErrors
];

// User login validation
export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Project creation validation
export const validateProjectCreation = [
  body('title')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .isIn(['reforestation', 'conservation', 'sustainable_agriculture', 'renewable_energy', 'carbon_capture'])
    .withMessage('Invalid project category'),
  body('location')
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('targetAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Target amount must be a positive number'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date'),
  handleValidationErrors
];

// Payment validation
export const validatePayment = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP'])
    .withMessage('Invalid currency'),
  body('projectId')
    .isUUID()
    .withMessage('Invalid project ID'),
  body('paymentMethod')
    .optional()
    .isIn(['card', 'bank_transfer', 'crypto'])
    .withMessage('Invalid payment method'),
  handleValidationErrors
];

// Audit log validation
export const validateAuditLog = [
  body('eventType')
    .isLength({ min: 2, max: 50 })
    .withMessage('Event type must be between 2 and 50 characters'),
  body('payload')
    .isObject()
    .withMessage('Payload must be a valid object'),
  body('actorId')
    .optional()
    .isUUID()
    .withMessage('Actor ID must be a valid UUID'),
  handleValidationErrors
];

// Governance proposal validation
export const validateGovernanceProposal = [
  body('title')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),
  body('type')
    .isIn(['policy_change', 'funding_request', 'project_approval', 'system_update'])
    .withMessage('Invalid proposal type'),
  body('votingPeriod')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Voting period must be between 1 and 30 days'),
  handleValidationErrors
];

// Joi schemas for more complex validation
export const userProfileSchema = Joi.object({
  displayName: Joi.string().min(2).max(50).pattern(/^[a-zA-Z0-9\s\-_.]+$/).optional(),
  bio: Joi.string().max(500).optional(),
  location: Joi.string().max(100).optional(),
  website: Joi.string().uri().optional(),
  avatar: Joi.string().uri().optional(),
});

export const projectUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(2000).optional(),
  status: Joi.string().valid('draft', 'active', 'completed', 'cancelled').optional(),
  targetAmount: Joi.number().min(0).optional(),
  currentAmount: Joi.number().min(0).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().when('startDate', {
    is: Joi.exist(),
    then: Joi.date().greater(Joi.ref('startDate')).iso()
  }).optional(),
});

// Middleware to validate with Joi schemas
export const validateWithJoi = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        code: 'validation_error',
        message: 'Invalid input data',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }))
      });
    }
    next();
  };
};

// ID parameter validation
export const validateIdParam = [
  param('id')
    .isUUID()
    .withMessage('ID must be a valid UUID'),
  handleValidationErrors
];

// Query parameter validation for pagination
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['created_at', 'updated_at', 'title', 'amount'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  handleValidationErrors
];