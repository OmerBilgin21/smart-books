import { Router } from 'express';
import userRouter from 'endpoints/users';
import booksRouter from 'endpoints/books';
import favoriteCategoriesRouter from 'endpoints/favoriteCategories';
import suggestionRouter from 'endpoints/suggestion';

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
];
