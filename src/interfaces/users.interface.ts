import { UserCreate, User } from '../schemas';

export interface UsersInterface {
  create(user: UserCreate): Promise<User>;
  toggleFreshness(identifier: string): Promise<User>;
  get(identifier: string): Promise<User>;
}
