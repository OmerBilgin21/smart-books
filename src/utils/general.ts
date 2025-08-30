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
