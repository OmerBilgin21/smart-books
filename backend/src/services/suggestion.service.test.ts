import { BooksService } from './books.service';
import { SuggestionService } from './suggestion.service';
import {
  mockBooks,
  mockFavoriteCategories,
  mockUser,
  mockGoogleResponse,
} from '../utils/mocks';
import { UsersRepository } from '../infrastructure/repositories/users.repository';
import { FavoriteCategoriesRepository } from '../infrastructure/repositories/favorite.categories.repository';
import { BookRecordsRepository } from '../infrastructure/repositories/book.records.repository';
import { Relevance } from '../schemas/book';

const mockFavoriteCategoriesService = {
  userFavoriteCategories: jest.fn(),
};
const mockBooksService = {
  getVolumes: jest.fn(),
  getVolume: jest.fn(),
};
const mockBookRecordRepository = {
  create: jest.fn(),
  getRecordsOfTypeForUser: jest.fn(),
};
const mockFavoriteCategoriesRepository = {
  create: jest.fn(),
  getFavoriteCategoriesOfUser: jest.fn(),
};
const mockUsersRepository = {
  create: jest.fn(),
  get: jest.fn(),
  suggestionCalculated: jest.fn(),
  invalidateFreshnes: jest.fn(),
};

const suggestionService = new SuggestionService(
  mockBooksService as unknown as BooksService,
  mockBookRecordRepository as unknown as BookRecordsRepository,
  mockFavoriteCategoriesRepository as unknown as FavoriteCategoriesRepository,
  mockUsersRepository as unknown as UsersRepository,
);

describe('Suggestion Service', (): void => {
  test('returns empty array if there are no favorite books', async (): Promise<void> => {
    mockBookRecordRepository.getRecordsOfTypeForUser.mockResolvedValueOnce([]);
    const books =
      await suggestionService.generateSuggestionsForUser('mock-id-1');
    expect(books.books.length).toBe(0);
    expect(books.relevance).toBe(Relevance.NO_SUGGESTION);
  });

  test('Suggests relevant books for author/category combination', async (): Promise<void> => {
    mockBookRecordRepository.getRecordsOfTypeForUser.mockResolvedValueOnce([]);
    mockBookRecordRepository.getRecordsOfTypeForUser.mockResolvedValueOnce([]);
    mockFavoriteCategoriesService.userFavoriteCategories.mockReturnValueOnce(
      mockFavoriteCategories,
    );
    mockBooksService.getVolume.mockReturnValueOnce(mockBooks[0]);
    mockBooksService.getVolumes.mockResolvedValue(mockGoogleResponse);
    const books = await suggestionService.generateSuggestionsForUser(
      mockUser.id,
    );
    expect(mockBooksService.getVolumes).toBeCalledWith([
      { term: 'authors', value: 'Jane Doe' },
      { term: 'subject', value: 'fiction' },
    ]);

    expect(mockBooksService.getVolumes).toBeCalledWith([
      { term: 'authors', value: 'Jane Doe' },
      { term: 'subject', value: 'poem' },
    ]);

    expect(books.relevance).toBe(Relevance.PERFECT);
    expect(mockBooksService.getVolumes).toBeCalledTimes(4);
    expect(books.books.length).toBe(mockGoogleResponse.totalItems * 4);
  });
});
