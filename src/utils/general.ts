import { logger } from './logger';

export const delay = (s: number): Promise<unknown> =>
  new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, s * 1000));

export const isNotNullish = <T>(value?: T | null): value is T => {
  return value !== undefined && value !== null;
};

export const isNullish = <T>(value?: T | null): value is undefined | null =>
  !isNotNullish(value);

export const isEmpty = <T>(param?: T | null): boolean => {
  if (param === undefined || param === null) {
    return true;
  }

  if (Array.isArray(param)) {
    return param.length === 0;
  }

  if (typeof param === 'string') {
    return param.trim() === '';
  }

  if (param instanceof Map || param instanceof Set) {
    return param.size === 0;
  }

  if (typeof param === 'object') {
    return Object.keys(param).length === 0;
  }

  return false;
};

export const isNotEmpty = <T>(param?: T | null): boolean => !isEmpty(param);

export const gracefullyStringfy = <T>(param: T): string | T => {
  try {
    return JSON.stringify(param, null, 2);
  } catch {
    return param;
  }
};

export const processAsyncTaskInBatch = async <T>(
  promises: (() => Promise<T>)[],
  batchSize: number,
): Promise<T[]> => {
  try {
    const delayAmount = 1;
    const results: T[] = [];
    for (let i = 0; i < promises.length; i += batchSize) {
      const batch = promises.slice(i, i + batchSize);

      const batchResults = await Promise.all(batch.map((b): Promise<T> => b()));
      results.push(...batchResults);

      if (i + batchSize < promises.length) {
        logger(`WILL WAIT BEFORE NEXT BATCH FOR ${delayAmount} SECOND(s)`);
        await delay(delayAmount);
      }
    }
    return results;
  } catch (error) {
    logger('Error while executing async tasks in bulk', error);
    return [];
  }
};
