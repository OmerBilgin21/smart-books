import { User } from '../infrastructure/db/entities';
import { UserCreate } from '../schemas/user';

export interface UsersInterface {
  create(user: UserCreate): Promise<User>;
  invalidateFreshness(identifier: string): Promise<User>;
  get(identifier: string): Promise<User>;
  suggestionCalculated(identifier: string): Promise<User>;
}
