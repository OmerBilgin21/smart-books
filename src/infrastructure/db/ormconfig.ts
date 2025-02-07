import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { config } from 'dotenv';

config();
const { DB_HOST, DB_PASS, DB_PORT, DB_USER } = process.env;
const __dirname = dirname(fileURLToPath(import.meta.url));
const entitiesPath = __dirname + '/entities/index.ts';
const migrationsPath = __dirname + '/migrations/**/*.ts';

console.info('migrations path:', migrationsPath);
console.info('entities path: ', entitiesPath);

export default new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: Number.isFinite(Number(DB_PORT)) ? Number(DB_PORT) : 5432,
  username: DB_USER,
  password: DB_PASS,
  database: 'smart_books_app',
  synchronize: true,
  namingStrategy: new SnakeNamingStrategy(),
  useUTC: true,
  logger: 'simple-console',
  poolSize: 10,
  connectTimeoutMS: 7 * 1000,
  logging: false,
  entities: [entitiesPath],
  migrations: [migrationsPath],
  installExtensions: true,
});
