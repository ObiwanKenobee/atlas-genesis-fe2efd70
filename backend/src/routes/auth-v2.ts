import express, { Request, Response } from 'express';
import passport from '../config/passport';
import { query } from '../db';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  createRefreshToken,
  revokeRefreshToken,
  findRefreshToken,
  createEmailVerificationToken,
  verifyEmailToken,
  createPasswordResetToken,
  verifyPasswordResetToken,
  createUserSession,
  verifyRefreshToken
} from '../utils/auth';
import { emailService } from '../services/email';
import { authenticate, requireEmailVerification, checkLoginAttempts, resetLoginAttempts, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Sign Up
router.post('/signup', async (req: Request, res: Response) => {
  const { email, password, displayName, role = 'individual' } = req.body;

  if (!email || !password) {
    return res.status(422).json({ code: 'invalid', message: 'Email and password required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(422).json({ code: 'invalid', message: 'Invalid email format' });
  }

  // Password strength validation
  if (password.length < 8) {
    return res.status(422).json({ code: 'invalid', message: 'Password must be at least 8 characters long' });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const result = await query(
      `INSERT INTO users (email, display_name, password_hash, role, email_verified)
       VALUES ($1, $2, $3, $4, false)
       RETURNING id, email, display_name, role, email_verified`,
      [email.toLowerCase(), displayName || email.split('@')[0], hashedPassword, role]
    );

    const user = result.rows[0];

    // Create email verification token
    const verificationToken = await createEmailVerificationToken(user.id);

    // Send welcome and verification email
    try {
      await emailService.sendWelcomeEmail(user.email, user.display_name || user.email);
      await emailService.sendEmailVerification(user.email, user.display_name || user.email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send welcome/verification email:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
        emailVerified: user.email_verified
      },
      message: 'Account created successfully. Please check your email to verify your account.'
    });
  } catch (err: any) {
    if (err.code === '23505') { // Unique violation
      return res.status(409).json({ code: 'email_exists', message: 'Email already registered' });
    }
    console.error('Signup error:', err);
    res.status(500).json({ code: 'server_error', message: 'Failed to create account' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ code: 'invalid', message: 'Email and password required' });
  }

  // Check login attempts
  if (!checkLoginAttempts(email.toLowerCase())) {
    return res.status(429).json({
      code: 'too_many_attempts',
      message: 'Too many failed login attempts. Please try again later.'
    });
  }

  try {
    const result = await query(
      'SELECT id, email, display_name, password_hash, role, tenant_id, email_verified, mfa_enabled, login_attempts, locked_until FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ code: 'invalid_credentials', message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(423).json({
        code: 'account_locked',
        message: 'Account is temporarily locked due to too many failed attempts'
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      // Increment login attempts
      const newAttempts = (user.login_attempts || 0) + 1;
      let updateQuery = 'UPDATE users SET login_attempts = $1 WHERE id = $2';
      let updateParams = [newAttempts, user.id];

      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        updateQuery = 'UPDATE users SET login_attempts = $1, locked_until = $2 WHERE id = $3';
        updateParams = [newAttempts, lockUntil, user.id];
      }

      await query(updateQuery, updateParams);

      return res.status(401).json({ code: 'invalid_credentials', message: 'Invalid email or password' });
    }

    // Reset login attempts on successful login
    resetLoginAttempts(email.toLowerCase());
    await query('UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = $1', [user.id]);

    // Create tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id
    });

    const refreshTokenData = await createRefreshToken(user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id
    });

    // Create user session
    await createUserSession(
      user.id,
      accessToken,
      refreshTokenData.id,
      { ip: req.ip, userAgent: req.get('User-Agent') },
      req.ip,
      req.get('User-Agent') || undefined
    );

    // Send login notification (async, don't wait)
    try {
      emailService.sendLoginNotification(user.email, user.display_name || user.email, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }).catch(err => console.error('Failed to send login notification:', err));
    } catch (err) {
      // Ignore email errors
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
        tenantId: user.tenant_id,
        emailVerified: user.email_verified,
        mfaEnabled: user.mfa_enabled
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60 // 15 minutes
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ code: 'server_error', message: 'Login failed' });
  }
});

// Refresh Token
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(422).json({ code: 'invalid', message: 'Refresh token required' });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const refreshTokenData = await findRefreshToken(payload.userId);

    if (!refreshTokenData || refreshTokenData.revoked) {
      return res.status(401).json({ code: 'invalid_token', message: 'Invalid refresh token' });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId
    });

    const newRefreshToken = generateRefreshToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId
    });

    // Revoke old refresh token and create new one
    await revokeRefreshToken(refreshTokenData.token);
    const newRefreshTokenData = await createRefreshToken(payload.userId, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 15 * 60
      }
    });
  } catch (err) {
    res.status(401).json({ code: 'invalid_token', message: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const { refreshToken } = req.body;

  try {
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    // Could also revoke all user sessions here if needed
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ code: 'server_error', message: 'Logout failed' });
  }
});

// Get Current User
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  res.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    tenantId: user.tenantId,
    emailVerified: user.emailVerified,
    mfaEnabled: user.mfaEnabled,
    lastLogin: user.lastLogin
  });
});

// Update Profile
router.put('/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const { displayName, bio, avatar, preferences } = req.body;
  const userId = req.user!.id;

  try {
    const result = await query(
      `UPDATE users
       SET display_name = $1, bio = $2, avatar = $3, preferences = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, display_name, bio, avatar, preferences`,
      [displayName, bio, avatar, preferences, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ code: 'not_found', message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Profile update error:', err);
    res.status(500).json({ code: 'server_error', message: 'Failed to update profile' });
  }
});

// Email Verification
router.post('/verify-email', async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(422).json({ code: 'invalid', message: 'Verification token required' });
  }

  try {
    const userId = await verifyEmailToken(token);
    if (!userId) {
      return res.status(400).json({ code: 'invalid_token', message: 'Invalid or expired verification token' });
    }

    await query('UPDATE users SET email_verified = true WHERE id = $1', [userId]);

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ code: 'server_error', message: 'Email verification failed' });
  }
});

// Resend Email Verification
router.post('/resend-verification', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  if (user.emailVerified) {
    return res.status(400).json({ code: 'already_verified', message: 'Email already verified' });
  }

  try {
    const verificationToken = await createEmailVerificationToken(user.id);
    await emailService.sendEmailVerification(user.email, user.displayName || user.email, verificationToken);

    res.json({ message: 'Verification email sent' });
  } catch (err) {
    res.status(500).json({ code: 'server_error', message: 'Failed to send verification email' });
  }
});

// Password Reset Request
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(422).json({ code: 'invalid', message: 'Email required' });
  }

  try {
    const result = await query('SELECT id, display_name FROM users WHERE email = $1', [email.toLowerCase()]);

    if (result.rowCount > 0) {
      const user = result.rows[0];
      const resetToken = await createPasswordResetToken(user.id);
      await emailService.sendPasswordResetEmail(user.email, user.display_name || user.email, resetToken);
    }

    // Always return success to prevent email enumeration
    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ code: 'server_error', message: 'Failed to process request' });
  }
});

// Password Reset
router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(422).json({ code: 'invalid', message: 'Token and new password required' });
  }

  if (newPassword.length < 8) {
    return res.status(422).json({ code: 'invalid', message: 'Password must be at least 8 characters long' });
  }

  try {
    const userId = await verifyPasswordResetToken(token);
    if (!userId) {
      return res.status(400).json({ code: 'invalid_token', message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, userId]);

    // Revoke all refresh tokens for security
    await query('UPDATE refresh_tokens SET revoked = true WHERE user_id = $1', [userId]);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ code: 'server_error', message: 'Password reset failed' });
  }
});

// OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/auth?error=oauth_failed` }),
  async (req: Request, res: Response) => {
    const user = (req as any).user;

    // Generate tokens for OAuth user
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id
    });

    const refreshTokenData = await createRefreshToken(user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      provider: 'google'
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id
    });

    // Redirect to frontend with tokens
    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/callback`);
    redirectUrl.searchParams.set('accessToken', accessToken);
    redirectUrl.searchParams.set('refreshToken', refreshToken);

    res.redirect(redirectUrl.toString());
  }
);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.FRONTEND_URL}/auth?error=oauth_failed` }),
  async (req: Request, res: Response) => {
    const user = (req as any).user;

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id
    });

    const refreshTokenData = await createRefreshToken(user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      provider: 'github'
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id
    });

    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/callback`);
    redirectUrl.searchParams.set('accessToken', accessToken);
    redirectUrl.searchParams.set('refreshToken', refreshToken);

    res.redirect(redirectUrl.toString());
  }
);

router.get('/microsoft', passport.authenticate('microsoft'));

router.get('/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: `${process.env.FRONTEND_URL}/auth?error=oauth_failed` }),
  async (req: Request, res: Response) => {
    const user = (req as any).user;

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id
    });

    const refreshTokenData = await createRefreshToken(user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      provider: 'microsoft'
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id
    });

    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/callback`);
    redirectUrl.searchParams.set('accessToken', accessToken);
    redirectUrl.searchParams.set('refreshToken', refreshToken);

    res.redirect(redirectUrl.toString());
  }
);

export default router;
