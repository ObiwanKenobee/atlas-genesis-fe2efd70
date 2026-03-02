/**
 * Admin Authentication Service
 * 
 * Handles authentication for the admin dashboard with JWT tokens.
 */

import { hash, compare } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { query } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'atlas-genesis-super-secret-jwt-key-2024';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const SALT_ROUNDS = 12;

export interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  mfaEnabled: boolean;
  emailVerified: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const adminAuthService = {
  /**
   * Hash a password
   */
  async hashPassword(password: string): Promise<string> {
    return hash(password, SALT_ROUNDS);
  },

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  },

  /**
   * Generate JWT access token
   */
  generateAccessToken(user: AdminUser): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  /**
   * Generate JWT refresh token
   */
  generateRefreshToken(user: AdminUser): string {
    const payload = {
      id: user.id,
      type: 'refresh',
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
  },

  /**
   * Generate token pair
   */
  generateTokens(user: AdminUser): TokenPair {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  },

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { id: string; email: string; role: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    } catch (error) {
      return null;
    }
  },

  /**
   * Get admin user by email
   */
  async getUserByEmail(email: string): Promise<AdminUser | null> {
    try {
      const result = await query(
        `SELECT id, email, first_name, last_name, role, is_active, mfa_enabled 
         FROM admin_users 
         WHERE email = $1`,
        [email]
      );
      return result.rows[0] ? {
        id: result.rows[0].id,
        email: result.rows[0].email,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        role: result.rows[0].role,
        isActive: result.rows[0].is_active,
        mfaEnabled: result.rows[0].mfa_enabled,
        emailVerified: result.rows[0].email_verified ?? false,
      } : null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  },

  /**
   * Get admin user by ID
   */
  async getUserById(id: string): Promise<AdminUser | null> {
    try {
      const result = await query(
        `SELECT id, email, first_name, last_name, role, is_active, mfa_enabled 
         FROM admin_users 
         WHERE id = $1`,
        [id]
      );
      return result.rows[0] ? {
        id: result.rows[0].id,
        email: result.rows[0].email,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        role: result.rows[0].role,
        isActive: result.rows[0].is_active,
        mfaEnabled: result.rows[0].mfa_enabled,
        emailVerified: result.rows[0].email_verified ?? false,
      } : null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  },

  /**
   * Check if account is locked
   */
  async isAccountLocked(email: string): Promise<boolean> {
    try {
      const result = await query(
        `SELECT locked_until FROM admin_users WHERE email = $1`,
        [email]
      );
      if (result.rows[0]?.locked_until) {
        const lockedUntil = new Date(result.rows[0].locked_until);
        return lockedUntil > new Date();
      }
      return false;
    } catch (error) {
      console.error('Error checking account lock:', error);
      return false;
    }
  },

  /**
   * Record failed login attempt
   */
  async recordFailedAttempt(email: string): Promise<void> {
    try {
      await query(
        `UPDATE admin_users 
         SET login_attempts = login_attempts + 1,
             locked_until = CASE 
               WHEN login_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes'
               ELSE locked_until
             END
         WHERE email = $1`,
        [email]
      );
    } catch (error) {
      console.error('Error recording failed attempt:', error);
    }
  },

  /**
   * Reset login attempts on successful login
   */
  async resetLoginAttempts(userId: string): Promise<void> {
    try {
      await query(
        `UPDATE admin_users 
         SET login_attempts = 0, locked_until = NULL, last_login = NOW()
         WHERE id = $1`,
        [userId]
      );
    } catch (error) {
      console.error('Error resetting login attempts:', error);
    }
  },

  /**
   * Admin login
   */
  async login(email: string, password: string): Promise<{ token: string; user: AdminUser } | null> {
    // Check if account is locked
    if (await this.isAccountLocked(email)) {
      throw new Error('Account is temporarily locked. Please try again in 30 minutes.');
    }

    // Get user by email
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated. Please contact an administrator.');
    }

    // Get password hash from database
    try {
      const result = await query(
        `SELECT password_hash FROM admin_users WHERE id = $1`,
        [user.id]
      );

      if (!result.rows[0]) {
        throw new Error('Invalid email or password.');
      }

      // Verify password
      const isValid = await this.comparePassword(password, result.rows[0].password_hash);
      
      if (!isValid) {
        await this.recordFailedAttempt(email);
        throw new Error('Invalid email or password.');
      }

      // Reset login attempts on success
      await this.resetLoginAttempts(user.id);

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Store refresh token in database
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return { token: tokens.accessToken, user };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Store refresh token
   */
  async storeRefreshToken(userId: string, token: string): Promise<void> {
    try {
      const tokenHash = await hash(token, SALT_ROUNDS);
      await query(
        `INSERT INTO admin_sessions (user_id, token_hash, expires_at) 
         VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [userId, tokenHash]
      );
    } catch (error) {
      console.error('Error storing refresh token:', error);
    }
  },

  /**
   * Validate refresh token
   */
  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    try {
      const tokenHash = await hash(token, SALT_ROUNDS);
      const result = await query(
        `SELECT id FROM admin_sessions 
         WHERE user_id = $1 AND token_hash = $2 AND expires_at > NOW()`,
        [userId, tokenHash]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error validating refresh token:', error);
      return false;
    }
  },

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as { id: string; type: string };
      
      if (decoded.type !== 'refresh') {
        return null;
      }

      // Validate refresh token in database
      const isValid = await this.validateRefreshToken(decoded.id, refreshToken);
      if (!isValid) {
        return null;
      }

      // Get user
      const user = await this.getUserById(decoded.id);
      if (!user || !user.isActive) {
        return null;
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Store new refresh token (invalidate old one)
      await query(`DELETE FROM admin_sessions WHERE user_id = $1`, [user.id]);
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  },

  /**
   * Logout - invalidate refresh token
   */
  async logout(userId: string, refreshToken?: string): Promise<void> {
    try {
      if (refreshToken) {
        const tokenHash = await hash(refreshToken, SALT_ROUNDS);
        await query(
          `DELETE FROM admin_sessions WHERE user_id = $1 AND token_hash = $2`,
          [userId, tokenHash]
        );
      } else {
        await query(`DELETE FROM admin_sessions WHERE user_id = $1`, [userId]);
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  /**
   * Create admin user (for seeding)
   */
  async createUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string = 'admin'
  ): Promise<AdminUser> {
    const passwordHash = await this.hashPassword(password);
    
    const result = await query(
      `INSERT INTO admin_users (email, password_hash, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, first_name, last_name, role, is_active, mfa_enabled`,
      [email, passwordHash, firstName, lastName, role]
    );

    return {
      id: result.rows[0].id,
      email: result.rows[0].email,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      role: result.rows[0].role,
      isActive: result.rows[0].is_active,
      mfaEnabled: result.rows[0].mfa_enabled,
        emailVerified: result.rows[0].email_verified ?? false,
    };
  },

  /**
   * Seed default admin user
   */
  async seedDefaultAdmin(): Promise<AdminUser | null> {
    const defaultEmail = 'admin@atlas-genesis.com';
    
    try {
      // Check if admin already exists
      const existingUser = await this.getUserByEmail(defaultEmail);
      if (existingUser) {
        console.log('Default admin user already exists');
        return existingUser;
      }

      // Create default admin
      console.log('Creating default admin user...');
      return await this.createUser(
        defaultEmail,
        'admin123!', // Default password - should be changed on first login
        'System',
        'Administrator',
        'super_admin'
      );
    } catch (error) {
      console.error('Error seeding default admin:', error);
      return null;
    }
  },
};

export default adminAuthService;
