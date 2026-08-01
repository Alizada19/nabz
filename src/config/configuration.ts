export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.REFRESH_SECRET,
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
  },
  fcm: {
    serverKey: process.env.FCM_SERVER_KEY,
  },
  matching: {
    defaultRadiusKm: parseInt(process.env.DEFAULT_RADIUS ?? '50', 10),
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '20', 10),
  },
});
