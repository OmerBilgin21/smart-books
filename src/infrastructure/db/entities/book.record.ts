/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { BookRecordType } from './enums.js';
import { User } from './user.js';

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

  @ManyToOne(() => User, (user) => user.books)
  user: User;
}
