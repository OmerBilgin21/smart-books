import { Router } from 'express';
import userRouter from 'endpoints/users';
import booksRouter from 'endpoints/books';
import favoritesRouter from 'endpoints/favorites';
import favoriteCategoriesRouter from 'endpoints/favoriteCategories';
import suggestionRouter from 'endpoints/suggestion';
import dislikeRouter from 'endpoints/dislikes';

export const routes: { router: Router; path: string }[] = [
  {
    router: userRouter,
    path: '/users',
  },
  {
    router: dislikeRouter,
    path: '/dislikes',
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
  {
    router: favoriteCategoriesRouter,
    path: '/favorite-categories',
  },
];
