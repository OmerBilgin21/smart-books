import { Knex } from 'knex';
import { Favorite, FavoriteDb, favoriteTransform } from 'schemas';

export class FavoriteService {
  private db: Knex.QueryBuilder<FavoriteDb>;

  constructor(init: { db: Knex; tableName: string }) {
    this.db = init.db<FavoriteDb>(init.tableName);
  }

  public async create(favorite: Favorite): Promise<Favorite> {
    try {
      const properId = Number(favorite.userId);

      if (!Number.isFinite(properId)) {
        throw new Error('Invalid ID');
      }

      const created: FavoriteDb[] = await this.db.returning('*').insert({
        user_id: properId,
        self_link: favorite.selfLink,
      });

      if (!created || !created?.length) {
        throw new Error('Favorite could not be created');
      }

      return favoriteTransform.parse(created[0]);
    } catch (createFavoriteError) {
      throw new Error(`Error during favorite creation: ${createFavoriteError}`);
    }
  }

  public async get(id: string): Promise<Favorite> {
    try {
      const properId = Number(id);

      if (!Number.isFinite(properId)) {
        throw new Error('Invalid ID');
      }

      const found = await this.db.select('*').where({ id: properId }).first();

      if (!found) {
        throw new Error('Favorite not found');
      }

      return favoriteTransform.parse(found);
    } catch (getFavoriteError) {
      throw new Error(`Error while getting favorites: ${getFavoriteError}`);
    }
  }

  public async userFavorites(userId: string | number): Promise<Favorite[]> {
    try {
      const properId = Number(userId);
      if (!Number.isFinite(properId)) {
        throw new Error('Invalid user ID');
      }

      const foundFavorites = (await this.db
        .select('*')
        // TODO: Fix this
        .where({ user_id: properId })) as unknown as FavoriteDb[];

      if (!foundFavorites || !foundFavorites?.length) {
        throw new Error('Favorite not found');
      }

      const parsedFavorites = foundFavorites
        .map((favorite): Favorite | null => {
          const res = favoriteTransform.safeParse(favorite);
          if (!res.success) {
            console.error('Broken record found: ', favorite);
            return null;
          }
          return res.data;
        })
        .filter((e): e is Favorite => e !== null);

      return parsedFavorites;
    } catch (getUserFavoritesError) {
      throw new Error(
        `Error while getting user favorites: ${getUserFavoritesError}`,
      );
    }
  }
}
