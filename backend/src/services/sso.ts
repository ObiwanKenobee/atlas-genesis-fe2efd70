/**
 * SSO (Single Sign-On) Service
 * 
 * Enables enterprise customers to authenticate via their existing identity providers.
 * Supports SAML 2.0, Azure AD, Okta, and generic SAML providers.
 */

import passport from 'passport';
import { Strategy as SamlStrategy } from 'passport-saml';
import { Strategy as AzureADStrategy } from 'passport-azure-ad';
import { Strategy as OktaStrategy } from 'passport-okta-oauth';
import { db } from '../db';

export interface SSOConfig {
  provider: 'saml' | 'azure-ad' | 'okta';
  entryPoint?: string;
  issuer?: string;
  cert?: string;
  clientId?: string;
  clientSecret?: string;
  tenantId?: string;
  domain?: string;
}

export interface SSOProfile {
  id: string;
  email: string;
  name: string;
  organization?: string;
  roles?: string[];
  groups?: string[];
  attributes: Record<string, any>;
}

export class SSOService {
  private strategies: Map<string, any> = new Map();

  constructor() {
    this.initializeStrategies();
  }

  /**
   * Initialize all SSO strategies
   */
  private initializeStrategies(): void {
    // SAML 2.0 Strategy (generic)
    passport.use('saml', new SamlStrategy({
      entryPoint: process.env.SAML_ENTRY_POINT || '/saml/sso',
      issuer: process.env.SAML_ISSUER,
      cert: process.env.SAML_CERT,
      callbackUrl: process.env.SAML_CALLBACK_URL || '/api/sso/callback/saml',
      logoutUrl: process.env.SAML_LOGOUT_URL || '/api/sso/logout/saml',
      identifierFormat: 'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
      passReqToCallback: true,
      acceptedClockSkew: true,
      validateInResponseToIssuer: true,
      disableRequestedACSCheck: true,
      wantAssertionsSigned: true,
      wantAssertionsEncrypted: true,
    }));

    // Azure AD Strategy
    passport.use('azure-ad', new AzureADStrategy({
      identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/.well-known/openid-configuration`,
      clientID: process.env.AZURE_CLIENT_ID || '',
      clientSecret: process.env.AZURE_CLIENT_SECRET || '',
      callbackURL: process.env.AZURE_REDIRECT_URL || '/api/sso/callback/azure',
      responseType: 'code',
      responseMode: 'query',
      scope: ['openid', 'profile', 'email'],
    }));

    // Okta Strategy
    passport.use('okta', new OktaStrategy({
      issuer: process.env.OKTA_ISSUER || '',
      clientID: process.env.OKTA_CLIENT_ID || '',
      clientSecret: process.env.OKTA_CLIENT_SECRET || '',
      callbackURL: process.env.OKTA_CALLBACK_URL || '/api/sso/callback/okta',
      scope: ['openid', 'profile', 'email', 'groups'],
    }));
  }

  /**
   * Get SSO login URL for a provider
   */
  getLoginURL(provider: string): string {
    const urls: Record<string, string> = {
      'saml': '/api/sso/login/saml',
      'azure-ad': '/api/sso/login/azure',
      'okta': '/api/sso/login/okta',
    };

    return urls[provider] || '/api/sso/login';
  }

  /**
   * Handle SSO callback
   */
  async handleCallback(
    provider: string,
     profile: SSOProfile
  ): Promise<{ user: any; isNewUser: boolean }> {
    // Check if user exists
    const existingUser = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [profile.email]
    );

    if (existingUser.length > 0) {
      // Update existing user with SSO info
      await db.query(
        `UPDATE users 
         SET sso_provider = $1, 
             sso_provider_id = $2, 
             last_login = NOW(),
             updated_at = NOW()
         WHERE id = $3`,
        [provider, profile.id, profile.id]
      );

      return { user: existingUser[0], isNewUser: false };
    }

    // Create new user
    const result = await db.query(
      `INSERT INTO users (email, name, sso_provider, sso_provider_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [
        profile.email,
        profile.name || profile.email.split('@')[0],
        provider,
        profile.id,
        Date.now(),
        Date.now(),
      ]
    );

    // Assign default role
    await db.query(
      `INSERT INTO user_roles (user_id, role_id, organization_id, assigned_by, assigned_at)
       VALUES ($1, (SELECT id FROM roles WHERE name = 'user'), NULL, NOW())
      `,
      [result[0].id]
    );

    return { user: result[0], isNewUser: true };
  }

  /**
   * Get SSO metadata for SP-initiated login
   */
  getSAMLMetadata(): string {
    const strategy = this.strategies.get('saml') as SamlStrategy;

    if (!strategy) {
      throw new Error('SAML strategy not configured');
    }

    return strategy.generateServiceProviderMetadata();
  }

  /**
   * Get Azure AD configuration
   */
  getAzureADConfig(): { authorizationUrl: string; tenantId: string } {
    return {
      authorizationUrl: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/authorize`,
      tenantId: process.env.AZURE_TENANT_ID || '',
    };
  }

  /**
   * Get Okta configuration
   */
  getOktaConfig(): { authorizationUrl: string; issuer: string } {
    return {
      authorizationUrl: `${process.env.OKTA_ISSUER}/oauth2/v1/authorize`,
      issuer: process.env.OKTA_ISSUER || '',
    };
  }

  /**
   * Get available SSO providers
   */
  getAvailableProviders(): Array<{ id: string; name: string; type: string; configured: boolean }> {
    return [
      {
        id: 'saml',
        name: 'SAML 2.0',
        type: 'saml',
        configured: !!process.env.SAML_ENTRY_POINT,
      },
      {
        id: 'azure-ad',
        name: 'Microsoft Entra ID (Azure AD)',
        type: 'oidc',
        configured: !!process.env.AZURE_CLIENT_ID,
      },
      {
        id: 'okta',
        name: 'Okta',
        type: 'oidc',
        configured: !!process.env.OKTA_CLIENT_ID,
      },
    ];
  }

  /**
   * Validate SSO configuration
   */
  validateConfig(provider: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (provider === 'saml') {
      if (!process.env.SAML_ENTRY_POINT) {
        errors.push('SAML_ENTRY_POINT is required');
      }
      if (!process.env.SAML_ISSUER) {
        errors.push('SAML_ISSUER is required');
      }
      if (!process.env.SAML_CERT) {
        errors.push('SAML_CERT is required');
      }
      if (!process.env.SAML_CALLBACK_URL) {
        errors.push('SAML_CALLBACK_URL is required');
      }
    }

    if (provider === 'azure-ad') {
      if (!process.env.AZURE_CLIENT_ID) {
        errors.push('AZURE_CLIENT_ID is required');
      }
      if (!process.env.AZURE_CLIENT_SECRET) {
        errors.push('AZURE_CLIENT_SECRET is required');
      }
      if (!process.env.AZURE_TENANT_ID) {
        errors.push('AZURE_TENANT_ID is required');
      }
      if (!process.env.AZURE_REDIRECT_URL) {
        errors.push('AZURE_REDIRECT_URL is required');
      }
    }

    if (provider === 'okta') {
      if (!process.env.OKTA_CLIENT_ID) {
        errors.push('OKTA_CLIENT_ID is required');
      }
      if (!process.env.OKTA_CLIENT_SECRET) {
        errors.push('OKTA_CLIENT_SECRET is required');
      }
      if (!process.env.OKTA_ISSUER) {
        errors.push('OKTA_ISSUER is required');
      }
      if (!process.env.OKTA_CALLBACK_URL) {
        errors.push('OKTA_CALLBACK_URL is required');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Link SSO account to organization
   */
  async linkToOrganization(
    userId: string,
    organizationId: string,
    ssoProvider: string,
    ssoProviderId: string
  ): Promise<void> {
    await db.query(
      `UPDATE users 
       SET organization_id = $1, 
           sso_provider = $2, 
           sso_provider_id = $3
       WHERE id = $4`,
      [organizationId, ssoProvider, ssoProviderId, userId]
    );
  }

  /**
   * Unlink SSO account from organization
   */
  async unlinkFromOrganization(userId: string): Promise<void> {
    await db.query(
      `UPDATE users 
       SET organization_id = NULL, 
           sso_provider = NULL, 
           sso_provider_id = NULL
       WHERE id = $1`,
      [userId]
    );
  }

  /**
   * Get SSO-linked users for organization
   */
  async getSSOUsersForOrganization(organizationId: string): Promise<any[]> {
    const result = await db.query(
      `SELECT * FROM users 
       WHERE organization_id = $1 
         AND sso_provider IS NOT NULL
       ORDER BY created_at DESC`,
      [organizationId]
    );

    return result;
  }

  /**
   * Get SSO statistics
   */
  async getSSOStatistics(organizationId: string): Promise<{
    totalUsers: number;
    byProvider: Record<string, number>;
    recentLogins: any[];
  }> {
    const result = await db.query(
      `SELECT 
        sso_provider,
        COUNT(*) as count
       FROM users
       WHERE organization_id = $1
         AND sso_provider IS NOT NULL
       GROUP BY sso_provider`,
      [organizationId]
    );

    const byProvider: Record<string, number> = {};
    result.forEach((row: any) => {
      byProvider[row.sso_provider] = parseInt(row.count);
    });

    const recentLogins = await db.query(
      `SELECT 
        u.email,
        u.sso_provider,
        u.last_login
       FROM users u
       WHERE u.organization_id = $1
         AND u.last_login > NOW() - INTERVAL '7 days'
       ORDER BY u.last_login DESC
       LIMIT 10`,
      [organizationId]
    );

    return {
      totalUsers: result.reduce((sum, row) => sum + parseInt(row.count), 0),
      byProvider,
      recentLogins,
    };
  }
}

// Export singleton instance
export const ssoService = new SSOService();
