import { Knex } from 'knex';
import {
  FavoriteCategory,
  FavoriteCategoryDb,
  favoriteCategoryTransform,
} from 'schemas';

export class FavoriteCategoriesService {
  private db: Knex.QueryBuilder<FavoriteCategoryDb>;

  constructor(init: { db: Knex; tableName: string }) {
    this.db = init.db<FavoriteCategoryDb>(init.tableName);
  }

  public async create(favorite: FavoriteCategory): Promise<FavoriteCategory> {
    try {
      const properId = Number(favorite.userId);

      if (!Number.isFinite(properId)) {
        throw new Error('Invalid ID');
      }

      const created: FavoriteCategoryDb[] = await this.db
        .returning('*')
        .insert({
          user_id: properId,
          name: favorite.name,
          rank: favorite.rank,
        });

      if (!created || !created?.length) {
        throw new Error('FavoriteCategory could not be created');
      }

      return favoriteCategoryTransform.parse(created[0]);
    } catch (createFavoriteCategoryError) {
      throw new Error(
        `Error during favorite creation: ${createFavoriteCategoryError}`,
      );
    }
  }

  public async get(id: string): Promise<FavoriteCategory> {
    try {
      const properId = Number(id);

      if (!Number.isFinite(properId)) {
        throw new Error('Invalid ID');
      }

      const found = await this.db.select('*').where({ id: properId }).first();

      if (!found) {
        throw new Error('Favorite category not found');
      }

      return favoriteCategoryTransform.parse(found);
    } catch (getFavoriteCategoryError) {
      throw new Error(
        `Error while getting favorites: ${getFavoriteCategoryError}`,
      );
    }
  }

  public async userFavoriteCategories(
    userId: string | number,
  ): Promise<FavoriteCategory[]> {
    try {
      const properId = Number(userId);
      if (!Number.isFinite(properId)) {
        throw new Error('Invalid user ID');
      }

      const foundFavoriteCategories = (await this.db
        .select('*')
        // TODO: Fix this
        .where({ user_id: properId })) as unknown as FavoriteCategoryDb[];

      if (!foundFavoriteCategories || !foundFavoriteCategories?.length) {
        throw new Error('Favorite category not found');
      }

      const parsedFavoriteCategories = foundFavoriteCategories
        .map((favorite): FavoriteCategory | null => {
          const res = favoriteCategoryTransform.safeParse(favorite);
          if (!res.success) {
            console.error('Broken record found: ', favorite);
            return null;
          }
          return res.data;
        })
        .filter((e): e is FavoriteCategory => e !== null);

      return parsedFavoriteCategories;
    } catch (getUserFavoriteCategoriesError) {
      throw new Error(
        `Error while getting favorite categories of user: ${getUserFavoriteCategoriesError}`,
      );
    }
  }
}
