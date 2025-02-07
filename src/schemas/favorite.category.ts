import { FavoriteCategory } from 'infrastructure/db/entities';

export type FavoriteCategoryCreate = Omit<FavoriteCategory, 'id' | 'user'> & {
  userId: string;
};
