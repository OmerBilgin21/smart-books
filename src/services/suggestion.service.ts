import {
  Book,
  SuggestionResult,
  SuccessfulGoogleResponse,
  Relevance,
  SearchObject,
} from '../schemas/book.js';
import { BooksService } from './books.service.js';
import { delay } from '../utils/general.js';
import {
  BookRecord,
  FavoriteCategory,
  User,
} from '../infrastructure/db/entities/index.js';
import { BookRecordsRepository } from '../infrastructure/repositories/book.records.repository.js';
import { FavoriteCategoriesRepository } from '../infrastructure/repositories/favorite.categories.repository.js';
import { UsersRepository } from '../infrastructure/repositories/users.repository.js';
import { BookRecordType } from '../infrastructure/db/entities/enums.js';

export class SuggestionService {
  private dislikes: BookRecord[] = [];
  private favoriteCategoriesFromBooks: string[] = [];
  private favoriteAuthors: string[] = [];
  private favoritePublishers: string[] = [];
  private favoriteCategories: FavoriteCategory[] = [];
  private user: User;

  constructor(
    private bookService: BooksService,
    private bookRecordRepository: BookRecordsRepository,
    private favoriteCategoriesRepository: FavoriteCategoriesRepository,
    private usersRepository: UsersRepository,
  ) {}

  private async asyncInit(
    userId: string,
    favoritesOfUser: BookRecord[],
  ): Promise<void> {
    this.dislikes = await this.bookRecordRepository.getRecordsOfTypeForUser(
      userId,
      BookRecordType.DISLIKE,
    );

    this.favoriteCategories =
      await this.favoriteCategoriesRepository.getFavoriteCategoriesOfUser(
        userId,
      );

    const bookPromises = favoritesOfUser.map((favorite): Promise<Book> => {
      return this.bookService.getVolume(favorite.selfLink);
    });

    const favoriteBooks = await Promise.all(bookPromises);

    this.favoriteAuthors = favoriteBooks.flatMap(
      (book): string[] => book.volumeInfo.authors,
    );

    this.favoriteCategoriesFromBooks = favoriteBooks.flatMap((book): string[] =>
      book.volumeInfo.categories.map((category): string => {
        return category;
      }),
    );

    this.favoritePublishers = favoriteBooks
      .map((book): string | undefined | null => book.volumeInfo?.publisher)
      .filter((book): book is string => !!book);

    this.user = await this.usersRepository.get(userId);
  }

  public async generateSuggestionsForUser(
    userId: string,
  ): Promise<SuggestionResult> {
    try {
      const favoritesOfUser =
        await this.bookRecordRepository.getRecordsOfTypeForUser(
          userId,
          BookRecordType.FAVORITE,
        );

      await this.asyncInit(userId, favoritesOfUser);

      if (!favoritesOfUser || !favoritesOfUser.length) {
        console.warn(
          'Can not generate suggestions for a user that does not have any favorites.',
        );
        return {
          relevance: Relevance.NO_SUGGESTION,
          books: [],
        };
      }

      if (this.user.suggestionIsFresh) {
        const alreadySuggestedRecords =
          await this.bookRecordRepository.getRecordsOfTypeForUser(
            userId,
            BookRecordType.SUGGESTION,
          );

        const bookPromises = alreadySuggestedRecords.map(
          (book): Promise<Book> => {
            return this.bookService.getVolume(book.selfLink);
          },
        );

        return {
          relevance: Relevance.NO_SUGGESTION,
          books: await Promise.all(bookPromises),
        };
      }

      const categoryAuthorCombination =
        await this.getAuthorCategoryCombination();

      if (categoryAuthorCombination.books.length) {
        await this.saveSuggestion(userId, categoryAuthorCombination.books);
        await this.usersRepository.suggestionCalculated(userId);
        return categoryAuthorCombination;
      }

      const categoryOverloaded = await this.progressiveCategoryOverload();

      if (categoryOverloaded.books.length) {
        await this.saveSuggestion(userId, categoryOverloaded.books);
        await this.usersRepository.suggestionCalculated(userId);
        return categoryOverloaded;
      }

      const authorSuggestions = await this.getAuthorSuggestions();

      if (authorSuggestions.books.length) {
        await this.saveSuggestion(userId, authorSuggestions.books);
        await this.usersRepository.suggestionCalculated(userId);
        return authorSuggestions;
      }

      const publisherSuggestions = await this.getPublisherSuggestions();

      if (publisherSuggestions.books.length) {
        await this.saveSuggestion(userId, publisherSuggestions.books);
        await this.usersRepository.suggestionCalculated(userId);
        return publisherSuggestions;
      }

      return {
        relevance: Relevance.NO_SUGGESTION,
        books: [],
      };
    } catch (generateSuggestionError) {
      if (this.user.suggestionIsFresh) {
        await this.usersRepository.invalidateFreshness(userId);
      }
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

  private async progressiveCategoryOverload(): Promise<SuggestionResult> {
    // In the worst case scenario, we want to fallback to these categories
    // that were extracted from favorite books
    const singulars = this.favoriteCategoriesFromBooks.map(
      (category): SearchObject => ({ term: 'subject', value: category }),
    );

    // if two or more categories combined returns a book, that's way more relevant
    // than just returning a random book from a singular category
    // combination 1: Combination of favorites categories obtained from user's favorite books
    const combinations1 = this.combineParams(
      this.favoriteCategoriesFromBooks,
      this.favoriteCategoriesFromBooks,
    );

    // combination 2: Combination of hand created favorite categories from user
    // We go from best to worst in terms of rank
    const favoriteCategoryBests: string[] = [];
    const favoriteCategoryWorsts: string[] = [];
    this.favoriteCategories.forEach((favoriteCategory): void => {
      if (favoriteCategory.rank >= 5) {
        favoriteCategoryBests.push(favoriteCategory.name);
      } else {
        favoriteCategoryWorsts.push(favoriteCategory.name);
      }
    });
    const combinations2perfects = this.combineParams(
      favoriteCategoryBests,
      favoriteCategoryBests,
    );
    const combination2Worsts = this.combineParams(
      favoriteCategoryBests,
      favoriteCategoryWorsts,
    );

    // in this case the mix and match is the best case with
    // hand created favorites and read book favorites
    // we check if that's possible first, then try to fully go with
    // hand crafted ones if not
    if (combinations2perfects.length) {
      if (combinations1.length) {
        const newCombination = [...combinations1, ...combinations2perfects];
        return {
          relevance: Relevance.PERFECT,
          books: await this.getChunkedBooks(newCombination),
        };
      }
      return {
        relevance: Relevance.VERY_GOOD,
        books: await this.getChunkedBooks(combinations2perfects),
      };
    } else if (combination2Worsts.length) {
      if (combinations1.length) {
        const newCombination = [...combinations1, ...combination2Worsts];
        return {
          relevance: Relevance.GOOD,
          books: await this.getChunkedBooks(newCombination),
        };
      }
      return {
        relevance: Relevance.MEDIOCRE,
        books: await this.getChunkedBooks(combination2Worsts),
      };
    } else if (combinations1.length) {
      return {
        relevance: Relevance.MEDIOCRE,
        books: await this.getChunkedBooks(combinations1),
      };
    }

    const lessRelevantResults = await this.queryTheWholeResult(singulars);

    return {
      relevance: Relevance.BAD,
      books: this.extractBooksFromResult(lessRelevantResults),
    };
  }

  private async getAuthorCategoryCombination(): Promise<SuggestionResult> {
    // in this case, both cases are near perfect suggestions
    // so we can return them like that
    const favoriteCategoryNames = this.favoriteCategories.map(
      (category): string => category.name,
    );
    const handCraftedFavoriteAndAuthorCombinations = this.combineParams(
      favoriteCategoryNames,
      this.favoriteAuthors,
    );
    if (handCraftedFavoriteAndAuthorCombinations.length) {
      return {
        relevance: Relevance.PERFECT,
        books: await this.getChunkedBooks(
          handCraftedFavoriteAndAuthorCombinations,
        ),
      };
    }
    const authorCategoryCombinations = this.combineParams(
      this.favoriteCategoriesFromBooks,
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

  private getLimitDependingOnChunkSize<T>(chunks: T[][]): number {
    return Math.ceil(50 / chunks.length);
  }

  private async getChunkedBooks(queries: SearchObject[][]): Promise<Book[]> {
    const bookPromises: Promise<SuccessfulGoogleResponse[]>[] = [];
    for (const query of queries) {
      bookPromises.push(
        this.queryTheWholeResult(
          query,
          this.getLimitDependingOnChunkSize(queries),
        ),
      );
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
    limit: number = 5,
  ): Promise<SuccessfulGoogleResponse[]> {
    const initialResponse = await this.bookService.getVolumes(query);
    const promiseArr: Promise<SuccessfulGoogleResponse>[] = [];

    const increaseAmount = 40 - limit < 0 ? 40 : limit;
    for (let i = 0; i < limit; i += increaseAmount) {
      promiseArr.push(
        this.bookService.getVolumes(query, { start: i, limit: 1 }),
      );
      await delay(300);
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

  private async saveSuggestion(userId: string, books: Book[]): Promise<void> {
    const promises = books.map(
      (book): Promise<BookRecord> =>
        this.bookRecordRepository.create({
          // userId: Number(userId),
          selfLink: book.selfLink,
          type: BookRecordType.SUGGESTION,
          userId,
        }),
    );
    await Promise.all(promises);
  }
}
