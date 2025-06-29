import 'reflect-metadata';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { APP_PORT, FE_URL } from './infrastructure/envs';
import { routes } from './infrastructure/routes';

export const app: Express = express();

app.use(
  express.json(),
  express.urlencoded({ extended: true }),
  cors({
    origin: FE_URL as string,
    credentials: true,
  }),
  cookieParser(),
);

console.info('Available Routes: ');
routes.forEach((eachRouter): void => {
  console.info(eachRouter.path);
  app.use(eachRouter.path, eachRouter.router);
});

app.listen(APP_PORT, (): void => {
  console.info(
    `\n[server]: Server is running at http://localhost:${APP_PORT}\n`,
  );
});
