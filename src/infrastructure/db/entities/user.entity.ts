import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BookRecord } from './book.record.entity';
import { FavoriteCategory } from './favorite.category.entity';
import { CustomBaseEntity } from './base.entity';

@Entity('users')
export class User extends CustomBaseEntity {
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
