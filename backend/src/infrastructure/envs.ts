import { config } from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  config({ debug: true });
}

function requireEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var ${key}`);
  return v;
}

export const GOOGLE_BOOKS_API_KEY = requireEnv('GOOGLE_BOOKS_API_KEY');
export const DB_PORT = requireEnv('DB_PORT');
export const DB_HOST = requireEnv('DB_HOST');
export const DB_USER = requireEnv('DB_USER');
export const DB_PASS = requireEnv('DB_PASS');
export const APP_PORT = requireEnv('APP_PORT');
export const LLM_URL = requireEnv('LLM_URL');
export const FE_URL = requireEnv('FE_URL');
export const NODE_ENV = requireEnv('NODE_ENV');
export const SECRET_KEY = requireEnv('SECRET_KEY');
