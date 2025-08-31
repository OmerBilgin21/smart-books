import { User as UserEntity } from '../db/entities';
import { User as UserSchema } from '../../schemas';

export class UserMapper {
  static entityToSchema(entity: UserEntity): UserSchema {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      suggestionIsFresh: entity.suggestionIsFresh,
      password: entity.password,
      email: entity.email,
      books: entity.books ?? [],
      favoriteCategories: entity.categories ?? [],
    };
  }
}
