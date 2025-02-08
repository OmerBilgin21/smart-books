import { User } from '../infrastructure/db/entities/index.js';

export type UserCreate = Omit<User, 'id' | 'books' | 'categories'>;
