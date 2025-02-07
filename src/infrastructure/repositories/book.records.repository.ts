import { BookRecord } from 'infrastructure/db/entities';
import { BaseRepository } from './base.repository';
import { BookRecordCreate } from 'schemas/book.record';
import { BookRecordType } from 'infrastructure/db/entities/enums';

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
