import { User } from '../infrastructure/db/entities';
import { UserCreate } from '../schemas/user';

export interface UsersInterface {
  create(user: UserCreate): Promise<User>;
  get(identifier: string): Promise<Omit<User, 'books' | 'categories'>>;
  suggestionCalculated(identifier: string): Promise<User>;
  invalidateFreshness(identifier: string): Promise<User>;
}
