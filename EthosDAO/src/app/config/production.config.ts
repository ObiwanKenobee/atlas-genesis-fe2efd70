/**
 * Production Configuration
 * Environment-specific settings and feature flags
 */

export const config = {
  // Environment
  environment: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // API Configuration
  api: {
    baseURL: process.env.API_BASE_URL || 'https://api.ethosdao.com',
    timeout: 30000,
    retries: 3,
    version: 'v1'
  },
  
  // WebSocket Configuration
  websocket: {
    url: process.env.WS_URL || 'wss://ws.ethosdao.com',
    reconnectAttempts: 5,
    heartbeatInterval: 30000
  },
  
  // Feature Flags
  features: {
    enableRealTimeCollaboration: true,
    enableAIAssistant: true,
    enableAdvancedAnalytics: true,
    enableWebSocket: true,
    enableOfflineMode: false,
    enableBetaFeatures: process.env.ENABLE_BETA === 'true',
    enableDebugMode: process.env.NODE_ENV === 'development'
  },
  
  // Performance
  performance: {
    enableCaching: true,
    cacheTTL: 60000, // 1 minute
    enableRequestDeduplication: true,
    enableLazyLoading: true,
    maxConcurrentRequests: 6
  },
  
  // Logging
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    enableConsole: true,
    enableRemote: process.env.NODE_ENV === 'production',
    remoteEndpoint: process.env.LOG_ENDPOINT,
    maxLogSize: 1000
  },
  
  // Security
  security: {
    enableCSRF: true,
    enableXSS: true,
    maxRequestSize: 10485760, // 10MB
    sessionTimeout: 3600000, // 1 hour
    enableRateLimit: true,
    rateLimit: {
      maxRequests: 100,
      windowMs: 60000 // 1 minute
    }
  },
  
  // Monitoring
  monitoring: {
    enableErrorTracking: true,
    enablePerformanceTracking: true,
    enableUserTracking: true,
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1
    }
  },
  
  // UI
  ui: {
    theme: 'dark',
    enableAnimations: true,
    animationDuration: 300,
    toastDuration: 3000,
    maxToasts: 5
  },
  
  // Blockchain
  blockchain: {
    defaultNetwork: 'mainnet',
    supportedNetworks: ['mainnet', 'sepolia', 'polygon'],
    rpcUrls: {
      mainnet: process.env.ETH_RPC_URL || 'https://eth.llamarpc.com',
      sepolia: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/',
      polygon: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'
    },
    explorer: {
      mainnet: 'https://etherscan.io',
      sepolia: 'https://sepolia.etherscan.io',
      polygon: 'https://polygonscan.com'
    }
  },
  
  // Storage
  storage: {
    enableLocalStorage: true,
    enableSessionStorage: true,
    storagePrefix: 'ethosdao_',
    maxStorageSize: 5242880 // 5MB
  },
  
  // Analytics
  analytics: {
    enableGA: process.env.NODE_ENV === 'production',
    gaTrackingId: process.env.GA_TRACKING_ID,
    enableMixpanel: false,
    mixpanelToken: process.env.MIXPANEL_TOKEN
  }
};

export default config;
