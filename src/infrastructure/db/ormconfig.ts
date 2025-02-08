import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { config } from 'dotenv';
import entities from './entities/index.js';
import path from 'node:path';
import url from 'node:url';

config();

const { DB_HOST, DB_PASS, DB_PORT, DB_USER } = process.env;

const migrationsPath =
  path.dirname(url.fileURLToPath(import.meta.url)) + '/migrations/**/*.ts';

console.info('migrationsPath: ', migrationsPath);

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
  entities: entities,
  migrations: [migrationsPath],
  installExtensions: true,
});
