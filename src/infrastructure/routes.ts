import { Router } from 'express';
import userRouter from 'endpoints/users';
import booksRouter from 'endpoints/books';
import favoritesRouter from 'endpoints/favorites';
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
    router: favoritesRouter,
    path: '/favorites',
  },
  {
    router: suggestionRouter,
    path: '/suggestions',
  },
];
