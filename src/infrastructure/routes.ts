import { Router } from 'express';
import userRouter from '../endpoints/users';
import booksRouter from '../endpoints/book.records';
import favoriteCategoriesRouter from '../endpoints/favoriteCategories';
import suggestionRouter from '../endpoints/suggestion';
import bookRecordsRouter from '../endpoints/book.records';

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
