import { BaseRepository } from './base.repository';
import { FavoriteCategoryCreate } from '../../schemas/favorite.category';
import { FavoriteCategory, User } from '../db/entities';
import { FavoriteCategoriesInterface } from '../../interfaces/favorite.categories.interface';
import { isNullish } from '../../utils/general';

export class FavoriteCategoriesRepository
  extends BaseRepository
  implements FavoriteCategoriesInterface
{
  public async create(
    favoriteCategory: FavoriteCategoryCreate,
  ): Promise<FavoriteCategory> {
    const repo = await this.getRepository(FavoriteCategory);
    const userRepo = await this.getRepository(User);

    const user = await userRepo.findOne({
      where: { id: favoriteCategory.userId },
    });

    if (isNullish(user)) {
      throw new Error('User does not exist to create a favorite category for');
    }

    return repo.save(favoriteCategory);
  }

  public async getFavoriteCategoriesOfUser(
    userId: string,
  ): Promise<FavoriteCategory[]> {
    const repo = await this.getRepository(FavoriteCategory);
    return repo.find({ where: { userId } });
  }
}
