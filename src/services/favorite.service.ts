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

