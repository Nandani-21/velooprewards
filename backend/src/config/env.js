import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/veloop_rewards',
  jwtSecret: process.env.JWT_SECRET || 'development-only-secret-change-me',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  challengeTtlSeconds: Number(process.env.CHALLENGE_TTL_SECONDS || 120)
};
