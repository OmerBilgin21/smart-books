import { config } from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  config({ debug: true, encoding: 'utf-8' });
}

function requireEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var ${key}`);
  return v;
}

const envVars = [
  'GOOGLE_BOOKS_API_KEY',
  'DB_PORT',
  'DB_HOST',
  'DB_USER',
  'DB_PASS',
  'APP_PORT',
  'LLM_URL',
  'FE_URL',
  'NODE_ENV',
  'SECRET_KEY',
] as const;

type EnvVars = (typeof envVars)[number];
type Envs = Record<EnvVars, string>;

const envs = envVars.reduce((acc, curr): Envs => {
  acc[curr] = requireEnv(curr);
  return acc;
}, {} as Envs);

export default envs;
