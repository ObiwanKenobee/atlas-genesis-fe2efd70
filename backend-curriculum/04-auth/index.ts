/**
 * Module 4: Authentication and Authorization
 * 
 * JWT, Password Hashing, OAuth2, RBAC implementation
 */

import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ============================================================================
// 4.1 PASSWORD SECURITY - Hashing and Verification
// ============================================================================

const SALT_ROUNDS = 12;

class PasswordService {
  /**
   * Hash a password using bcrypt
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }
  
  /**
   * Verify a password against a hash
   */
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  /**
   * Assess password strength
   */
  assessStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;
    
    // Length checks
    if (password.length >= 8) score += 1;
    else feedback.push("Password should be at least 8 characters");
    
    if (password.length >= 12) score += 1;
    
    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("Add lowercase letters");
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("Add uppercase letters");
    
    if (/[0-9]/.test(password)) score += 1;
    else feedback.push("Add numbers");
    
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push("Add special characters");
    
    // Common patterns check
    const commonPatterns = [
      "password", "123456", "qwerty", "admin", "welcome"
    ];
    
    if (commonPatterns.some(pattern => 
      password.toLowerCase().includes(pattern)
    )) {
      score = 0;
      feedback.push("Password contains common patterns");
    }
    
    return {
      score: Math.min(score, 5),
      feedback,
      isStrong: score >= 4
    };
  }
  
  /**
   * Generate a secure random password
   */
  generateRandom(length: number = 16): string {
    const charset = 
      "abcdefghijklmnopqrstuvwxyz" +
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
      "0123456789" +
      "!@#$%^&*()_+-=[]{}|;:,.<>?";
    
    const values = crypto.getRandomValues(new Uint8Array(length));
    
    return Array.from(values, (byte) => charset[byte % charset.length])
      .join("");
  }
}

// ============================================================================
// 4.2 JWT AUTHENTICATION - Token Management
// ============================================================================

interface TokenPayload {
  sub: string;          // User ID
  email: string;
  role: string;
  permissions: string[];
  type: "access" | "refresh";
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

class JWTService {
  private accessSecret: string;
  private refreshSecret: string;
  private accessExpiresIn: string = "15m";
  private refreshExpiresIn: string = "7d";
  
  // In-memory store for refresh tokens (use Redis in production)
  private refreshTokenStore: Map<string, {
    userId: string;
    expiresAt: Date;
    revoked: boolean;
  }> = new Map();
  
  constructor() {
    this.accessSecret = process.env.JWT_ACCESS_SECRET ?? "access-secret-key";
    this.refreshSecret = process.env.JWT_REFRESH_SECRET ?? "refresh-secret-key";
  }
  
  /**
   * Generate access token
   */
  generateAccessToken(payload: Omit<TokenPayload, "type">): { token: string; expiresIn: number } {
    const expiresInSeconds = this.parseExpiresIn(this.accessExpiresIn);
    
    const token = jwt.sign(
      {
        ...payload,
        type: "access"
      },
      this.accessSecret,
      {
        expiresIn: this.accessExpiresIn,
        issuer: "atlas-api",
        audience: "atlas-users"
      }
    );
    
    return { token, expiresIn: expiresInSeconds };
  }
  
  /**
   * Generate refresh token
   */
  async generateRefreshToken(userId: string): Promise<string> {
    const tokenId = crypto.randomUUID();
    const expiresAt = new Date(
      Date.now() + this.parseExpiresIn(this.refreshExpiresIn) * 1000
    );
    
    const token = jwt.sign(
      {
        sub: userId,
        type: "refresh",
        jti: tokenId
      },
      this.refreshSecret,
      {
        expiresIn: this.refreshExpiresIn,
        issuer: "atlas-api"
      }
    );
    
    this.refreshTokenStore.set(tokenId, {
      userId,
      expiresAt,
      revoked: false
    });
    
    return token;
  }
  
  /**
   * Generate complete token pair
   */
  async generateTokenPair(payload: Omit<TokenPayload, "type">): Promise<TokenPair> {
    const { token: accessToken, expiresIn } = this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload.sub);
    
    return {
      accessToken,
      refreshToken,
      expiresIn
    };
  }
  
  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.accessSecret, {
        issuer: "atlas-api",
        audience: "atlas-users"
      }) as TokenPayload;
    } catch {
      return null;
    }
  }
  
  /**
   * Verify refresh token
   */
  async verifyRefreshToken(token: string): Promise<{
    userId: string;
    tokenId: string;
  } | null> {
    try {
      const payload = jwt.verify(token, this.refreshSecret, {
        issuer: "atlas-api"
      }) as { sub: string; jti: string; type: "refresh" };
      
      const tokenData = this.refreshTokenStore.get(payload.jti);
      
      if (!tokenData || tokenData.revoked) {
        return null;
      }
      
      if (new Date() > tokenData.expiresAt) {
        this.refreshTokenStore.delete(payload.jti);
        return null;
      }
      
      return {
        userId: payload.sub,
        tokenId: payload.jti
      };
    } catch {
      return null;
    }
  }
  
  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair | null> {
    const verification = await this.verifyRefreshToken(refreshToken);
    
    if (!verification) {
      return null;
    }
    
    // Revoke old refresh token
    this.revokeRefreshToken(verification.tokenId);
    
    // Generate new token pair
    return this.generateTokenPair({
      sub: verification.userId,
      email: "",
      role: "user",
      permissions: []
    });
  }
  
  /**
   * Revoke a refresh token
   */
  revokeRefreshToken(tokenId: string): void {
    const tokenData = this.refreshTokenStore.get(tokenId);
    if (tokenData) {
      tokenData.revoked = true;
    }
  }
  
  /**
   * Revoke all tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    for (const [tokenId, data] of this.refreshTokenStore) {
      if (data.userId === userId) {
        data.revoked = true;
      }
    }
  }
  
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case "s": return value;
      case "m": return value * 60;
      case "h": return value * 3600;
      case "d": return value * 86400;
      default: return 900;
    }
  }
}

// ============================================================================
// 4.3 ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================================================

const PERMISSIONS = {
  // User permissions
  USER_READ: "user:read",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  USER_MANAGE_ROLES: "user:manage_roles",
  
  // Order permissions
  ORDER_READ: "order:read",
  ORDER_CREATE: "order:create",
  ORDER_UPDATE: "order:update",
  ORDER_CANCEL: "order:cancel",
  
  // Product permissions
  PRODUCT_READ: "product:read",
  PRODUCT_CREATE: "product:create",
  PRODUCT_UPDATE: "product:update",
  PRODUCT_DELETE: "product:delete",
  
  // Admin permissions
  ADMIN_DASHBOARD: "admin:dashboard",
  ADMIN_SETTINGS: "admin:settings",
  ADMIN_AUDIT_LOGS: "admin:audit_logs"
} as const;

type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

const ROLES = {
  USER: {
    name: "user",
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.ORDER_READ,
      PERMISSIONS.ORDER_CREATE,
      PERMISSIONS.PRODUCT_READ
    ]
  },
  MODERATOR: {
    name: "moderator",
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.ORDER_READ,
      PERMISSIONS.ORDER_UPDATE,
      PERMISSIONS.PRODUCT_READ,
      PERMISSIONS.PRODUCT_UPDATE
    ]
  },
  ADMIN: {
    name: "admin",
    permissions: Object.values(PERMISSIONS)
  }
} as const;

type RoleName = keyof typeof ROLES;

class RBACService {
  private rolePermissions: Map<string, Set<Permission>> = new Map();
  private userRoles: Map<string, string[]> = new Map();
  
  constructor() {
    for (const role of Object.values(ROLES)) {
      this.rolePermissions.set(role.name, new Set(role.permissions));
    }
  }
  
  /**
   * Assign a role to a user
   */
  assignRole(userId: string, roleName: string): void {
    const userRoles = this.userRoles.get(userId) ?? [];
    
    if (!userRoles.includes(roleName)) {
      userRoles.push(roleName);
      this.userRoles.set(userId, userRoles);
    }
  }
  
  /**
   * Remove a role from a user
   */
  removeRole(userId: string, roleName: string): void {
    const userRoles = this.userRoles.get(userId) ?? [];
    const index = userRoles.indexOf(roleName);
    
    if (index > -1) {
      userRoles.splice(index, 1);
      this.userRoles.set(userId, userRoles);
    }
  }
  
  /**
   * Check if user has a specific permission
   */
  hasPermission(userId: string, permission: Permission): boolean {
    const userRoles = this.userRoles.get(userId) ?? [];
    
    for (const roleName of userRoles) {
      const permissions = this.rolePermissions.get(roleName);
      if (permissions?.has(permission)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(userId: string, permissions: Permission[]): boolean {
    return permissions.some(p => this.hasPermission(userId, p));
  }
  
  /**
   * Check if user has all specified permissions
   */
  hasAllPermissions(userId: string, permissions: Permission[]): boolean {
    return permissions.every(p => this.hasPermission(userId, p));
  }
  
  /**
   * Check if user has a specific role
   */
  hasRole(userId: string, roleName: string): boolean {
    return (this.userRoles.get(userId) ?? []).includes(roleName);
  }
  
  /**
   * Get all permissions for a user
   */
  getUserPermissions(userId: string): Permission[] {
    const userRoles = this.userRoles.get(userId) ?? [];
    const permissions = new Set<Permission>();
    
    for (const roleName of userRoles) {
      const rolePerms = this.rolePermissions.get(roleName);
      if (rolePerms) {
        rolePerms.forEach(p => permissions.add(p));
      }
    }
    
    return Array.from(permissions);
  }
  
  /**
   * Create a custom role
   */
  createRole(roleName: string, permissions: Permission[]): void {
    this.rolePermissions.set(roleName, new Set(permissions));
  }
  
  /**
   * Update role permissions
   */
  updateRolePermissions(roleName: string, permissions: Permission[]): void {
    this.rolePermissions.set(roleName, new Set(permissions));
  }
}

// ============================================================================
// 4.4 MIDDLEWARE FACTORIES
// ============================================================================

import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/**
 * Authentication middleware
 */
function authenticate(
  jwtService: JWTService
) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "No token provided" }
      });
      return;
    }
    
    const token = authHeader.slice(7);
    const payload = jwtService.verifyAccessToken(token);
    
    if (!payload) {
      res.status(401).json({
        success: false,
        error: { code: "INVALID_TOKEN", message: "Token invalid or expired" }
      });
      return;
    }
    
    req.user = payload;
    next();
  };
}

/**
 * Authorization middleware factory
 */
function authorize(
  rbac: RBACService,
  ...permissions: Permission[]
) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" }
      });
      return;
    }
    
    if (!rbac.hasAnyPermission(user.sub, permissions)) {
      res.status(403).json({
        success: false,
        error: { 
          code: "FORBIDDEN", 
          message: "Insufficient permissions",
          required: permissions
        }
      });
      return;
    }
    
    next();
  };
}

/**
 * Role-based authorization middleware
 */
function requireRole(
  rbac: RBACService,
  ...roles: RoleName[]
) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" }
      });
      return;
    }
    
    const hasRequiredRole = roles.some(role => 
      rbac.hasRole(user.sub, role)
    );
    
    if (!hasRequiredRole) {
      res.status(403).json({
        success: false,
        error: { 
          code: "FORBIDDEN", 
          message: "Role not authorized",
          required: roles
        }
      });
      return;
    }
    
    next();
  };
}

// ============================================================================
// EXERCISES
// ============================================================================

/**
 * Exercise 4.1: Complete AuthService implementation
 */
class AuthService {
  private passwordService: PasswordService;
  private jwtService: JWTService;
  private rbac: RBACService;
  
  constructor() {
    this.passwordService = new PasswordService();
    this.jwtService = new JWTService();
    this.rbac = new RBACService();
  }
  
  async register(
    email: string,
    password: string,
    username: string
  ): Promise<TokenPair> {
    // Validate password strength
    const strength = this.passwordService.assessStrength(password);
    if (!strength.isStrong) {
      throw new Error(`Password too weak: ${strength.feedback.join(", ")}`);
    }
    
    // Hash password
    const passwordHash = await this.passwordService.hash(password);
    
    // Create user (pseudo-code - would use repository)
    const userId = crypto.randomUUID();
    
    // Assign default role
    this.rbac.assignRole(userId, "user");
    
    // Generate tokens
    return this.jwtService.generateTokenPair({
      sub: userId,
      email,
      role: "user",
      permissions: this.rbac.getUserPermissions(userId)
    });
  }
  
  async login(
    email: string,
    password: string
  ): Promise<TokenPair | null> {
    // Get user by email (pseudo-code)
    // const user = await userRepository.findByEmail(email);
    // if (!user) return null;
    
    // Verify password
    // const isValid = await this.passwordService.verify(password, user.passwordHash);
    // if (!isValid) return null;
    
    // Generate tokens
    return this.jwtService.generateTokenPair({
      sub: "user-id",
      email,
      role: "user",
      permissions: []
    });
  }
  
  async refresh(refreshToken: string): Promise<TokenPair | null> {
    return this.jwtService.refreshTokens(refreshToken);
  }
  
  async logout(refreshToken: string): Promise<void> {
    const verification = await this.jwtService.verifyRefreshToken(refreshToken);
    if (verification) {
      this.jwtService.revokeRefreshToken(verification.tokenId);
    }
  }
  
  checkPermission(userId: string, permission: Permission): boolean {
    return this.rbac.hasPermission(userId, permission);
  }
}

// ============================================================================
// TESTS
// ============================================================================

describe("Module 4: Authentication and Authorization", () => {
  let passwordService: PasswordService;
  let jwtService: JWTService;
  let rbac: RBACService;
  
  beforeEach(() => {
    passwordService = new PasswordService();
    jwtService = new JWTService();
    rbac = new RBACService();
  });
  
  describe("Password Service", () => {
    test("hash creates a bcrypt hash", async () => {
      const password = "SecurePassword123!";
      const hash = await passwordService.hash(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith("$2b$")).toBe(true);
    });
    
    test("verify validates correct password", async () => {
      const password = "SecurePassword123!";
      const hash = await passwordService.hash(password);
      
      const isValid = await passwordService.verify(password, hash);
      expect(isValid).toBe(true);
    });
    
    test("verify rejects incorrect password", async () => {
      const password = "SecurePassword123!";
      const hash = await passwordService.hash(password);
      
      const isValid = await passwordService.verify("WrongPassword123!", hash);
      expect(isValid).toBe(false);
    });
    
    test("assessStrength returns feedback", () => {
      const result = passwordService.assessStrength("weak");
      
      expect(result.score).toBeLessThan(4);
      expect(result.feedback.length).toBeGreaterThan(0);
      expect(result.isStrong).toBe(false);
    });
    
    test("strong password passes assessment", () => {
      const result = passwordService.assessStrength("SecurePassword123!");
      
      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.isStrong).toBe(true);
    });
  });
  
  describe("JWT Service", () => {
    test("generateAccessToken creates a valid token", () => {
      const { token, expiresIn } = jwtService.generateAccessToken({
        sub: "user-123",
        email: "test@example.com",
        role: "user",
        permissions: []
      });
      
      expect(token).toBeDefined();
      expect(expiresIn).toBe(900); // 15 minutes
    });
    
    test("verifyAccessToken validates token", () => {
      const { token } = jwtService.generateAccessToken({
        sub: "user-123",
        email: "test@example.com",
        role: "user",
        permissions: []
      });
      
      const payload = jwtService.verifyAccessToken(token);
      
      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe("user-123");
      expect(payload?.type).toBe("access");
    });
    
    test("verifyAccessToken returns null for invalid token", () => {
      const payload = jwtService.verifyAccessToken("invalid-token");
      
      expect(payload).toBeNull();
    });
  });
  
  describe("RBAC Service", () => {
    test("assignRole adds role to user", () => {
      rbac.assignRole("user-123", "user");
      
      expect(rbac.hasRole("user-123", "user")).toBe(true);
    });
    
    test("hasPermission checks permissions", () => {
      rbac.assignRole("user-123", "user");
      
      expect(rbac.hasPermission("user-123", "user:read")).toBe(true);
      expect(rbac.hasPermission("user-123", "admin:dashboard")).toBe(false);
    });
    
    test("admin has all permissions", () => {
      rbac.assignRole("user-123", "admin");
      
      expect(rbac.hasPermission("user-123", "user:delete")).toBe(true);
      expect(rbac.hasPermission("user-123", "admin:audit_logs")).toBe(true);
    });
  });
});

export { 
  PasswordService, 
  JWTService, 
  RBACService,
  AuthService,
  authenticate,
  authorize,
  requireRole,
  PERMISSIONS
};
