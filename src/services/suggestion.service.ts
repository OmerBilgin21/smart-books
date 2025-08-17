import {
  Book,
  SuggestionResult,
  SuccessfulGoogleResponse,
  Relevance,
  SearchObject,
} from '../schemas/book';
import { BooksService } from './books.service';
import {
  BookRecord,
  FavoriteCategory,
} from '../infrastructure/db/entities/index';
import { BookRecordType } from '../infrastructure/db/entities/enums';
import { PlainUser } from '../schemas/user';
import { BookRecordCreate } from '../schemas/book.record';
import { logger } from '../utils/logger';
import { LLMService } from './llm.service';
import { UserService } from './user.service';
import { BookRecordService } from './book.record.service';
import { FavoriteCategoryService } from './favorite.category.service';

export class SuggestionService {
  private dislikes: BookRecord[] = [];
  private favorites: BookRecord[] = [];
  private favoriteCategoriesFromBooks: string[] = [];
  private favoriteAuthors: string[] = [];
  private favoritePublishers: string[] = [];
  private favoriteCategories: FavoriteCategory[] = [];
  private user: PlainUser;

  constructor(
    private bookService: BooksService,
    private bookRecordService: BookRecordService,
    private favoriteCategoryService: FavoriteCategoryService,
    private userService: UserService,
    private llmService: LLMService,
  ) {}

  private async asyncInit(userId: string): Promise<void> {
    const found = await this.userService.get(userId);
    this.user = found;

    this.favorites = await this.bookRecordService.getRecordsOfTypeForUser(
      userId,
      BookRecordType.FAVORITE,
    );

    this.dislikes = await this.bookRecordService.getRecordsOfTypeForUser(
      userId,
      BookRecordType.DISLIKE,
    );

    this.favoriteCategories =
      await this.favoriteCategoryService.getFavoriteCategoriesOfUser(userId);

    const bookPromises = this.favorites.map((favorite): Promise<Book> => {
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

    logger('models:', await this.llmService.getModels());
  }

  public async generateSuggestionsForUser(
    userId: string,
  ): Promise<SuggestionResult> {
    try {
      await this.asyncInit(userId);

      if (!this.favorites || !this.favorites.length) {
        logger(
          'Can not generate suggestions for a user that does not have any favorites.',
        );
        return {
          relevance: Relevance.NO_SUGGESTION,
          books: [],
        };
      }

      if (this.user.suggestionIsFresh) {
        const alreadySuggestedRecords =
          await this.bookRecordService.getRecordsOfTypeForUser(
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
        await this.userService.toggleFreshness(userId);
        return categoryAuthorCombination;
      }

      const categoryOverloaded = await this.progressiveCategoryOverload();

      if (categoryOverloaded.books.length) {
        await this.saveSuggestion(userId, categoryOverloaded.books);
        await this.userService.toggleFreshness(userId);
        return categoryOverloaded;
      }

      const authorSuggestions = await this.getAuthorSuggestions();

      if (authorSuggestions.books.length) {
        await this.saveSuggestion(userId, authorSuggestions.books);
        await this.userService.toggleFreshness(userId);
        return authorSuggestions;
      }

      const publisherSuggestions = await this.getPublisherSuggestions();

      if (publisherSuggestions.books.length) {
        await this.saveSuggestion(userId, publisherSuggestions.books);
        await this.userService.toggleFreshness(userId);
        return publisherSuggestions;
      }

      return {
        relevance: Relevance.NO_SUGGESTION,
        books: [],
      };
    } catch (generateSuggestionError) {
      if (this.user && this.user.suggestionIsFresh) {
        await this.userService.toggleFreshness(userId);
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
    const results = await this.bookService.getVolumes(publisherQuery);

    return {
      relevance: Relevance.VERY_BAD,
      books: results.items,
    };
  }

  private async getAuthorSuggestions(): Promise<SuggestionResult> {
    const authorQueryObj = this.favoriteAuthors.map(
      (author): SearchObject => ({
        term: 'authors',
        value: author,
      }),
    );
    const results = await this.bookService.getVolumes(authorQueryObj);
    return {
      relevance: Relevance.MEDIOCRE,
      books: results.items,
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

    const lessRelevantResults = await this.bookService.getVolumes(singulars);

    return {
      relevance: Relevance.BAD,
      books: lessRelevantResults.items,
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

  private async getChunkedBooks(queries: SearchObject[][]): Promise<Book[]> {
    const bookPromises: Promise<SuccessfulGoogleResponse>[] = [];
    for (const query of queries) {
      bookPromises.push(this.bookService.getVolumes(query));
    }

    const responseNestedArr = await Promise.all(bookPromises);

    const books = responseNestedArr
      .filter((record): boolean => record.totalItems > 0)
      .flatMap((responseArr): Book[] => responseArr.items);

    return this.filterOutDislikes(books);
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
    const creatableBookRecords = books.map((book): BookRecordCreate => {
      return {
        selfLink: book.selfLink,
        type: BookRecordType.SUGGESTION,
        googleId: book.id,
        userId,
      };
    });

    await this.bookRecordService.bulkCreate(creatableBookRecords);
  }
}
