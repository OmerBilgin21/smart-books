import { inspect } from 'util';

const inspectThatThang = <T>(thang: T): string => {
  return inspect(thang, {
    colors: true,
    depth: null,
    maxArrayLength: Infinity,
    breakLength: 120,
  });
};

function sanitizeStrings(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return obj.replace(/[\r\n\t"]/g, (c): string => {
      if (c === '\r' || c === '\t') return ' ';
      if (c === '\n') return '';
      if (c === '"') return '';
      return c;
    });
  }
  if (Array.isArray(obj)) return obj.map(sanitizeStrings);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(
        ([k, v]): Array<string | unknown> => [k, sanitizeStrings(v)],
      ),
    );
  }
  return obj;
}

export const logger = (message: string, meta?: unknown): void => {
  if (meta === undefined) {
    console.info(message);
    return;
  }

  let metaStr: string;

  if (typeof meta === 'string') {
    metaStr = meta;
  } else if (meta instanceof Error) {
    const errObj = {
      name: meta.name,
      message: meta.message,
      stack: meta.stack?.split('\n'),
    };
    metaStr = inspectThatThang(errObj);
    console.error(message, metaStr);
    return;
  } else {
    metaStr = inspectThatThang(sanitizeStrings(meta));
  }

  console.info(message, metaStr);
};
