import { config } from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  config();
}

export const {
  GOOGLE_BOOKS_API_KEY,
  DB_PORT,
  DB_HOST,
  DB_USER,
  DB_PASS,
  APP_PORT,
  LLM_URL,
} = process.env;
