import {
  Book,
  SuccessfulGoogleResponse,
  SearchObject,
  Relevance,
  SuggestionResult,
} from 'schemas';
import { BooksService } from './books.service';
import { FavoriteService } from './favorite.service';
import { delay } from 'utils';

export class SuggestionService {
  constructor(
    private bookService: BooksService,
    private favoriteService: FavoriteService,
  ) {}

  private async queryTheWholeResult(
    query: SearchObject[],
  ): Promise<SuccessfulGoogleResponse[]> {
    const initialResponse = await this.bookService.getVolumes(query);
    const totalItems = initialResponse.totalItems;
    const promiseArr: Promise<SuccessfulGoogleResponse>[] = [];

    for (let i = 0; i < totalItems; i += 25) {
      promiseArr.push(
        this.bookService.getVolumes(query, { start: i, limit: 1 }),
      );
      delay(300);
    }

    const resolved = await Promise.all(promiseArr);
    return [initialResponse, ...resolved];
  }
}
