export interface EnvironmentVariables {
  NODE_ENV: string;
  PORT: number;
  APP_NAME: string;
  APPLICATION_ID: string;
  FRONTEND_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRATION: string;
  JWT_REFRESH_EXPIRATION: string;
  SERVICE_API_KEY: string;
  MONGODB_URI: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
  REDIS_DB: number;
  AI_PLATFORM_URL: string;
  AI_PLATFORM_API_KEY: string;
  AI_PLATFORM_TIMEOUT_MS: number;
  THROTTLE_TTL: number;
  THROTTLE_LIMIT: number;
}

export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  appName: process.env.APP_NAME || 'ai-travel-planner',
  applicationId: process.env.APPLICATION_ID || 'ai-travel-planner',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_ai_travel_planner_2026',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_ai_travel_planner_2026',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  serviceApiKey: process.env.SERVICE_API_KEY || 'travel_planner_internal_service_key_99182',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-travel-planner',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  aiPlatform: {
    url: process.env.AI_PLATFORM_URL || 'http://localhost:5000',
    apiKey: process.env.AI_PLATFORM_API_KEY || 'platform_master_key_dev_12345',
    timeoutMs: parseInt(process.env.AI_PLATFORM_TIMEOUT_MS || '60000', 10),
  },
  notificationService: {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3001',
    apiKey: process.env.NOTIFICATION_SERVICE_API_KEY || 'test-api-key-12345',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
});
