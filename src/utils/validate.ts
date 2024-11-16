import { z } from 'zod';

export const parseData = <T extends z.ZodTypeAny>(
  req: unknown,
  schema: T,
): z.TypeOf<T> | null => {
  const parsedBody: z.SafeParseReturnType<
    unknown,
    z.infer<typeof schema>
  > = schema.safeParse(req);

  if (!parsedBody.success) {
    return null;
  }

  return parsedBody.data;
};
