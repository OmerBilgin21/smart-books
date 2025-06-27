import { Router } from 'express';
import userRouter from '../endpoints/users.js';
import booksRouter from '../endpoints/book.records.js';
import favoriteCategoriesRouter from '../endpoints/favoriteCategories.js';
import suggestionRouter from '../endpoints/suggestion.js';
import bookRecordsRouter from '../endpoints/book.records.js';

export const routes: { router: Router; path: string }[] = [
  {
    router: userRouter,
    path: '/users',
  },
  {
    router: booksRouter,
    path: '/books',
  },
  {
    router: suggestionRouter,
    path: '/suggestions',
  },
  {
    router: favoriteCategoriesRouter,
    path: '/favorite-categories',
  },
  {
    router: bookRecordsRouter,
    path: '/book-records',
  },
];
