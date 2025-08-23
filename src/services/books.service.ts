import { AxiosInstance, AxiosResponse } from 'axios';
import { SearchObject, SuccessfulGoogleResponse, Book } from '../schemas/book';
import envs from '../infrastructure/envs';
import { getApi } from '../infrastructure/api/api.base';

const GOOGLE_API_BASE_URL = 'https://www.googleapis.com/books/v1';

type Paginate = {
  start: number;
  limit: number;
};

export class BooksService {
  private client: AxiosInstance;
  private basePath = GOOGLE_API_BASE_URL;

  constructor(client?: AxiosInstance) {
    if (client) {
      this.client = client;
      return;
    }

    if (!this.basePath) {
      throw new Error('Base URL for Google Books API not found!');
    }

    this.client = getApi({
      baseURL: this.basePath,
      timeout: 10000,
    });
  }

  private buildParams(search: SearchObject[], paginate?: Paginate): string {
    const q = search
      .map((s): string => {
        switch (s.term) {
          case 'authors':
            return `inauthor:${s.value}`;
          case 'title':
            return `intitle:${s.value}`;
          case 'subject':
            return `subject:${s.value}`;
          case 'publisher':
            return `inpublisher:${s.value}`;
          default:
            throw new Error('Invalid search term');
        }
      })
      .join('+');

    const params = new URLSearchParams({
      q: q,
      printType: 'books',
      langRestrict: 'en',
      startIndex: String(paginate?.start ?? 0),
      maxResults: String(paginate?.limit ?? 25),
      key: envs.GOOGLE_BOOKS_API_KEY,
    });

    return params.toString();
  }

  public async getVolumes(
    search: SearchObject[],
    paginate?: Paginate,
  ): Promise<SuccessfulGoogleResponse> {
    try {
      const volumeBase = '/volumes';
      const searchUrl = this.buildParams(search, paginate);
      const completeUrl = this.basePath + volumeBase + `?${searchUrl}`;

      const books: AxiosResponse<SuccessfulGoogleResponse> =
        await this.client.get(completeUrl);

      return books.data;
    } catch (getBooksError) {
      throw new Error(`Error while getting books:\n ${getBooksError}`);
    }
  }

  public async getVolume(url: string): Promise<Book> {
    try {
      const directRequestResponse: AxiosResponse<Book> =
        await this.client.get(url);
      return directRequestResponse.data;
    } catch (getBookError) {
      throw new Error(`Error while getting book: ${getBookError}`);
    }
  }
}
