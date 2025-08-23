import 'reflect-metadata';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import envs from './infrastructure/envs';
import { routes } from './infrastructure/routes';
import { logger } from './utils/logger';

export const app: Express = express();
const { NODE_ENV, FE_URL, APP_PORT } = envs;

app.use(
  express.json(),
  express.urlencoded({ extended: true }),
  cors({
    origin: NODE_ENV === 'production' ? FE_URL : '*',
    credentials: true,
  }),
  cookieParser(),
);

logger('Available Routes: ');
routes.forEach((eachRouter): void => {
  logger('Registering route: ', eachRouter.path);
  app.use(eachRouter.path, eachRouter.router);
});

app.listen(APP_PORT, (): void => {
  logger(`\n[server]: Server is running at http://localhost:${APP_PORT}\n`);
});
