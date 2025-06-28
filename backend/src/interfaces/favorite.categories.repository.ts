import { FavoriteCategory } from '../infrastructure/db/entities';
import { FavoriteCategoryCreate } from '../schemas/favorite.category';

export interface FavoriteCategoriesInterface {
  create(favoriteCategory: FavoriteCategoryCreate): Promise<FavoriteCategory>;
  getFavoriteCategoriesOfUser(userId: string): Promise<FavoriteCategory[]>;
}
