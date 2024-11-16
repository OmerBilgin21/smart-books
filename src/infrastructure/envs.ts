import { config } from 'dotenv';
config();

export const { DATABASE_URL, APP_PORT, GOOGLE_BOOKS_API_KEY } = process.env;
