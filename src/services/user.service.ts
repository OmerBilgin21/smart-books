import { User } from '../infrastructure/db/entities';
import { UsersInterface } from '../interfaces/users.interface';
import { AccessToken, UserCreate } from '../schemas/user';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import envs from '../infrastructure/envs';

const { SECRET_KEY } = envs;
export class UserService {
  constructor(private repository: UsersInterface) {}

  private hashPassword(password: string): string {
    const salt = bcrypt.genSaltSync(10);

    return bcrypt.hashSync(password, salt);
  }

  generateAccessToken(user: User): string {
    return jwt.sign(
      {
        name: user.firstName,
        surname: user.lastName,
        id: user.id,
        email: user.email,
      },
      SECRET_KEY,
      {
        expiresIn: '2 days',
      },
    );
  }

  async toggleFreshness(identifier: string): Promise<User> {
    return this.repository.toggleFreshness(identifier);
  }

  async verifyToken(token: string): Promise<AccessToken> {
    return new Promise<Promise<AccessToken>>((resolve, reject): void => {
      jwt.verify(token, SECRET_KEY, (err: unknown, decoded: unknown): void => {
        if (err) {
          return reject(err ?? new Error('Invalid token payload'));
        }

        const payload = decoded as Promise<AccessToken>;
        resolve(payload);
      });
    });
  }

  async create(user: UserCreate): Promise<User> {
    return this.repository.create({
      ...user,
      password: this.hashPassword(user.password),
    });
  }

  async get(identifier: string): Promise<User> {
    return this.repository.get(identifier);
  }

  async login(email: string, password: string): Promise<User | null> {
    const user = await this.get(email);

    const isMatch = await bcrypt.compare(password, user.password);

    return isMatch ? user : null;
  }
}
