import { BookRecord } from '../infrastructure/db/entities/index';

export type BookRecordCreate = Omit<BookRecord, 'id' | 'user'> & {
  userId: string;
};
