/**
 * RVE Environment Configuration
 * Centralized configuration with validation and type safety
 */

// ============================================================================
// ENVIRONMENT TYPES
// ============================================================================

export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  // Application
  app: {
    name: string;
    version: string;
    environment: Environment;
    debug: boolean;
    url: string;
  };

  // API
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
    rateLimitPerMinute: number;
  };

  // WebSocket
  websocket: {
    url: string;
    reconnectAttempts: number;
    heartbeatInterval: number;
  };

  // Blockchain
  blockchain: {
    networks: {
      [key: string]: {
        chainId: number;
        rpcUrl: string;
        explorer: string;
        contracts: {
          [key: string]: string;
        };
      };
    };
    defaultNetwork: string;
  };

  // Security
  security: {
    jwtSecret?: string;
    sessionTimeout: number;
    rateLimitWindow: number;
    maxLoginAttempts: number;
    corsOrigins: string[];
  };

  // Features
  features: {
    trading: boolean;
    governance: boolean;
    defi: boolean;
    ai: boolean;
    notifications: boolean;
  };

  // External Services
  services: {
    // Analytics
    analytics?: {
      googleAnalyticsId?: string;
      mixpanelToken?: string;
    };

    // Error Tracking
    sentry?: {
      dsn?: string;
      environment: string;
      tracesSampleRate: number;
    };

    // Storage
    storage?: {
      provider: 'aws' | 'gcp' | 'ipfs';
      bucket?: string;
      region?: string;
    };

    // AI/ML
    ai?: {
      apiKey?: string;
      endpoint?: string;
    };
  };
}

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

class ConfigValidator {
  private errors: string[] = [];

  required(value: any, name: string): void {
    if (value === undefined || value === null || value === '') {
      this.errors.push(`${name} is required`);
    }
  }

  url(value: string, name: string): void {
    try {
      new URL(value);
    } catch {
      this.errors.push(`${name} must be a valid URL`);
    }
  }

  number(value: any, name: string, min?: number, max?: number): void {
    const num = Number(value);
    if (isNaN(num)) {
      this.errors.push(`${name} must be a number`);
      return;
    }
    if (min !== undefined && num < min) {
      this.errors.push(`${name} must be >= ${min}`);
    }
    if (max !== undefined && num > max) {
      this.errors.push(`${name} must be <= ${max}`);
    }
  }

  oneOf(value: any, name: string, options: any[]): void {
    if (!options.includes(value)) {
      this.errors.push(`${name} must be one of: ${options.join(', ')}`);
    }
  }

  getErrors(): string[] {
    return this.errors;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }
}

// ============================================================================
// CONFIGURATION BUILDER
// ============================================================================

function getEnv(key: string, defaultValue?: string): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue || '';
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue || '';
  }
  return defaultValue || '';
}

function getEnvBool(key: string, defaultValue: boolean = false): boolean {
  const value = getEnv(key);
  if (!value) return defaultValue;
  return value === 'true' || value === '1';
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = getEnv(key);
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

function buildConfig(): EnvironmentConfig {
  const env = getEnv('NODE_ENV', 'development') as Environment;

  return {
    app: {
      name: 'RVE Platform',
      version: getEnv('VITE_APP_VERSION', '1.0.0'),
      environment: env,
      debug: getEnvBool('VITE_DEBUG', env === 'development'),
      url: getEnv('VITE_APP_URL', 'http://localhost:5173'),
    },

    api: {
      baseUrl: getEnv('VITE_API_URL', 'https://api.rve.network/v1'),
      timeout: getEnvNumber('VITE_API_TIMEOUT', 30000),
      retries: getEnvNumber('VITE_API_RETRIES', 3),
      rateLimitPerMinute: getEnvNumber('VITE_RATE_LIMIT', 100),
    },

    websocket: {
      url: getEnv('VITE_WS_URL', 'wss://ws.rve.network'),
      reconnectAttempts: getEnvNumber('VITE_WS_RECONNECT_ATTEMPTS', 5),
      heartbeatInterval: getEnvNumber('VITE_WS_HEARTBEAT', 30000),
    },

    blockchain: {
      defaultNetwork: getEnv('VITE_DEFAULT_NETWORK', 'mainnet'),
      networks: {
        mainnet: {
          chainId: 1,
          rpcUrl: getEnv('VITE_ETH_RPC_URL', 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY'),
          explorer: 'https://etherscan.io',
          contracts: {
            rveToken: getEnv('VITE_CONTRACT_RVE_TOKEN', '0x0000000000000000000000000000000000000001'),
            assetRegistry: getEnv('VITE_CONTRACT_ASSET_REGISTRY', '0x0000000000000000000000000000000000000002'),
            governance: getEnv('VITE_CONTRACT_GOVERNANCE', '0x0000000000000000000000000000000000000003'),
            oracle: getEnv('VITE_CONTRACT_ORACLE', '0x0000000000000000000000000000000000000004'),
          },
        },
        polygon: {
          chainId: 137,
          rpcUrl: getEnv('VITE_POLYGON_RPC_URL', 'https://polygon-rpc.com'),
          explorer: 'https://polygonscan.com',
          contracts: {
            rveToken: getEnv('VITE_POLYGON_CONTRACT_RVE_TOKEN', '0x2000000000000000000000000000000000000001'),
            assetRegistry: getEnv('VITE_POLYGON_CONTRACT_ASSET_REGISTRY', '0x2000000000000000000000000000000000000002'),
          },
        },
      },
    },

    security: {
      jwtSecret: getEnv('JWT_SECRET'),
      sessionTimeout: getEnvNumber('SESSION_TIMEOUT', 3600000), // 1 hour
      rateLimitWindow: getEnvNumber('RATE_LIMIT_WINDOW', 60000), // 1 minute
      maxLoginAttempts: getEnvNumber('MAX_LOGIN_ATTEMPTS', 5),
      corsOrigins: getEnv('CORS_ORIGINS', '*').split(','),
    },

    features: {
      trading: getEnvBool('VITE_FEATURE_TRADING', true),
      governance: getEnvBool('VITE_FEATURE_GOVERNANCE', true),
      defi: getEnvBool('VITE_FEATURE_DEFI', true),
      ai: getEnvBool('VITE_FEATURE_AI', true),
      notifications: getEnvBool('VITE_FEATURE_NOTIFICATIONS', true),
    },

    services: {
      analytics: {
        googleAnalyticsId: getEnv('VITE_GA_ID'),
        mixpanelToken: getEnv('VITE_MIXPANEL_TOKEN'),
      },
      sentry: {
        dsn: getEnv('VITE_SENTRY_DSN'),
        environment: env,
        tracesSampleRate: env === 'production' ? 0.1 : 1.0,
      },
      storage: {
        provider: (getEnv('STORAGE_PROVIDER', 'ipfs') as any),
        bucket: getEnv('STORAGE_BUCKET'),
        region: getEnv('STORAGE_REGION'),
      },
      ai: {
        apiKey: getEnv('AI_API_KEY'),
        endpoint: getEnv('AI_ENDPOINT', 'https://ai.rve.network/v1'),
      },
    },
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateConfig(config: EnvironmentConfig): void {
  const validator = new ConfigValidator();

  // Required fields in production
  if (config.app.environment === 'production') {
    validator.required(config.security.jwtSecret, 'JWT_SECRET');
    validator.required(config.services.sentry?.dsn, 'SENTRY_DSN');
  }

  // URL validation
  validator.url(config.api.baseUrl, 'API_URL');
  validator.url(config.websocket.url, 'WS_URL');

  // Number validation
  validator.number(config.api.timeout, 'API_TIMEOUT', 1000, 60000);
  validator.number(config.api.retries, 'API_RETRIES', 0, 10);

  // Enum validation
  validator.oneOf(config.app.environment, 'NODE_ENV', ['development', 'staging', 'production']);

  if (validator.hasErrors()) {
    console.error('Configuration validation failed:');
    validator.getErrors().forEach(error => console.error(`  - ${error}`));
    
    if (config.app.environment === 'production') {
      throw new Error('Invalid configuration');
    }
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const config = buildConfig();
validateConfig(config);

// Freeze config in production to prevent modifications
if (config.app.environment === 'production') {
  Object.freeze(config);
}

// Helper to check if feature is enabled
export function isFeatureEnabled(feature: keyof EnvironmentConfig['features']): boolean {
  return config.features[feature];
}

// Helper to get blockchain config
export function getBlockchainConfig(network: string) {
  return config.blockchain.networks[network];
}

// Helper to check environment
export function isDevelopment(): boolean {
  return config.app.environment === 'development';
}

export function isProduction(): boolean {
  return config.app.environment === 'production';
}

export function isStaging(): boolean {
  return config.app.environment === 'staging';
}
