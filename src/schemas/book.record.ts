import { BookRecord } from 'infrastructure/db/entities';

export type BookRecordCreate = Omit<BookRecord, 'id' | 'user'> & {
  userId: string;
};
