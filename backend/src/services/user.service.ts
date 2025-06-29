import { User } from '../infrastructure/db/entities';
import { UsersInterface } from '../interfaces/users.interface';
import { UserCreate } from '../schemas/user';

export class UserService {
  constructor(private repository: UsersInterface) {}

  async create(data: UserCreate): Promise<User> {
    return this.repository.create(data);
  private hashPassword(password: string): string {
    const salt = bcrypt.genSaltSync(10);

    return bcrypt.hashSync(password, salt);
  }
  }

  async get(identifier: string): Promise<User> {
    const user = await this.repository.get(identifier);
    console.log('user: ', user);
    return user;
  }
}
