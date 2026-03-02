/**
 * RVE Authentication & Authorization Service
 * Production-grade security with JWT, role-based access, and rate limiting
 */

import { blockchainService } from '../blockchain/contracts';
import { apiClient } from '../api/client';

// ============================================================================
// TYPES
// ============================================================================

export type UserRole = 'user' | 'custodian' | 'verifier' | 'admin';

export interface AuthUser {
  id: string;
  address: string;
  role: UserRole;
  verified: boolean;
  permissions: string[];
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  user: [
    'assets:read',
    'trading:execute',
    'governance:vote',
    'portfolio:read',
  ],
  custodian: [
    'assets:read',
    'assets:create',
    'trading:execute',
    'governance:vote',
    'portfolio:read',
    'reports:submit',
    'projects:manage',
  ],
  verifier: [
    'assets:read',
    'reports:read',
    'reports:verify',
    'oracle:access',
    'verification:execute',
  ],
  admin: [
    'assets:*',
    'trading:*',
    'governance:*',
    'reports:*',
    'users:*',
    'oracle:*',
    'system:*',
  ],
};

// ============================================================================
// AUTHENTICATION SERVICE
// ============================================================================

export class AuthService {
  private user: AuthUser | null = null;
  private tokens: AuthTokens | null = null;
  private refreshTimeout: NodeJS.Timeout | null = null;

  constructor() {
    // Try to restore session from localStorage on init
    this.restoreSession();
  }

  /**
   * Generate nonce for wallet signature
   */
  private generateNonce(): string {
    return `RVE-Auth-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Generate message to be signed
   */
  private generateAuthMessage(address: string, nonce: string): string {
    return `Welcome to Regenerative Value Exchange (RVE)

Sign this message to authenticate your wallet.

Address: ${address}
Nonce: ${nonce}
Timestamp: ${new Date().toISOString()}

This request will not trigger a blockchain transaction or cost any gas fees.`;
  }

  /**
   * Authenticate user with wallet signature
   */
  async login(walletProvider: 'metamask' | 'walletconnect' = 'metamask'): Promise<AuthUser> {
    try {
      // 1. Connect wallet
      const address = await blockchainService.connect(walletProvider);
      
      // 2. Generate nonce and message
      const nonce = this.generateNonce();
      const message = this.generateAuthMessage(address, nonce);

      // 3. Request signature from wallet
      const signature = await blockchainService.signMessage(message);

      // 4. Send to backend for verification
      const response = await apiClient.post<{ data: { token: string; user: AuthUser } }>('/auth/login', {
        address,
        signature,
        message,
      });

      // 5. Store tokens and user data
      this.user = response.data.user;
      this.tokens = {
        accessToken: response.data.token,
        refreshToken: response.data.token, // In production, backend should send separate refresh token
        expiresIn: 3600, // 1 hour
      };

      // 6. Set token in API client
      apiClient.setBearerToken(this.tokens.accessToken);

      // 7. Save to localStorage
      this.saveSession();

      // 8. Setup auto-refresh
      this.setupTokenRefresh();

      return this.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Clear refresh timeout
      if (this.refreshTimeout) {
        clearTimeout(this.refreshTimeout);
      }

      // Call logout endpoint
      await apiClient.post('/auth/logout', {});

      // Disconnect wallet
      await blockchainService.disconnect();

      // Clear local state
      this.clearSession();
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear local state anyway
      this.clearSession();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<void> {
    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiClient.post<{ data: { token: string } }>('/auth/refresh', {
        refreshToken: this.tokens.refreshToken,
      });

      this.tokens.accessToken = response.data.token;
      apiClient.setBearerToken(this.tokens.accessToken);

      this.saveSession();
      this.setupTokenRefresh();
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Force re-login
      this.clearSession();
      throw new Error('Session expired. Please login again.');
    }
  }

  /**
   * Setup automatic token refresh
   */
  private setupTokenRefresh(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    if (this.tokens) {
      // Refresh 5 minutes before expiration
      const refreshIn = (this.tokens.expiresIn - 300) * 1000;
      this.refreshTimeout = setTimeout(() => {
        this.refreshToken().catch(console.error);
      }, refreshIn);
    }
  }

  /**
   * Get current user
   */
  getUser(): AuthUser | null {
    return this.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.user !== null && this.tokens !== null;
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission: string): boolean {
    if (!this.user) return false;

    // Admin has all permissions
    if (this.user.role === 'admin') return true;

    const userPermissions = ROLE_PERMISSIONS[this.user.role] || [];

    // Check for wildcard permissions
    const [resource, action] = permission.split(':');
    return userPermissions.some(p => {
      if (p === permission) return true;
      if (p === `${resource}:*`) return true;
      return false;
    });
  }

  /**
   * Require permission (throws if not authorized)
   */
  requirePermission(permission: string): void {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    if (!this.hasPermission(permission)) {
      throw new Error(`Permission denied: ${permission}`);
    }
  }

  /**
   * Check if user has role
   */
  hasRole(role: UserRole): boolean {
    return this.user?.role === role;
  }

  /**
   * Save session to localStorage
   */
  private saveSession(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('rve_auth_user', JSON.stringify(this.user));
      localStorage.setItem('rve_auth_tokens', JSON.stringify(this.tokens));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  /**
   * Restore session from localStorage
   */
  private restoreSession(): void {
    if (typeof window === 'undefined') return;

    try {
      const userStr = localStorage.getItem('rve_auth_user');
      const tokensStr = localStorage.getItem('rve_auth_tokens');

      if (userStr && tokensStr) {
        this.user = JSON.parse(userStr);
        this.tokens = JSON.parse(tokensStr);

        if (this.tokens) {
          apiClient.setBearerToken(this.tokens.accessToken);
          this.setupTokenRefresh();
        }
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      this.clearSession();
    }
  }

  /**
   * Clear session
   */
  private clearSession(): void {
    this.user = null;
    this.tokens = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('rve_auth_user');
      localStorage.removeItem('rve_auth_tokens');
    }

    apiClient.clearAuth();
  }
}

// ============================================================================
// RATE LIMITING
// ============================================================================

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or create request history
    const requests = this.requests.get(key) || [];

    // Remove old requests
    const recentRequests = requests.filter(time => time > windowStart);

    // Check limit
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    return true;
  }

  /**
   * Get remaining requests
   */
  getRemaining(key: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const requests = this.requests.get(key) || [];
    const recentRequests = requests.filter(time => time > windowStart);

    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  /**
   * Clear rate limit for key
   */
  clear(key: string): void {
    this.requests.delete(key);
  }
}

// ============================================================================
// INPUT VALIDATION & SANITIZATION
// ============================================================================

export class InputValidator {
  /**
   * Validate Ethereum address
   */
  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Validate amount
   */
  static isValidAmount(amount: string | number): boolean {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return !isNaN(num) && num > 0 && isFinite(num);
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML
      .slice(0, 1000); // Limit length
  }

  /**
   * Validate email
   */
  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Validate URL
   */
  static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instances
export const authService = new AuthService();
export const rateLimiter = new RateLimiter();
