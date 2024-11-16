import { z } from 'zod';

export const userSchema = z.object({
  id: z.number().optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export const userDbSchema = z.object({
  id: z.number().optional(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export type User = z.infer<typeof userSchema>;
export type UserDb = z.infer<typeof userDbSchema>;

export const userTransform = userDbSchema.transform((input): User => {
  const transformed: Record<string, number | string> = {
    firstName: input.first_name,
    lastName: input.last_name,
    email: input.email,
    password: input.password,
  };

  if (input?.id) transformed['id'] = input.id;
  return transformed as User;
});

export const userDbTransform = userSchema.transform((input): UserDb => {
  const transformed: Record<string, string | number> = {
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    password: input.password,
  };
  if (input?.id) transformed['id'] = input.id;
  return transformed as UserDb;
});
