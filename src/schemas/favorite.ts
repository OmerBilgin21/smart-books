import { z } from 'zod';

export const favoriteSchema = z.object({
  id: z.number().optional(),
  selfLink: z.string(),
  userId: z.number(),
});

export const favoriteDbSchema = z.object({
  id: z.number().optional(),
  self_link: z.string(),
  user_id: z.number(),
});

export type Favorite = z.infer<typeof favoriteSchema>;
export type FavoriteDb = z.infer<typeof favoriteDbSchema>;

export const favoriteTransform = favoriteDbSchema.transform(
  (input): Favorite => {
    const transformed: Favorite = {
      selfLink: input.self_link,
      userId: input.user_id,
    };

    if (input?.id) transformed['id'] = input.id;
    return transformed;
  },
);

export const favoriteDbTransform = favoriteSchema.transform(
  (input): FavoriteDb => {
    const transformed: FavoriteDb = {
      self_link: input.selfLink,
      user_id: input.userId,
    };
    if (input?.id) transformed['id'] = input.id;
    return transformed;
  },
);

export { Favorite as Suggestion };
export { FavoriteDb as SuggestionDb };

export { favoriteTransform as suggestionTransform };
export { favoriteDbTransform as suggestionDbTransform };
