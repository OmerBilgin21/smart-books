import { AxiosInstance } from 'axios';
import { BooksService } from './books.service';
import { SearchObject } from '../schemas/book';

const mockAxiosClient = {
  get: jest.fn(),
};
const bookService = new BooksService(
  mockAxiosClient as unknown as AxiosInstance,
);

describe('book service', (): void => {
  test('correctly gets volumes', async (): Promise<void> => {
    const searchTerms: SearchObject[] = [
      {
        term: 'authors',
        value: 'Sir Arthur Conan Doyle',
      },
      {
        term: 'title',
        value: 'Sherlock Holmes',
      },
    ];
    mockAxiosClient.get.mockReturnValueOnce({ data: 'book :D' });
    await bookService.getVolumes(searchTerms, { start: 0, limit: 25 });
    const calledUrl: string = mockAxiosClient.get.mock.calls[0][0];

    expect(calledUrl).toContain('https://www.googleapis.com/books/v1/volumes');
    expect(calledUrl).toContain('inauthor%3ASir+Arthur+Conan+Doyle');
    expect(calledUrl).toContain('intitle%3ASherlock+Holmes');
    expect(calledUrl).toContain('langRestrict=en');
    expect(calledUrl).toContain('startIndex=0');
    expect(calledUrl).toContain('maxResults=25');
    expect(calledUrl).toContain(`key=${process.env.GOOGLE_BOOKS_API_KEY}`);
  });
});
