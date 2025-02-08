import { BaseRepository } from './base.repository.js';
import { FavoriteCategoryCreate } from '../../schemas/favorite.category.js';
import { FavoriteCategory } from '../db/entities/index.js';

export class FavoriteCategoriesRepository extends BaseRepository {
  public async create(
    favoriteCategory: FavoriteCategoryCreate,
  ): Promise<FavoriteCategory> {
    const repo = await this.getRepository(FavoriteCategory);
    return repo.save({
      ...favoriteCategory,
      user: {
        id: favoriteCategory.userId,
      },
    });
  }

  public async getFavoriteCategoriesOfUser(
    userId: string,
  ): Promise<FavoriteCategory[]> {
    const repo = await this.getRepository(FavoriteCategory);
    return repo.findBy({
      user: {
        id: userId,
      },
    });
  }
}
