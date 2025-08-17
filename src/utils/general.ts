export const delay = (ms: number): Promise<unknown> =>
  new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, ms));

export const isNotNullish = <T>(value?: T | null): value is T => {
  return value !== undefined && value !== null;
};

export const isNullish = <T>(value?: T | null): value is T | null => {
  return !isNotNullish(value);
};

export const gracefullyStringfy = <T>(param: T): string | T => {
  try {
    return JSON.stringify(param, null, 2);
  } catch {
    return param;
  }
};
