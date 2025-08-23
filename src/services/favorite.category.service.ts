import { FavoriteCategory } from '../infrastructure/db/entities';
import { FavoriteCategoriesInterface } from '../interfaces/favorite.categories.interface';
import { FavoriteCategoryCreate } from '../schemas/favorite.category';

export class FavoriteCategoryService {
  constructor(private repository: FavoriteCategoriesInterface) {}

  async create(payload: FavoriteCategoryCreate): Promise<FavoriteCategory> {
    return this.repository.create(payload);
  }

  async getFavoriteCategoriesOfUser(
    userId: string,
  ): Promise<FavoriteCategory[]> {
    return this.repository.getFavoriteCategoriesOfUser(userId);
  }
}
