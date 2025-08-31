import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validator } from '../schemas';
import { logger } from './logger';

export interface ValidationConfig<T> {
  body?: z.ZodSchema<T>;
  params?: z.ZodSchema<T>;
  query?: z.ZodSchema<T>;
}

export function validate<T>(config: ValidationConfig<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (config.body) {
        const bodyResult = validator(req.body, config.body);
        if (!bodyResult.success) {
          res.status(400).json({
            error: 'Invalid request body',
            reason: bodyResult.error,
          });
          return;
        }
      }

      if (config.params) {
        const paramsResult = validator(req.params, config.params);
        if (!paramsResult.success) {
          res.status(400).json({
            error: 'Invalid request parameters',
            reason: paramsResult.error,
          });
          logger('Invalid request parameters', req.params);
          return;
        }
      }

      if (config.query) {
        const queryResult = validator(req.query, config.query);
        if (!queryResult.success) {
          res.status(400).json({
            error: 'Invalid query parameters',
            reason: queryResult.error,
          });
          return;
        }
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: 'Unexpected validation error',
        reason: error,
      });
    }
  };
}
