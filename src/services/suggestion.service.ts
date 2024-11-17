import {
  Book,
  SuccessfulGoogleResponse,
  SearchObject,
  Relevance,
  SuggestionResult,
  Dislike,
  FavoriteCategory,
} from 'schemas';
import { BooksService } from './books.service';
import { FavoriteService } from './favorite.service';
import { DislikeService } from './dislike.service';
import { delay } from 'utils';
import { FavoriteCategoriesService } from './favorite.categories.service';

export class SuggestionService {
  private dislikes: Dislike[] = [];
  private favoriteCategoriesFromBooks: string[] = [];
  private favoriteAuthors: string[] = [];
  private favoritePublishers: string[] = [];
  private favoriteCategories: FavoriteCategory[] = [];

  constructor(
    private bookService: BooksService,
    private favoriteService: FavoriteService,
    private dislikeService: DislikeService,
    private favoriteCategoriesService: FavoriteCategoriesService,
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
      this.dislikes = await this.dislikeService.userDislikes(userId);
      this.favoriteCategories =
        await this.favoriteCategoriesService.userFavoriteCategories(userId);
      const bookPromises = favoritesOfUser.map((favorite): Promise<Book> => {
        return this.bookService.getVolume(favorite.selfLink);
      });

      const favoriteBooks = await Promise.all(bookPromises);
      this.favoriteAuthors = favoriteBooks.flatMap(
        (book): string[] => book.volumeInfo.authors,
      );
      this.favoriteCategories = favoriteBooks.flatMap((book): string[] =>
        book.volumeInfo.categories.map((category): string => {
          return category;
        }),
      );
      this.favoritePublishers = favoriteBooks
        .map((book): string | undefined | null => book.volumeInfo?.publisher)
        .filter((book): book is string => book !== undefined || book !== null);

      const categoryAuthorCombination =
        await this.getAuthorCategoryCombination();

      if (categoryAuthorCombination.books.length) {
        return categoryAuthorCombination;
      }

      const categoryOverloaded = await this.progressiveCategoryOverload();

      if (categoryOverloaded.books.length) {
        return categoryOverloaded;
      }

      const authorSuggestions = await this.getAuthorSuggestions();

      if (authorSuggestions.books.length) {
        return authorSuggestions;
      }

      const publisherSuggestions = await this.getPublisherSuggestions();

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

  private async getPublisherSuggestions(): Promise<SuggestionResult> {
    const publisherQuery = this.favoritePublishers.map(
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

  private async getAuthorSuggestions(): Promise<SuggestionResult> {
    const authorQueryObj = this.favoriteAuthors.map(
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

  private async progressiveCategoryOverload(): Promise<{
    relevance: Relevance;
    books: Book[];
  }> {
    const singulars = this.favoriteCategories.map(
      (category): SearchObject => ({ term: 'subject', value: category }),
    );
    // if two or more categories combined returns a book, that's way more relevant
    // than just returning a random book from a singular category
    const combinations = this.combineParams(
      this.favoriteCategories,
      this.favoriteCategories,
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

  private async getAuthorCategoryCombination(): Promise<SuggestionResult> {
    const authorCategoryCombinations = this.combineParams(
      this.favoriteCategories,
      this.favoriteAuthors,
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
    const books = responseNestedArr.flatMap((responseArr): Book[] =>
      responseArr.flatMap((response): Book[] => response.items),
    );

    return this.filterOutDislikes(books);
  }

  private extractBooksFromResult(results: SuccessfulGoogleResponse[]): Book[] {
    const books = results.flatMap((result): Book[] =>
      result.items.flatMap((e): Book => e),
    );
    return this.filterOutDislikes(books);
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

  private filterOutDislikes(books: Book[]): Book[] {
    if (!this.dislikes.length) {
      return books;
    }

    const dislikedBookSelfLinks = this.dislikes.map(
      (dislike): string => dislike.selfLink,
    );
    return books.filter(
      (book): book is Book => !dislikedBookSelfLinks.includes(book.selfLink),
    );
  }
}
