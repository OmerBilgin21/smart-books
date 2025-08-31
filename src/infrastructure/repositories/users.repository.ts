import { BaseRepository } from './base.repository';
import { User as UserEntity } from '../db/entities/index';
import { UserCreate, User } from '../../schemas';

import { UsersInterface } from '../../interfaces/users.interface';
import { FindOptionsWhere } from 'typeorm';
import { validate } from 'uuid';
import { UserMapper } from '../mappers/user.mapper';

export class UsersRepository extends BaseRepository implements UsersInterface {
  public async create(user: UserCreate): Promise<User> {
    const repo = await this.getRepository(UserEntity);
    const savedEntity = await repo.save(user);
    return UserMapper.entityToSchema(savedEntity);
  }

  public async get(identifier: string): Promise<User> {
    const repo = await this.getRepository(UserEntity);

    const whereCondition: FindOptionsWhere<UserEntity> = {
      ...(validate(identifier) ? { id: identifier } : { email: identifier }),
    };

    const user = await repo.findOne({
      where: whereCondition,
      relations: ['books', 'categories'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    return UserMapper.entityToSchema(user);
  }

  public async toggleFreshness(identifier: string): Promise<User> {
    const repo = await this.getRepository(UserEntity);
    const userEntity = await repo.findOne({
      where: validate(identifier) ? { id: identifier } : { email: identifier },
    });

    if (!userEntity) {
      throw new Error('User not found');
    }

    const updatedEntity = await repo.save({
      ...userEntity,
      suggestionIsFresh: !userEntity.suggestionIsFresh,
    });

    return UserMapper.entityToSchema(updatedEntity);
  }
}
