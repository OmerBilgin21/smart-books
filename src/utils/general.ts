export const delay = (ms: number): Promise<unknown> =>
  new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, ms));

export const gracefullyStringfy = <T>(param: T): string | T => {
  try {
    return JSON.stringify(param);
  } catch {
    return param;
  }
};
