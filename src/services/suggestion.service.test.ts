import { FavoriteService } from './favorite.service';
import { FavoriteCategoriesService } from './favorite.categories.service';
import { BooksService } from './books.service';
import { SuggestionService } from './suggestion.service';
import { DislikeService } from './dislike.service';
import {
  mockBooks,
  mockDislike,
  mockFavorite,
  mockFavoriteCategories,
  mockUser,
  mockGoogleResponse,
} from '../utils/mocks';
import { Relevance } from 'schemas';

const mockFavoriteService = {
  userFavorites: jest.fn(),
};
const mockFavoriteCategoriesService = {
  userFavoriteCategories: jest.fn(),
};
const mockBooksService = {
  getVolumes: jest.fn(),
  getVolume: jest.fn(),
};
const mockDislikeService = {
  userDislikes: jest.fn(),
};

const suggestionService = new SuggestionService(
  mockBooksService as unknown as BooksService,
  mockFavoriteService as unknown as FavoriteService,
  mockDislikeService as unknown as DislikeService,
  mockFavoriteCategoriesService as unknown as FavoriteCategoriesService,
);

beforeEach((): void => {
  mockBooksService.getVolumes.mockClear();
  mockBooksService.getVolume.mockClear();
  mockFavoriteService.userFavorites.mockClear();
  mockDislikeService.userDislikes.mockClear();
});

describe('Suggestion Service', (): void => {
  test('returns empty array if there are no favorite books', async (): Promise<void> => {
    mockFavoriteService.userFavorites.mockResolvedValueOnce([]);
    const books = await suggestionService.generateSuggestionsForUser(1);
    expect(books.books.length).toBe(0);
    expect(books.relevance).toBe(Relevance.NO_SUGGESTION);
  });

  test('Suggests relevant books for author/category combination', async (): Promise<void> => {
    mockFavoriteService.userFavorites.mockReturnValueOnce([mockFavorite]);
    mockDislikeService.userDislikes.mockReturnValueOnce(mockDislike);
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
