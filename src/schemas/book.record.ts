import { BookRecord } from '../infrastructure/db/entities/index.js';

export type BookRecordCreate = Omit<BookRecord, 'id' | 'user'> & {
  userId: string;
};
