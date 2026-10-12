import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'development-secret-change-me',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hospital_payroll?schema=public',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
