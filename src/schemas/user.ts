import { z } from 'zod';
import { BookRecordSchema } from './book.record';
import { FavoriteCategorySchema } from './favorite.category';

export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  suggestionIsFresh: z.boolean(),
  password: z.string(),
  email: z.email(),
  books: z.array(BookRecordSchema),
  favoriteCategories: z.array(FavoriteCategorySchema),
});

export type AccessToken = {
  name: string;
  surname: string;
  email: string;
  id: number;
  iat: number;
  exp: number;
};

export const UserCreateSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name too long'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name too long'),
  email: z.email('Email must be provided'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(255, 'Password too long'),
});

export const UserUpdateSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(100, 'First name too long')
      .optional(),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(100, 'Last name too long')
      .optional(),
    email: z.email().optional(),
  })
  .refine((data): boolean => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const LoginParamsSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password is required'),
});

export type UserCreate = z.infer<typeof UserCreateSchema>;
export type User = z.infer<typeof UserSchema>;
