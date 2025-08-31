/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { CustomBaseEntity } from './base.entity';

@Entity('favorite_categories')
export class FavoriteCategory extends CustomBaseEntity {
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
