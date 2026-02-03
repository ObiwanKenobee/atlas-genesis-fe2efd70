import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email().max(254);
export const passwordSchema = z.string().min(8).max(128).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');
export const uuidSchema = z.string().uuid();
export const idSchema = z.string().regex(/^[a-zA-Z0-9_-]+$/, 'Invalid ID format');
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc')
}).strict();

// User schemas
// Enhanced user creation with role-based onboarding
export const userCreateSchema = z.object({
  email: emailSchema.optional(),
  phoneNumber: z.string().min(10).max(15).optional(),
  displayName: z.string().min(2).max(100),
  password: passwordSchema.optional(),
  role: z.enum(['producer', 'investor', 'institution', 'researcher', 'admin', 'moderator']).default('producer'),
  emailVerified: z.boolean().default(false),
  phoneVerified: z.boolean().default(false)
});

// Role-specific onboarding schemas
export const producerOnboardingSchema = z.object({
  locationType: z.enum(['land', 'ocean', 'forest']),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().max(500).optional()
  }),
  verificationPhoto: z.string().url().optional()
});

export const investorOnboardingSchema = z.object({
  investmentIntent: z.enum(['climate', 'health', 'oceans', 'mixed']),
  riskProfile: z.object({
    timeHorizon: z.enum(['short', 'medium', 'long']),
    returnPreference: z.enum(['impact', 'balanced', 'financial'])
  }),
  investmentAmount: z.number().positive().optional()
});

export const institutionOnboardingSchema = z.object({
  institutionType: z.enum(['government', 'ngo', 'enterprise', 'academic']),
  jurisdiction: z.string().min(2).max(100),
  governanceMode: z.enum(['observer', 'participant', 'steward']),
  officialEmail: emailSchema
});

export const researcherOnboardingSchema = z.object({
  researchPurpose: z.enum(['learn', 'teach', 'research', 'build']),
  accessLevel: z.enum(['open', 'limited', 'advanced']),
  fieldOfStudy: z.string().min(2).max(100).optional(),
  institution: z.string().min(2).max(100).optional()
});

export const userUpdateSchema = z.object({
  email: emailSchema.optional(),
  phoneNumber: z.string().min(10).max(15).optional(),
  displayName: z.string().min(2).max(100).optional(),
  role: z.enum(['producer', 'investor', 'institution', 'researcher', 'admin', 'moderator']).optional(),
  emailVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
  accountLocked: z.boolean().optional(),
  profileData: z.record(z.string(), z.any()).optional(),
  preferences: z.record(z.string(), z.any()).optional()
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
  rememberMe: z.boolean().default(false)
});

// Project schemas
export const projectCreateSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  category: z.enum(['reforestation', 'conservation', 'renewable_energy', 'carbon_capture', 'sustainable_agriculture']),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().max(500)
  }),
  targetAmount: z.number().positive(),
  duration: z.number().int().min(1).max(365), // days
  images: z.array(z.string().url()).max(10).optional(),
  documents: z.array(z.string()).max(5).optional()
});

export const projectUpdateSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).max(5000).optional(),
  status: z.enum(['draft', 'active', 'funded', 'completed', 'cancelled']).optional(),
  images: z.array(z.string().url()).max(10).optional(),
  documents: z.array(z.string()).max(5).optional()
});

// Marketplace schemas
export const marketplaceFilterSchema = z.object({
  category: z.enum(['reforestation', 'conservation', 'renewable_energy', 'carbon_capture', 'sustainable_agriculture']).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().max(1000000).optional(),
  location: z.string().max(100).optional(),
  status: z.enum(['active', 'funded', 'completed']).optional(),
  sort: z.enum(['price', 'rating', 'createdAt', 'fundedAmount']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc')
});

// Measurement schemas
export const measurementCreateSchema = z.object({
  projectId: uuidSchema,
  type: z.enum(['carbon', 'biodiversity', 'water', 'soil']),
  value: z.number(),
  unit: z.string().max(20),
  timestamp: z.string().datetime(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

// Payment schemas
export const paymentCreateSchema = z.object({
  projectId: uuidSchema,
  amount: z.number().positive().max(100000),
  currency: z.string().length(3).default('USD'),
  paymentMethod: z.enum(['card', 'bank_transfer', 'crypto']),
  metadata: z.record(z.string(), z.any()).optional()
});

// Audit schemas
export const auditQuerySchema = z.object({
  userId: uuidSchema.optional(),
  action: z.string().max(100).optional(),
  resource: z.string().max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional()
});

// API Key schemas
export const apiKeyCreateSchema = z.object({
  name: z.string().min(3).max(50),
  permissions: z.array(z.enum(['read', 'write', 'admin'])),
  expiresAt: z.string().datetime().optional(),
  rateLimit: z.number().int().min(1).max(10000).default(1000)
});

// File upload schemas
export const fileUploadSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  type: z.enum(['document', 'image', 'video', 'audio', 'archive', 'other']).default('other'),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string().max(50)).max(10).optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

export const fileUploadQuerySchema = z.object({
  type: z.enum(['document', 'image', 'video', 'audio', 'archive', 'other']).optional(),
  status: z.enum(['pending', 'processing', 'quarantined', 'approved', 'rejected']).optional(),
  isPublic: z.boolean().optional(),
  ownerId: uuidSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const fileAccessLogSchema = z.object({
  assetId: uuidSchema,
  action: z.enum(['upload', 'download', 'delete', 'access', 'scan', 'quarantine']),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  success: z.boolean().default(true),
  errorMessage: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

export const fileScanResultSchema = z.object({
  assetId: uuidSchema,
  scannerName: z.string().min(1).max(100),
  scanVersion: z.string().max(50).optional(),
  threatLevel: z.enum(['clean', 'low', 'medium', 'high', 'critical']),
  threatsFound: z.array(z.string()).optional(),
  scanMetadata: z.record(z.string(), z.any()).optional()
});

export const fileUploadPolicySchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  maxFileSize: z.number().int().positive(),
  allowedMimeTypes: z.array(z.string()),
  allowedExtensions: z.array(z.string()),
  blockedPatterns: z.array(z.string()).optional(),
  rateLimitRequests: z.number().int().min(1).max(1000).default(10),
  rateLimitWindowMinutes: z.number().int().min(1).max(1440).default(60),
  quarantineSuspicious: z.boolean().default(true),
  requireScan: z.boolean().default(true),
  isActive: z.boolean().default(true)
});

// Schema registry for automatic validation
export interface RouteSchema {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
  response?: z.ZodSchema;
}

export const routeSchemas: Record<string, RouteSchema> = {
  // Auth routes
  'POST /api/auth/register': { body: userCreateSchema },
  'POST /api/auth/login': { body: loginSchema },
  'PUT /api/auth/profile': { body: userUpdateSchema },

  // V2 Auth routes
  'POST /api/v2/auth/register': { body: userCreateSchema },
  'POST /api/v2/auth/login': { body: loginSchema },
  'PUT /api/v2/auth/profile': { body: userUpdateSchema },

  // Project routes
  'POST /api/v2/projects': { body: projectCreateSchema },
  'PUT /api/v2/projects/:id': {
    params: z.object({ id: uuidSchema }),
    body: projectUpdateSchema
  },
  'GET /api/v2/projects': { query: marketplaceFilterSchema.omit({ sort: true, order: true }).merge(paginationSchema) },
  'GET /api/v2/projects/:id': { params: z.object({ id: uuidSchema }) },

  // Marketplace routes
  'GET /api/marketplace': { query: marketplaceFilterSchema.merge(paginationSchema) },
  'GET /api/v2/marketplace': { query: marketplaceFilterSchema.merge(paginationSchema) },

  // Measurement routes
  'POST /api/measurements': { body: measurementCreateSchema },
  'POST /api/v2/measurements': { body: measurementCreateSchema },
  'GET /api/measurements': { query: paginationSchema },
  'GET /api/v2/measurements': { query: paginationSchema },

  // Payment routes
  'POST /api/payments': { body: paymentCreateSchema },

  // Audit routes
  'GET /api/audit': { query: auditQuerySchema.merge(paginationSchema) },
  'GET /api/audit-public': { query: auditQuerySchema.merge(paginationSchema) },

  // Security routes
  'POST /api/security/api-keys': { body: apiKeyCreateSchema },

  // File upload routes
  'POST /api/assets/upload': { body: fileUploadSchema },
  'GET /api/assets': { query: fileUploadQuerySchema },
  'GET /api/assets/:id': { params: z.object({ id: uuidSchema }) },
  'DELETE /api/assets/:id': { params: z.object({ id: uuidSchema }) },
  'GET /api/assets/:id/download': { params: z.object({ id: uuidSchema }) },
  'POST /api/assets/:id/scan': { params: z.object({ id: uuidSchema }) },
  'POST /api/admin/file-policies': { body: fileUploadPolicySchema },
  'GET /api/admin/file-access-logs': { query: paginationSchema.merge(z.object({
    assetId: uuidSchema.optional(),
    userId: uuidSchema.optional(),
    action: z.enum(['upload', 'download', 'delete', 'access', 'scan', 'quarantine']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  })) }
};

// Helper function to get schema for a route
export const getRouteSchema = (method: string, path: string): RouteSchema | null => {
  // Normalize path by removing query parameters and trailing slashes
  const normalizedPath = path.split('?')[0].replace(/\/$/, '');

  // Try exact match first
  const exactKey = `${method} ${normalizedPath}`;
  if (routeSchemas[exactKey]) {
    return routeSchemas[exactKey];
  }

  // Try pattern matching for parameterized routes
  for (const [pattern, schema] of Object.entries(routeSchemas)) {
    const [patternMethod, patternPath] = pattern.split(' ');
    if (patternMethod !== method) continue;

    // Convert pattern to regex (e.g., /api/projects/:id -> /api/projects/[^/]+)
    const regexPattern = patternPath.replace(/:([^/]+)/g, '[^/]+');
    const regex = new RegExp(`^${regexPattern}$`);

    if (regex.test(normalizedPath)) {
      return schema;
    }
  }

  return null;
};

// Response schemas for common API responses
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  message: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number()
  }).optional()
});

export const errorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  timestamp: z.string().datetime(),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
    code: z.string()
  })).optional()
});