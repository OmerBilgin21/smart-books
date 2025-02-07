import { BaseRepository } from './base.repository';
import { UserCreate } from 'schemas/user';
import { User } from 'infrastructure/db/entities/user';
import bcrypt from 'bcrypt';

export class UsersRepository extends BaseRepository {
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
    try {
      const repo = await this.getRepository(User);

      return await repo
        .createQueryBuilder('user')
        .where('user.id = :identifier or user.email = :identifier', {
          identifier,
        })
        .getOneOrFail();
    } catch {
      throw new Error('User not found');
    }
  }
}
