import knexConfig from './knexfile';
import knex from 'knex';

export const dbClient = knex(knexConfig);
export const USERS_TABLE = 'users';
export const FAVORITES_TABLE = 'favorites';
export const DISLIKES_TABLE = 'dislikes';
export const FAVORITE_CATEGORIES_TABLE = 'favorite_categories';
