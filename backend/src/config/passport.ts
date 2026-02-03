import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { query } from '../db';
import { hashPassword, User } from '../utils/auth';

// Extend Express User type to match our User interface
declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string;
      displayName?: string;
      role: string;
      tenantId?: string;
      emailVerified: boolean;
      mfaEnabled: boolean;
      lastLogin?: Date;
    }
  }
}

// Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.FRONTEND_URL}/api/auth/google/callback`,
    passReqToCallback: false
  }, async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: (err: any, user?: Express.User | false) => void) => {
    try {
      // Check if user already exists
      const result = await query('SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2', ['google', profile.id]);

      if (result.rowCount > 0) {
        // Update last login
        await query('UPDATE users SET last_login = NOW() WHERE id = $1', [result.rows[0].id]);
        return done(null, result.rows[0]);
      }

      // Create new user
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email provided by Google'), false);
      }

      // Check if email already exists
      const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rowCount > 0) {
        // Link Google account to existing user
        await query('UPDATE users SET oauth_provider = $1, oauth_id = $2, profile_data = $3 WHERE email = $4',
          ['google', profile.id, profile, email]);
        await query('UPDATE users SET last_login = NOW() WHERE email = $1', [email]);
        return done(null, existingUser.rows[0]);
      }

      // Create new user
      const displayName = profile.displayName || profile.name?.givenName + ' ' + profile.name?.familyName;
      const hashedPassword = await hashPassword(Math.random().toString(36)); // Random password for OAuth users

      const newUser = await query(
        `INSERT INTO users
         (email, display_name, password_hash, role, email_verified, oauth_provider, oauth_id, profile_data, last_login)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         RETURNING *`,
        [email, displayName, hashedPassword, 'individual', true, 'google', profile.id, profile]
      );

      return done(null, newUser.rows[0]);
    } catch (error) {
      return done(error, false);
    }
  }));
}

// GitHub OAuth Strategy (only if credentials are provided)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.FRONTEND_URL}/api/auth/github/callback`,
    scope: ['user:email']
  }, async (accessToken: string, refreshToken: string, profile: GitHubProfile, done: (err: any, user?: User | false) => void) => {
    try {
      // Check if user already exists
      const result = await query('SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2', ['github', profile.id]);

      if (result.rowCount > 0) {
        await query('UPDATE users SET last_login = NOW() WHERE id = $1', [result.rows[0].id]);
        return done(null, result.rows[0]);
      }

      // Get email from profile
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email provided by GitHub'), false);
      }

      // Check if email already exists
      const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rowCount > 0) {
        await query('UPDATE users SET oauth_provider = $1, oauth_id = $2, profile_data = $3 WHERE email = $4',
          ['github', profile.id, profile, email]);
        await query('UPDATE users SET last_login = NOW() WHERE email = $1', [email]);
        return done(null, existingUser.rows[0]);
      }

      // Create new user
      const displayName = profile.displayName || profile.username;
      const hashedPassword = await hashPassword(Math.random().toString(36));

      const newUser = await query(
        `INSERT INTO users
         (email, display_name, password_hash, role, email_verified, oauth_provider, oauth_id, profile_data, last_login)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         RETURNING *`,
        [email, displayName, hashedPassword, 'individual', true, 'github', profile.id, profile]
      );

      return done(null, newUser.rows[0]);
    } catch (error) {
      return done(error, false);
    }
  }));
}

// Microsoft OAuth Strategy (only if credentials are provided)
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: `${process.env.FRONTEND_URL}/api/auth/microsoft/callback`,
    scope: ['user.read']
  }, async (accessToken: string, refreshToken: string, profile: any, done: (err: any, user?: User | false) => void) => {
    try {
      // Check if user already exists
      const result = await query('SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2', ['microsoft', profile.id]);

      if (result.rowCount > 0) {
        await query('UPDATE users SET last_login = NOW() WHERE id = $1', [result.rows[0].id]);
        return done(null, result.rows[0]);
      }

      // Get email from profile
      const email = profile.emails?.[0]?.value || profile.userPrincipalName;
      if (!email) {
        return done(new Error('No email provided by Microsoft'), false);
      }

      // Check if email already exists
      const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rowCount > 0) {
        await query('UPDATE users SET oauth_provider = $1, oauth_id = $2, profile_data = $3 WHERE email = $4',
          ['microsoft', profile.id, profile, email]);
        await query('UPDATE users SET last_login = NOW() WHERE email = $1', [email]);
        return done(null, existingUser.rows[0]);
      }

      // Create new user
      const displayName = profile.displayName || profile.name?.givenName + ' ' + profile.name?.familyName;
      const hashedPassword = await hashPassword(Math.random().toString(36));

      const newUser = await query(
        `INSERT INTO users
         (email, display_name, password_hash, role, email_verified, oauth_provider, oauth_id, profile_data, last_login)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         RETURNING *`,
        [email, displayName, hashedPassword, 'individual', true, 'microsoft', profile.id, profile]
      );

      return done(null, newUser.rows[0]);
    } catch (error) {
      return done(error, false);
    }
  }));
}

// Serialize user for session
passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done: (err: any, user?: Express.User | false) => void) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rowCount > 0) {
      done(null, result.rows[0]);
    } else {
      done(new Error('User not found'), false);
    }
  } catch (error) {
    done(error, false);
  }
});

export default passport;