import {
  Book,
  SuccessfulGoogleResponse,
  SearchObject,
  Relevance,
  SuggestionResult,
} from 'schemas';
import { BooksService } from './books.service';
import { FavoriteService } from './favorite.service';
import { delay } from 'utils';

export class SuggestionService {
  constructor(
    private bookService: BooksService,
    private favoriteService: FavoriteService,
  ) {}

