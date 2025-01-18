import { Knex } from 'knex';
import { Suggestion, suggestionTransform, SuggestionDb } from 'schemas';

export class SuggestionStoreService {
  private db: Knex.QueryBuilder<SuggestionDb>;

  constructor(init: { db: Knex; tableName: string }) {
    this.db = init.db<SuggestionDb>(init.tableName);
  }

  public async create(suggestion: Suggestion): Promise<Suggestion> {
    try {
      const properId = Number(suggestion.userId);

      if (!Number.isFinite(properId)) {
        throw new Error('Invalid ID');
      }

      const created: SuggestionDb[] = await this.db.returning('*').insert({
        user_id: properId,
        self_link: suggestion.selfLink,
      });

      if (!created || !created?.length) {
        throw new Error('Suggestion could not be created');
      }

      return suggestionTransform.parse(created[0]);
    } catch (createSuggestionError) {
      throw new Error(
        `Error during suggestion creation: ${createSuggestionError}`,
      );
    }
  }

  public async get(id: string): Promise<Suggestion> {
    try {
      const properId = Number(id);

      if (!Number.isFinite(properId)) {
        throw new Error('Invalid ID');
      }

      const found = await this.db.select('*').where({ id: properId }).first();

      if (!found) {
        throw new Error('Suggestion not found');
      }

      return suggestionTransform.parse(found);
    } catch (getSuggestionError) {
      throw new Error(`Error while getting suggestions: ${getSuggestionError}`);
    }
  }

  public async userSuggestions(userId: string | number): Promise<Suggestion[]> {
    try {
      const properId = Number(userId);
      if (!Number.isFinite(properId)) {
        throw new Error('Invalid user ID');
      }

      const foundSuggestions = (await this.db
        .select('*')
        // TODO: Fix this
        .where({ user_id: properId })) as unknown as SuggestionDb[];

      if (!foundSuggestions || !foundSuggestions?.length) {
        throw new Error('Suggestion not found');
      }

      const parsedSuggestions = foundSuggestions
        .map((suggestion): Suggestion | null => {
          const res = suggestionTransform.safeParse(suggestion);
          if (!res.success) {
            console.error('Broken record found: ', suggestion);
            return null;
          }
          return res.data;
        })
        .filter((e): e is Suggestion => e !== null);

      return parsedSuggestions;
    } catch (getUserSuggestionsError) {
      throw new Error(
        `Error while getting user suggestions: ${getUserSuggestionsError}`,
      );
    }
  }
}
