import { z } from 'zod';

export const FavoriteCategorySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  userId: z.uuid(),
  rank: z.int(),
});

export const FavoriteCategoryCreateSchema = z.object({
  userId: z.uuid(),
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name too long'),
  rank: z
    .number()
    .int('Rank must be an integer')
    .min(1, 'Rank must be at least 1')
    .max(10, 'Rank must be at most 10'),
});

export const FavoriteCategoryParamsSchema = z.object({
  userId: z.uuid(),
});

export type FavoriteCategory = z.infer<typeof FavoriteCategorySchema>;
export type FavoriteCategoryCreate = z.infer<
  typeof FavoriteCategoryCreateSchema
>;
