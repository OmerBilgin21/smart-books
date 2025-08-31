import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { config } from 'dotenv';
import entities from './entities';
import path from 'node:path';
import { logger } from '../../utils/logger';

config();

const { DB_HOST, DB_PASS, DB_PORT, DB_USER } = process.env;

const migrationsPath = path.join(__dirname, 'migrations', '**', '*.ts');

logger('migrationsPath: ', migrationsPath);

const appDataSource = new DataSource({
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

export const getDataSource = async (): Promise<DataSource> => {
  if (appDataSource.isInitialized) {
    return appDataSource;
  }
  return await appDataSource.initialize();
};

export default appDataSource;
