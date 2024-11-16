export const delay = (ms: number): Promise<unknown> =>
  new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, ms));
