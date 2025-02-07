import { User } from 'infrastructure/db/entities';

export type UserCreate = Omit<User, 'id' | 'books' | 'categories'>;
