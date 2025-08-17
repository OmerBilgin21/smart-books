import { FavoriteCategory } from '../infrastructure/db/entities/index';

export type FavoriteCategoryCreate = Omit<FavoriteCategory, 'id' | 'user'> & {
  userId: string;
};
