export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  database: {
    url: process.env.DATABASE_URL,
  },
  port: process.env.PORT || 8080,
  refreshToken: {
    secret: process.env.REFRESH_TOKEN_SECRET || 'your-secret-key',
    expire: process.env.REFRESH_TOKEN_EXPIRE || '30d',
  },
  storage: {
    bucketName: process.env.R2_BUCKET_NAME || 'my-bucket',
    endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    publicUrl: process.env.R2_PUBLIC_URL || 'https://pub-domain.xyz',
  },
  mail: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT!, 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  },
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
});
