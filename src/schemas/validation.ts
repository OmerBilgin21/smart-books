import { z } from 'zod';

export function validator<T extends z.ZodTypeAny>(
  req: unknown,
  schema: T,
): z.ZodSafeParseSuccess<z.infer<T>> | z.ZodSafeParseError<unknown> {
  return schema.safeParse(req);
}

export const SuggestionParamsSchema = z.object({
  userId: z.uuid(),
});
