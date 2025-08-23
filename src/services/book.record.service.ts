import { BookRecord } from '../infrastructure/db/entities';
import { BookRecordType } from '../infrastructure/db/entities/enums';
import { BookRecordInterface } from '../interfaces/book.records.interface';
import { BookRecordCreate } from '../schemas/book.record';

export class BookRecordService {
  constructor(private repository: BookRecordInterface) {}

  async bulkCreate(payload: BookRecordCreate[]): Promise<BookRecord[]> {
    return this.repository.bulkCreate(payload);
  }
  async create(payload: BookRecordCreate): Promise<BookRecord> {
    return this.repository.create(payload);
  }
  async getRecordsOfTypeForUser(
    userId: string,
    type: BookRecordType,
  ): Promise<BookRecord[]> {
    return this.repository.getRecordsOfTypeForUser(userId, type);
  }
}
