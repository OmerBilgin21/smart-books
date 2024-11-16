import { GOOGLE_BOOKS_API_KEY } from 'infrastructure';
import axios, { AxiosResponse } from 'axios';
import { SearchObject, SuccessfulGoogleResponse, Book } from 'schemas';

const GOOGLE_API_BASE_URL = 'https://www.googleapis.com/books/v1';
const base = axios.create({
  baseURL: GOOGLE_API_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: '*/*',
  },
});

type Paginate = {
  start: number;
  limit: number;
};

export class BooksService {
  constructor() {}

  private addPostfix(url: string, paginate?: Paginate): string {
    return (
      this.addPagination(url, paginate) +
      `&printType=books&langRestrict=en&key=${GOOGLE_BOOKS_API_KEY}`
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
        await base.get(completeUrl);

      return books.data;
    } catch (getBooksError) {
      console.error(getBooksError);
      throw new Error(`Error while getting books:\n ${getBooksError}`);
    }
  }

  public async getVolume(url: string): Promise<Book> {
    try {
      const directRequestResponse: AxiosResponse<Book> = await axios.get(url);
      return directRequestResponse.data;
    } catch (getBookError) {
      throw new Error(`Error while getting book: ${getBookError}`);
    }
  }
}
