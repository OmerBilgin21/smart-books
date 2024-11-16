import { Knex } from 'knex';
import { User, UserDb, userTransform } from 'schemas';
import bcrypt from 'bcrypt';

export class UserService {
  private db: Knex.QueryBuilder<UserDb>;

  constructor(init: { db: Knex; tableName: string }) {
    this.db = init.db<UserDb>(init.tableName);
  }

  public async create(user: User): Promise<User> {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      const existingUser = await this.db
        .select('*')
        .where({ email: user.email })
        .first();

      if (existingUser) {
        throw new Error('User already exists!');
      }

      const createdUser: UserDb[] = await this.db.returning('*').insert({
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        password: hashedPassword,
      });

      if (!createdUser || !createdUser?.length) {
        throw new Error('Db operation failed');
      }

      return userTransform.parse(createdUser[0]);
    } catch (createUserError) {
      throw new Error(`Error while creating user: ${createUserError}`);
    }
  }

  public async get(identifier: string): Promise<User> {
    try {
      const id = Number(identifier);
      const isId = Number.isFinite(id);

      const found = await this.db
        .select('*')
        .where(isId ? { id } : { email: identifier })
        .first();

      if (!found) {
        throw new Error('User does not exist!');
      }

      return userTransform.parse(found);
    } catch (getUserError) {
      throw new Error(`User not found: ${getUserError}`);
    }
  }
}
