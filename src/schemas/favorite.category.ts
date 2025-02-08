import { FavoriteCategory } from '../infrastructure/db/entities/index.js';

export type FavoriteCategoryCreate = Omit<FavoriteCategory, 'id' | 'user'> & {
  userId: string;
};
