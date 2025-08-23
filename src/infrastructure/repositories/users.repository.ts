import { BaseRepository } from './base.repository';
import { User } from '../db/entities/index';
import { UserCreate } from '../../schemas/user';

import { UsersInterface } from '../../interfaces/users.interface';
import { FindOptionsWhere } from 'typeorm';
import { validate } from 'uuid';

export class UsersRepository extends BaseRepository implements UsersInterface {
  public async create(user: UserCreate): Promise<User> {
    const repo = await this.getRepository(User);

    return repo.save(user);
  }

  public async get(identifier: string): Promise<User> {
    const repo = await this.getRepository(User);

    const whereCondition: FindOptionsWhere<User> = {
      ...(validate(identifier) ? { id: identifier } : { email: identifier }),
    };

    const user = await repo.findOne({
      where: whereCondition,
      relations: ['books', 'categories'],
    });

    if (!user) {
      throw new Error('not found');
    }

    return user;
  }

  public async toggleFreshness(identifier: string): Promise<User> {
    const repo = await this.getRepository(User);
    const user = await this.get(identifier);
    return repo.save({
      ...user,
      suggestionIsFresh: !user.suggestionIsFresh,
    });
  }
}
