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

