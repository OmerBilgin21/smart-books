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

  private async getChunkedBooks(queries: SearchObject[][]): Promise<Book[]> {
    const bookPromises: Promise<SuccessfulGoogleResponse[]>[] = [];
    for (const query of queries) {
      bookPromises.push(this.queryTheWholeResult(query));
    }

    const responseNestedArr = await Promise.all(bookPromises);
    return responseNestedArr.flatMap((responseArr): Book[] =>
      responseArr.flatMap((response): Book[] => response.items),
    );
  }

  private extractBooksFromResult(results: SuccessfulGoogleResponse[]): Book[] {
    return results.flatMap((result): Book[] =>
      result.items.flatMap((e): Book => e),
    );
  }

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
