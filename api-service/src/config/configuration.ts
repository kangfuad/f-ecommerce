export interface AppConfig {
  port: number;
  nodeEnv: string;
  apiPrefix: string;
  appName: string;
  appUrl: string;
  databaseUrl: string;
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  cacheTtl: {
    products: number;
    regions: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  throttler: {
    ttl: number;
    limit: number;
  };
  storage: {
    driver: 'local' | 's3';
    uploadDir: string;
    publicBaseUrl: string;
    aws?: {
      accessKeyId?: string;
      secretAccessKey?: string;
      region?: string;
      bucket?: string;
      endpoint?: string;
    };
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  appName: process.env.APP_NAME || 'e-punyasewa-api',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/epunyasewa_db?schema=public',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  cacheTtl: {
    products: parseInt(process.env.CACHE_TTL_PRODUCTS || '600000', 10), // 10 mins
    regions: parseInt(process.env.CACHE_TTL_REGIONS || '86400000', 10), // 24 hours
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'epunyasewa-default-jwt-secret-key-2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'epunyasewa-default-refresh-secret-key-2026',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  throttler: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
  storage: {
    driver: (process.env.STORAGE_DRIVER as 'local' | 's3') || 'local',
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    publicBaseUrl: process.env.STORAGE_PUBLIC_BASE_URL || 'http://localhost:3000/uploads',
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'ap-southeast-1',
      bucket: process.env.AWS_S3_BUCKET || 'e-punyasewa-storage',
      endpoint: process.env.AWS_S3_ENDPOINT,
    },
  },
});
