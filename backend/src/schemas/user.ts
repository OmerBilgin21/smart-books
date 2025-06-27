import { User } from '../infrastructure/db/entities/index.js';

export type PlainUser = Omit<User, 'books' | 'categories'>;
export type UserCreate = Omit<PlainUser, 'id'>;
