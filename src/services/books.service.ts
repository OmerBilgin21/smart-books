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
    }

    if (!this.basePath) {
      throw new Error('Base URL for Google Books API not found!');
    }

    this.client = getApi({
      baseURL: this.basePath,
      timeout: 10000,
    });
  }

  private addPostfix(url: string, paginate?: Paginate): string {
    return (
      this.addPagination(url, paginate) +
      `&printType=books&langRestrict=en&key=${envs.GOOGLE_BOOKS_API_KEY}`
    );
  }

  private addPagination(url: string, params?: Paginate): string {
    if (params) {
      return url + `&startIndex=${params.start}&maxResults=25`;
    }
    return url + `&startIndex=0&maxResults=25`;
  }

  private queryBuilder(
    searchObjects: SearchObject[],
    categoryBase: string,
    paginate?: Paginate,
  ): string {
    let finalUrl = '';
    searchObjects.forEach((searchObject, idx): void => {
      let addition = '';

      switch (searchObject.term) {
        case 'authors':
          addition = `inauthor:${searchObject.value}`;
          break;
        case 'title':
          addition = `intitle:${searchObject.value}`;
          break;
        case 'subject':
          addition = `subject:${searchObject.value}`;
          break;
        case 'publisher':
          addition = `inpublisher:${searchObject.value}`;
          break;

        default:
          throw new Error('Invalid search term');
      }

      if (idx === 0) {
        finalUrl = categoryBase + '?q=';
      } else {
        finalUrl += '+';
      }

      finalUrl += addition;
    });

    finalUrl = this.addPostfix(finalUrl, paginate);
    return finalUrl;
  }

  public async getVolumes(
    search: SearchObject[],
    paginate?: Paginate,
  ): Promise<SuccessfulGoogleResponse> {
    try {
      const volumeBase = '/volumes';
      const completeUrl = this.queryBuilder(search, volumeBase, paginate);

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
