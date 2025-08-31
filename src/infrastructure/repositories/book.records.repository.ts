import { BaseRepository } from './base.repository';
import { BookRecordCreate } from '../../schemas/book.record';
import { BookRecord, User } from '../db/entities/index';
import { BookRecordType } from '../db/entities/enums';
import { BookRecordInterface } from '../../interfaces/book.records.interface';
import { isNotNullish } from '../../utils/general';

export class BookRecordsRepository
  extends BaseRepository
  implements BookRecordInterface
{
  public async bulkCreate(
    bookRecords: BookRecordCreate[],
  ): Promise<BookRecord[]> {
    const repo = await this.getRepository(BookRecord);
    const usersRepo = await this.getRepository(User);

    if (new Set(bookRecords.map((r): string => r.userId)).size !== 1) {
      throw new Error(
        'Bulk creation of book records for multiple users is forbidden!',
      );
    }

    const user = await usersRepo.findOne({
      where: {
        id: bookRecords[0].userId,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return repo.save(bookRecords);
  }

  public async create(bookRecord: BookRecordCreate): Promise<BookRecord> {
    const repo = await this.getRepository(BookRecord);
    const usersRepo = await this.getRepository(User);

    const user = await usersRepo.findOne({
      where: {
        id: bookRecord.userId,
      },
    });

    if (!user) {
      throw new Error('Given user could not be found!');
    }

    const existingRecord = await repo.findOne({
      where: {
        type: bookRecord.type,
        userId: bookRecord.userId,
        googleId: bookRecord.googleId,
      },
    });

    if (existingRecord) {
      return existingRecord;
    }

    return repo.save(bookRecord);
  }

  public async getRecordsOfTypeForUser(
    userId: string,
    type: BookRecordType,
    take?: number,
  ): Promise<BookRecord[]> {
    const repo = await this.getRepository(BookRecord);

    return repo.find({
      where: {
        id: userId,
        type,
      },
      ...(isNotNullish(take) && { take }),
    });
  }
}
