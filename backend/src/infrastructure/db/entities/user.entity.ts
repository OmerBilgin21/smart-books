import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
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

  @Column({ unique: true })
  email: string;

  @OneToMany('BookRecord', 'user')
  books: BookRecord[];

  @OneToMany('FavoriteCategory', 'user')
  categories: FavoriteCategory[];
}
