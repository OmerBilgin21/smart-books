import { User } from '../infrastructure/db/entities';
import { UserCreate } from '../schemas/user';

export interface UsersInterface {
  create(user: UserCreate): Promise<User>;
  toggleFreshness(identifier: string): Promise<User>;
  get(identifier: string): Promise<User>;
}
