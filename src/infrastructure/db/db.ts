import knexConfig from './knexfile';
import knex from 'knex';

export const dbClient = knex(knexConfig);
export const USERS_TABLE = 'users';
export const FAVORITES_TABLE = 'favorites';
