import { BaseRepository } from './base.repository.js';
import { User } from '../db/entities/index.js';
import { UserCreate } from '../../schemas/user.js';
import { validate } from 'uuid';

import bcrypt from 'bcrypt';
import { UsersInterface } from '../../interfaces/users.interface.js';

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

  public async get(
    identifier: string,
  ): Promise<Omit<User, 'books' | 'categories'>> {
    try {
      const repo = await this.getRepository(User);

      const qb = repo.createQueryBuilder('user');

      if (validate(identifier)) {
        qb.where('user.id = :identifier', { identifier });
      } else {
        qb.where('user.email = :identifier', { identifier });
      }

      return await qb.getOneOrFail();
    } catch (e) {
      throw new Error(`User not found: ${e}`);
    }
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
