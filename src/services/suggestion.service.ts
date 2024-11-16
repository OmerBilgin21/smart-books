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

  public async generateSuggestionsForUser(
    userId: string | number,
  ): Promise<SuggestionResult> {
    try {
      const favoritesOfUser = await this.favoriteService.userFavorites(userId);
      if (!favoritesOfUser || !favoritesOfUser.length) {
        console.warn(
          'Can not generate suggestions for a user that does not have any favorites.',
        );
        return {
          relevance: Relevance.NO_SUGGESTION,
          books: [],
        };
      }
      const bookPromises = favoritesOfUser.map((favorite): Promise<Book> => {
        return this.bookService.getVolume(favorite.selfLink);
      });

      const favoriteBooks = await Promise.all(bookPromises);
      const favoriteAuthors = favoriteBooks.flatMap(
        (book): string[] => book.volumeInfo.authors,
      );
      const favoriteCategories = favoriteBooks.flatMap((book): string[] =>
        book.volumeInfo.categories.map((category): string => {
          return category;
        }),
      );
      const favoritePublishers = favoriteBooks
        .map((book): string | undefined | null => book.volumeInfo?.publisher)
        .filter((book): book is string => book !== undefined || book !== null);

      const categoryAuthorCombination = await this.getAuthorCategoryCombination(
        favoriteCategories,
        favoriteAuthors,
      );

      if (categoryAuthorCombination.books.length) {
        return categoryAuthorCombination;
      }

      const categoryOverloaded =
        await this.progressiveCategoryOverload(favoriteCategories);

      if (categoryOverloaded.books.length) {
        return categoryOverloaded;
      }

      const authorSuggestions =
        await this.getAuthorSuggestions(favoriteAuthors);

      if (authorSuggestions.books.length) {
        return authorSuggestions;
      }

      const publisherSuggestions =
        await this.getPublisherSuggestions(favoritePublishers);

      if (publisherSuggestions.books.length) {
        return publisherSuggestions;
      }

      return {
        relevance: Relevance.NO_SUGGESTION,
        books: [],
      };
    } catch (generateSuggestionError) {
      throw new Error(
        `Error while generating suggestions for user: ${generateSuggestionError}`,
      );
    }
  }

  private async getPublisherSuggestions(
    publishers: string[],
  ): Promise<SuggestionResult> {
    const publisherQuery = publishers.map(
      (publisher): SearchObject => ({
        term: 'publisher',
        value: publisher,
      }),
    );
    const results = await this.queryTheWholeResult(publisherQuery);
    return {
      relevance: Relevance.VERY_BAD,
      books: this.extractBooksFromResult(results),
    };
  }

  private async getAuthorSuggestions(
    favoriteAuthors: string[],
  ): Promise<SuggestionResult> {
    const authorQueryObj = favoriteAuthors.map(
      (author): SearchObject => ({
        term: 'authors',
        value: author,
      }),
    );
    const results = await this.queryTheWholeResult(authorQueryObj);
    return {
      relevance: Relevance.MEDIOCRE,
      books: this.extractBooksFromResult(results),
    };
  }

  private async progressiveCategoryOverload(
    favoriteCategories: string[],
  ): Promise<{ relevance: Relevance; books: Book[] }> {
    const singulars = favoriteCategories.map(
      (category): SearchObject => ({ term: 'subject', value: category }),
    );
    // if two or more categories combined returns a book, that's way more relevant
    // than just returning a random book from a singular category
    const combinations = this.combineParams(
      favoriteCategories,
      favoriteCategories,
    );

    if (combinations.length) {
      return {
        relevance: Relevance.VERY_GOOD,
        books: await this.getChunkedBooks(combinations),
      };
    }

    const lessRelevantResults = await this.queryTheWholeResult(singulars);
    return {
      relevance: Relevance.BAD,
      books: this.extractBooksFromResult(lessRelevantResults),
    };
  }

  private async getAuthorCategoryCombination(
    favoriteCategories: string[],
    favoriteAuthors: string[],
  ): Promise<SuggestionResult> {
    const authorCategoryCombinations = this.combineParams(
      favoriteCategories,
      favoriteAuthors,
    );
    return {
      relevance: Relevance.PERFECT,
      books: await this.getChunkedBooks(authorCategoryCombinations),
    };
  }

  private combineParams(
    paramOne: string[],
    paramTwo: string[],
  ): SearchObject[][] {
    const combinations: SearchObject[][] = [];

    for (const category of paramOne) {
      for (const author of paramTwo) {
        const authorQuery: SearchObject = {
          term: 'authors',
          value: author,
        };
        const categoryQuery: SearchObject = {
          term: 'subject',
          value: category,
        };
        combinations.push([authorQuery, categoryQuery]);
      }
    }
    return combinations;
  }

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
