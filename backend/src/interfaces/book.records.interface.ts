import { BookRecord } from '../infrastructure/db/entities';
import { BookRecordType } from '../infrastructure/db/entities/enums';
import { BookRecordCreate } from '../schemas/book.record';

export interface BookRecordInterface {
  bulkCreate(bookRecords: BookRecordCreate[]): Promise<BookRecord[]>;
  create(bookRecord: BookRecordCreate): Promise<BookRecord>;
  getRecordsOfTypeForUser(
    userId: string,
    type: BookRecordType,
  ): Promise<BookRecord[]>;
}
