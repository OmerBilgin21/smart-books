/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('favorite_categories')
export class FavoriteCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'integer' })
  rank: number;

  @ManyToOne(() => User, (user: User) => user.categories, {
    onDelete: 'CASCADE',
  })
  user: User;
}
