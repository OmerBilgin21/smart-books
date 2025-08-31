import {
  Book,
  SuggestionResult,
  SuccessfulGoogleResponse,
  Relevance,
  SearchObject,
} from '../schemas/book';
import { BooksService } from './books.service';
import { BookRecordType } from '../infrastructure/db/entities/enums';
import { BookRecordCreate } from '../schemas/book.record';
import { LLMService } from './llm.service';
import { UserService } from './user.service';
import { BookRecordService } from './book.record.service';
import {
  isEmpty,
  isNotEmpty,
  isNotNullish,
  isNullish,
  processAsyncTaskInBatch,
} from '../utils/general';
import { logger } from '../utils/logger';
import { validate } from 'uuid';
import { User, BookRecord, FavoriteCategory } from '../schemas';

type UserData = {
  user: User;
  dislikes: BookRecord[];
  favoriteCategories: FavoriteCategory[];
  favoriteBooks: Book[];
  favoriteAuthors: string[];
  favoriteCategoriesFromBooks: string[];
  favoritePublishers: string[];
};

export class SuggestionService {
  constructor(
    private bookService: BooksService,
    private bookRecordService: BookRecordService,
    private userService: UserService,
    private llmService: LLMService,
  ) {}

  public async asyncInit(userId: string): Promise<UserData> {
    const user = await this.userService.get(userId);

    const favorites = user.books.filter(
      (book): boolean => book.type === BookRecordType.FAVORITE,
    );

    const dislikes = await this.bookRecordService.getRecordsOfTypeForUser(
      userId,
      BookRecordType.DISLIKE,
    );

    const favoriteCategories = user.favoriteCategories;

    const bookPromises = favorites.map((favorite): (() => Promise<Book>) => {
      return (): Promise<Book> => this.bookService.getVolume(favorite.selfLink);
    });

    const favoriteBooks = await processAsyncTaskInBatch(bookPromises, 5);

    const favoriteAuthors = favoriteBooks.flatMap(
      (book): string[] => book.volumeInfo.authors,
    );

    const favoriteCategoriesFromBooks = favoriteBooks.flatMap(
      (book): string[] =>
        book.volumeInfo.categories.map((category): string => {
          return category;
        }),
    );

    const favoritePublishers = favoriteBooks
      .map((book): string | undefined | null => book.volumeInfo?.publisher)
      .filter((book): book is string => !!book);

    return {
      user,
      dislikes,
      favoriteCategories,
      favoriteBooks,
      favoriteAuthors,
      favoriteCategoriesFromBooks,
      favoritePublishers,
    };
  }

  userDataNotValid({
    dislikes,
    favoriteAuthors,
    favoriteCategories,
    favoriteBooks,
    favoriteCategoriesFromBooks,
  }: UserData): boolean {
    return (
      isEmpty(dislikes) &&
      isEmpty(favoriteBooks) &&
      isEmpty(favoriteCategoriesFromBooks) &&
      isEmpty(favoriteAuthors) &&
      isEmpty(favoriteCategories)
    );
  }

  public async generateSuggestionsForUser(
    userId: string,
  ): Promise<SuggestionResult> {
    try {
      if (!validate(userId)) {
        logger('Given user ID is not a UUID!', userId);
        return {
          relevance: Relevance.NO_SUGGESTION,
          books: [],
        };
      }

      const userData = await this.asyncInit(userId);

      logger(`Suggestion generation for user: ${userId} started.`, {
        ...userData,
      });

      if (this.userDataNotValid(userData)) {
        const llmSuggestions = await this.llmService.getGenericSuggestions([]);

        if (isEmpty(llmSuggestions.recommendations)) {
          return {
            relevance: Relevance.VERY_BAD,
            books: [],
          };
        }

        const bookPromises = llmSuggestions.recommendations.map(
          (ls): Promise<SuccessfulGoogleResponse> => {
            const search: SearchObject[] = [
              {
                term: 'title',
                value: ls.name,
              },
            ];
            return this.bookService.getVolumes(search, { start: 0, limit: 1 });
          },
        );

        // here it's fine to do a promise all since we process only 5 books anyway
        const bookResponses = await Promise.all(bookPromises).catch(
          (error): null => {
            logger(
              'Error while retrieving the suggestions of LLM from API',
              error,
            );
            return null;
          },
        );

        if (isNullish(bookResponses)) {
          return {
            books: [],
            relevance: Relevance.NO_SUGGESTION,
          };
        }

        const books = {
          items: bookResponses.flatMap(
            (response): Book[] => response.items || [],
          ),
          totalItems: bookResponses.reduce(
            (total, response): number => total + response.totalItems,
            0,
          ),
        };

        return this.finalizeAndReturn({
          relevance: Relevance.MEDIOCRE,
          books: books.items ?? [],
          userId,
        });
      }

      if (userData.user.suggestionIsFresh) {
        logger(`suggestions are fresh for user, they will be returned`, userId);

        const alreadySuggestedRecords =
          await this.bookRecordService.getRecordsOfTypeForUser(
            userId,
            BookRecordType.SUGGESTION,
            25,
          );

        const bookPromises = alreadySuggestedRecords.map(
          (book): (() => Promise<Book>) => {
            return (): Promise<Book> =>
              this.bookService.getVolume(book.selfLink);
          },
        );

        const books = await processAsyncTaskInBatch(bookPromises, 5);

        return {
          relevance: Relevance.NO_SUGGESTION,
          books: books,
        };
      }

      const categoryAuthorCombination = await this.getAuthorCategoryCombination(
        userData.favoriteCategoriesFromBooks,
        userData.favoriteCategories,
        userData.favoriteAuthors,
        userData.dislikes,
      );

      if (isNotEmpty(categoryAuthorCombination)) {
        return this.finalizeAndReturn({ ...categoryAuthorCombination, userId });
      }

      const categoryOverloaded = await this.progressiveCategoryOverload(
        userData.favoriteCategoriesFromBooks,
        userData.favoriteCategories,
        userData.dislikes,
      );

      if (isNotEmpty(categoryOverloaded)) {
        return this.finalizeAndReturn({ ...categoryOverloaded, userId });
      }

      const authorSuggestions = await this.getAuthorSuggestions(
        userData.favoriteAuthors,
      );

      if (isNotEmpty(authorSuggestions)) {
        return this.finalizeAndReturn({ ...authorSuggestions, userId });
      }

      const publisherSuggestions = await this.getPublisherSuggestions(
        userData.favoritePublishers,
      );

      if (isNotEmpty(publisherSuggestions)) {
        return this.finalizeAndReturn({ ...publisherSuggestions, userId });
      }

      return {
        relevance: Relevance.NO_SUGGESTION,
        books: [],
      };
    } catch (generateSuggestionError) {
      const user = await this.userService.get(userId);

      if (isNotNullish(user) && user.suggestionIsFresh) {
        await this.userService.toggleFreshness(userId);
      }

      logger(
        'Error while generating suggestions for user',
        generateSuggestionError,
      );

      return {
        relevance: Relevance.NO_SUGGESTION,
        books: [],
      };
    }
  }

  private async finalizeAndReturn({
    books,
    relevance,
    userId,
    shouldSave = true,
  }: SuggestionResult & {
    userId: string;
    shouldSave?: boolean;
  }): Promise<SuggestionResult> {
    if (isNotEmpty(books)) {
      if (shouldSave) {
        await this.saveSuggestion(userId, books);
      }

      await this.userService.toggleFreshness(userId);
      return {
        books,
        relevance,
      };
    }

    return {
      relevance: Relevance.VERY_BAD,
      books: [],
    };
  }

  private async getPublisherSuggestions(
    favoritePublishers: UserData['favoritePublishers'],
  ): Promise<SuggestionResult> {
    const publisherQuery = favoritePublishers.map(
      (publisher): SearchObject => ({
        term: 'publisher',
        value: publisher,
      }),
    );

    const results = await this.bookService
      .getVolumes(publisherQuery)
      .catch((error): null => {
        logger(
          'Error while retireving the publisher suggestions from API',
          error,
        );
        return null;
      });

    if (isNullish(results)) {
      return {
        relevance: Relevance.NO_SUGGESTION,
        books: [],
      };
    }

    return {
      relevance: Relevance.VERY_BAD,
      books: results.items,
    };
  }

  private async getAuthorSuggestions(
    favoriteAuthors: UserData['favoriteAuthors'],
  ): Promise<SuggestionResult> {
    const authorQueryObj = favoriteAuthors.map(
      (author): SearchObject => ({
        term: 'authors',
        value: author,
      }),
    );

    const results = await this.bookService
      .getVolumes(authorQueryObj)
      .catch((error): null => {
        logger('Error while retrieving author suggestions', error);
        return null;
      });

    if (isNullish(results)) {
      return {
        relevance: Relevance.NO_SUGGESTION,
        books: [],
      };
    }

    return {
      relevance: Relevance.MEDIOCRE,
      books: results.items,
    };
  }

  private async progressiveCategoryOverload(
    favoriteCategoriesFromBooks: UserData['favoriteCategoriesFromBooks'],
    favoriteCategories: UserData['favoriteCategories'],
    dislikes: UserData['dislikes'],
  ): Promise<SuggestionResult> {
    // In the worst case scenario, we want to fallback to these categories
    // that were extracted from favorite books
    const singulars = favoriteCategoriesFromBooks.map(
      (category): SearchObject => ({ term: 'subject', value: category }),
    );

    // if two or more categories combined returns a book, that's way more relevant
    // than just returning a random book from a singular category
    // combination 1: Combination of favorites categories obtained from user's favorite books
    const combinations1 = this.combineParams(
      favoriteCategoriesFromBooks,
      favoriteCategoriesFromBooks,
    );

    // combination 2: Combination of hand created favorite categories from user
    // We go from best to worst in terms of rank
    const favoriteCategoryBests: string[] = [];
    const favoriteCategoryWorsts: string[] = [];

    favoriteCategories.forEach((favoriteCategory): void => {
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
    if (isNotEmpty(combinations2perfects)) {
      if (isNotEmpty(combinations1)) {
        const newCombination = [...combinations1, ...combinations2perfects];
        return {
          relevance: Relevance.PERFECT,
          books: await this.getChunkedBooks(newCombination, dislikes),
        };
      }

      return {
        relevance: Relevance.VERY_GOOD,
        books: await this.getChunkedBooks(combinations2perfects, dislikes),
      };
    } else if (isNotEmpty(combination2Worsts)) {
      if (isNotEmpty(combinations1)) {
        const newCombination = [...combinations1, ...combination2Worsts];
        return {
          relevance: Relevance.GOOD,
          books: await this.getChunkedBooks(newCombination, dislikes),
        };
      }

      return {
        relevance: Relevance.MEDIOCRE,
        books: await this.getChunkedBooks(combination2Worsts, dislikes),
      };
    } else if (isNotEmpty(combinations1)) {
      return {
        relevance: Relevance.MEDIOCRE,
        books: await this.getChunkedBooks(combinations1, dislikes),
      };
    }

    const lessRelevantResults = await this.bookService.getVolumes(singulars);

    if (isNullish(lessRelevantResults)) {
      return {
        relevance: Relevance.NO_SUGGESTION,
        books: [],
      };
    }

    return {
      relevance: Relevance.BAD,
      books: lessRelevantResults.items,
    };
  }

  private async getAuthorCategoryCombination(
    favoriteCategoriesFromBooks: UserData['favoriteCategoriesFromBooks'],
    favoriteCategories: UserData['favoriteCategories'],
    favoriteAuthors: UserData['favoriteAuthors'],
    dislikes: UserData['dislikes'],
  ): Promise<SuggestionResult> {
    // in this case, both cases are near perfect suggestions
    // so we can return them like that
    const favoriteCategoryNames = favoriteCategories.map(
      (category): string => category.name,
    );

    const handCraftedFavoriteAndAuthorCombinations = this.combineParams(
      favoriteCategoryNames,
      favoriteAuthors,
    );

    if (isNotEmpty(handCraftedFavoriteAndAuthorCombinations)) {
      return {
        relevance: Relevance.PERFECT,
        books: await this.getChunkedBooks(
          handCraftedFavoriteAndAuthorCombinations,
          dislikes,
        ),
      };
    }

    const authorCategoryCombinations = this.combineParams(
      favoriteCategoriesFromBooks,
      favoriteAuthors,
    );

    return {
      relevance: Relevance.PERFECT,
      books: await this.getChunkedBooks(authorCategoryCombinations, dislikes),
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

  private async getChunkedBooks(
    queries: SearchObject[][],
    dislikes: UserData['dislikes'],
  ): Promise<Book[]> {
    const bookPromises: (() => Promise<SuccessfulGoogleResponse>)[] =
      queries.map((query) => {
        return (): Promise<SuccessfulGoogleResponse> =>
          this.bookService.getVolumes(query);
      });

    const responseNestedArr = await processAsyncTaskInBatch(bookPromises, 5);

    const books = responseNestedArr
      .filter((record): boolean => record.totalItems > 0)
      .flatMap((responseArr): Book[] => responseArr.items);

    return this.filterOutDislikes(books, dislikes);
  }

  private filterOutDislikes(
    books: Book[],
    dislikes: UserData['dislikes'],
  ): Book[] {
    if (isEmpty(dislikes)) {
      return books;
    }

    const dislikedBookSelfLinks = dislikes.map(
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
