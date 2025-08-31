import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BookRecord } from './book.record.entity';
import { FavoriteCategory } from './favorite.category.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string;

  @Column({ default: false })
  suggestionIsFresh: boolean;

  @Index()
  @Column({ unique: true })
  email: string;

  @OneToMany('BookRecord', 'user', {
    eager: false,
  })
  books: BookRecord[];

  @OneToMany('FavoriteCategory', 'user', {
    eager: false,
  })
  categories: FavoriteCategory[];
}
