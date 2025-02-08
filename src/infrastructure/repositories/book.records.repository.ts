import { BaseRepository } from './base.repository.js';
import { BookRecordCreate } from '../../schemas/book.record.js';
import { BookRecord } from '../db/entities/index.js';
import { BookRecordType } from '../db/entities/enums.js';

export class BookRecordsRepository extends BaseRepository {
  public async create(bookRecord: BookRecordCreate): Promise<BookRecord> {
    const repo = await this.getRepository(BookRecord);
    return repo.save({
      ...bookRecord,
      user: {
        id: bookRecord.userId,
      },
    });
  }

  public async getRecordsOfTypeForUser(
    identifier: string,
    type: BookRecordType,
  ): Promise<BookRecord[]> {
    try {
      const repo = await this.getRepository(BookRecord);
      return await repo
        .createQueryBuilder('book_records')
        .where('book_records.user_id = :identifier ', { identifier })
        .andWhere('book_records.type = :bookRecordType', {
          bookRecordType: type,
        })
        .getMany();
    } catch {
      throw new Error('Favorites not found');
    }
  }
}
