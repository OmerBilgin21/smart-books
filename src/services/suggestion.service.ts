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
import { LLMService } from './llm.service';
import { UserService } from './user.service';
import { BookRecordService } from './book.record.service';
import { FavoriteCategoryService } from './favorite.category.service';
import { isEmpty, isNotEmpty, isNotNullish } from '../utils/general';
import { logger } from '../utils/logger';

type UserData = {
  user: PlainUser;
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
    private favoriteCategoryService: FavoriteCategoryService,
    private userService: UserService,
    private llmService: LLMService,
  ) {}

  public async asyncInit(userId: string): Promise<UserData> {
    const user = await this.userService.get(userId);

    const favorites = await this.bookRecordService.getRecordsOfTypeForUser(
      userId,
      BookRecordType.FAVORITE,
    );

    const dislikes = await this.bookRecordService.getRecordsOfTypeForUser(
      userId,
      BookRecordType.DISLIKE,
    );

    const favoriteCategories =
      await this.favoriteCategoryService.getFavoriteCategoriesOfUser(userId);

    const bookPromises = favorites.map((favorite): Promise<Book> => {
      return this.bookService.getVolume(favorite.selfLink);
    });

    const favoriteBooks = await Promise.all(bookPromises);

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
      const userData = await this.asyncInit(userId);
      logger(`Suggestion generation for user: ${userId} started.`, {
        ...userData,
      });

      if (this.userDataNotValid(userData)) {
        const llmSuggestions = await this.llmService.getGenericSuggestions(
          [] as string[],
        );

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

        const bookResponses = await Promise.all(bookPromises);
        const books = {
          items: bookResponses.flatMap(
            (response): Book[] => response.items || [],
          ),
          totalItems: bookResponses.reduce(
            (total, response): number => total + response.totalItems,
            0,
          ),
        };

        const final = books.items ?? [];
        return this.finalizeAndReturn({
          relevance: Relevance.MEDIOCRE,
          books: final,
          userId,
        });
      }

      if (userData.user.suggestionIsFresh) {
        const alreadySuggestedRecords =
          await this.bookRecordService.getRecordsOfTypeForUser(
            userId,
            BookRecordType.SUGGESTION,
            25,
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
      throw new Error(
        `Error while generating suggestions for user: ${generateSuggestionError}`,
      );
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
    const results = await this.bookService.getVolumes(publisherQuery);

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
    const results = await this.bookService.getVolumes(authorQueryObj);
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
    const bookPromises: Promise<SuccessfulGoogleResponse>[] = [];
    for (const query of queries) {
      bookPromises.push(this.bookService.getVolumes(query));
    }

    const responseNestedArr = await Promise.all(bookPromises);

    const books = responseNestedArr
      .filter((record): boolean => record.totalItems > 0)
      .flatMap((responseArr): Book[] => responseArr.items);

    return this.filterOutDislikes(books, dislikes);
  }

  private filterOutDislikes(
    books: Book[],
    dislikes: UserData['dislikes'],
  ): Book[] {
    if (isNotEmpty(dislikes)) {
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
