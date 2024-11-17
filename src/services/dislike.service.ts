import { Knex } from 'knex';
import { Dislike, DislikeDb, dislikeTransform } from 'schemas';

export class DislikeService {
  private db: Knex.QueryBuilder<DislikeDb>;

  constructor(init: { db: Knex; tableName: string }) {
    this.db = init.db<DislikeDb>(init.tableName);
  }

  public async create(dislike: Dislike): Promise<Dislike> {
    try {
      const properId = Number(dislike.userId);

      if (!Number.isFinite(properId)) {
        throw new Error('Invalid ID');
      }

      const created: DislikeDb[] = await this.db.returning('*').insert({
        user_id: properId,
        self_link: dislike.selfLink,
      });

      if (!created || !created?.length) {
        throw new Error('Dislike could not be created');
      }

      return dislikeTransform.parse(created[0]);
    } catch (createDislikeError) {
      throw new Error(`Error during dislike creation: ${createDislikeError}`);
    }
  }

  public async get(id: string): Promise<Dislike> {
    try {
      const properId = Number(id);

      if (!Number.isFinite(properId)) {
        throw new Error('Invalid ID');
      }

      const found = await this.db.select('*').where({ id: properId }).first();

      if (!found) {
        throw new Error('Dislike not found');
      }

      return dislikeTransform.parse(found);
    } catch (getDislikeError) {
      throw new Error(`Error while getting dislikes: ${getDislikeError}`);
    }
  }

  public async userDislikes(userId: string | number): Promise<Dislike[]> {
    try {
      const properId = Number(userId);
      if (!Number.isFinite(properId)) {
        throw new Error('Invalid user ID');
      }

      const foundDislikes = (await this.db
        .select('*')
        // TODO: Fix this
        .where({ user_id: properId })) as unknown as DislikeDb[];

      if (!foundDislikes || !foundDislikes?.length) {
        throw new Error('Dislike not found');
      }

      const parsedDislikes = foundDislikes
        .map((dislike): Dislike | null => {
          const res = dislikeTransform.safeParse(dislike);
          if (!res.success) {
            console.error('Broken record found: ', dislike);
            return null;
          }
          return res.data;
        })
        .filter((e): e is Dislike => e !== null);

      return parsedDislikes;
    } catch (getUserDislikesError) {
      throw new Error(
        `Error while getting user dislikes: ${getUserDislikesError}`,
      );
    }
  }
}
