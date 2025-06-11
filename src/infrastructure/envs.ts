import { config } from 'dotenv';

config();

export const {
  GOOGLE_BOOKS_API_KEY,
  DB_PORT,
  DB_HOST,
  DB_USER,
  DB_PASS,
  APP_PORT,
  LLM_URL,
} = process.env;
