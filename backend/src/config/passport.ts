import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { query } from '../db';
import { hashPassword } from '../utils/auth';

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: `${process.env.FRONTEND_URL}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let result = await query('SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2', ['google', profile.id]);

    if (result.rowCount > 0) {
      // Update last login
      await query('UPDATE users SET last_login = NOW() WHERE id = $1', [result.rows[0].id]);
      return done(null, result.rows[0]);
    }

    // Create new user
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new Error('No email provided by Google'), null);
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
    return done(error, null);
  }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  callbackURL: `${process.env.FRONTEND_URL}/api/auth/github/callback`,
  scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let result = await query('SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2', ['github', profile.id]);

    if (result.rowCount > 0) {
      await query('UPDATE users SET last_login = NOW() WHERE id = $1', [result.rows[0].id]);
      return done(null, result.rows[0]);
    }

    // Get email from profile
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new Error('No email provided by GitHub'), null);
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
    return done(error, null);
  }
}));

// Microsoft OAuth Strategy
passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID!,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
  callbackURL: `${process.env.FRONTEND_URL}/api/auth/microsoft/callback`,
  scope: ['user.read']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let result = await query('SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2', ['microsoft', profile.id]);

    if (result.rowCount > 0) {
      await query('UPDATE users SET last_login = NOW() WHERE id = $1', [result.rows[0].id]);
      return done(null, result.rows[0]);
    }

    // Get email from profile
    const email = profile.emails?.[0]?.value || profile.userPrincipalName;
    if (!email) {
      return done(new Error('No email provided by Microsoft'), null);
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
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rowCount > 0) {
      done(null, result.rows[0]);
    } else {
      done(new Error('User not found'), null);
    }
  } catch (error) {
    done(error, null);
  }
});

export default passport;