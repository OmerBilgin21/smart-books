import { BaseRepository } from './base.repository';
import { User } from '../db/entities/index';
import { UserCreate } from '../../schemas/user';

import bcrypt from 'bcrypt';
import { UsersInterface } from '../../interfaces/users.interface';

export class UsersRepository extends BaseRepository implements UsersInterface {
  public async create(user: UserCreate): Promise<User> {
    const repo = await this.getRepository(User);
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(user.password, salt);

    const ins = repo.create({
      ...user,
      password: hashed,
    });

    return repo.save(ins);
  }

  public async get(identifier: string): Promise<User> {
    console.log('identifier: ', identifier);
    const repo = await this.getRepository(User);

    const user = await repo.findOne({
      where: [{ id: identifier }, { email: identifier }],
      relations: ['books', 'categories'],
    });

    if (!user) {
      throw new Error('not found');
    }

    return user;
  }

  public async invalidateFreshness(identifier: string): Promise<User> {
    const repo = await this.getRepository(User);
    const user = await this.get(identifier);
    return repo.save({
      ...user,
      suggestionIsFresh: false,
    });
  }

  public async suggestionCalculated(identifier: string): Promise<User> {
    const repo = await this.getRepository(User);
    const user = await this.get(identifier);

    return repo.save({
      id: user.id,
      suggestionIsFresh: true,
    });
  }
}
