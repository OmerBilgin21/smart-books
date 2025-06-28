/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { BookRecordType } from './enums';
import { User } from './user';

@Unique('prevent_same_book_entry_for_same_type', [
  'selfLink',
  'googleId',
  'type',
  'user',
])
@Entity('book_records')
export class BookRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  selfLink: string;

  @Column({
    type: 'enum',
    enum: BookRecordType,
    default: BookRecordType.FAVORITE,
  })
  type: BookRecordType;

  @Column()
  googleId: string;

  @ManyToOne(() => User, (user) => user.books)
  user: User;
}
