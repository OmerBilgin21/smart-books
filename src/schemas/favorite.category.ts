import { z } from 'zod';

export const favoriteCategorySchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  rank: z.number(),
  userId: z.number().min(1).max(10),
});

export const favoriteCategoryDbSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  rank: z.number(),
  user_id: z.number().min(1).max(10),
});

export type FavoriteCategory = z.infer<typeof favoriteCategorySchema>;
export type FavoriteCategoryDb = z.infer<typeof favoriteCategoryDbSchema>;

export const favoriteCategoryTransform = favoriteCategoryDbSchema.transform(
  (input): FavoriteCategory => {
    const transformed: FavoriteCategory = {
      name: input.name,
      rank: input.rank,
      userId: input.user_id,
    };

    if (input?.id) transformed['id'] = input.id;
    return transformed;
  },
);

export const favoriteCategoryDbTransform = favoriteCategorySchema.transform(
  (input): FavoriteCategoryDb => {
    const transformed: FavoriteCategoryDb = {
      name: input.name,
      rank: input.rank,
      user_id: input.userId,
    };
    if (input?.id) transformed['id'] = input.id;
    return transformed;
  },
);
