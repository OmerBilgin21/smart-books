import { BaseRepository } from './base.repository';
import { BookRecordCreate } from '../../schemas/book.record';
import { BookRecord, User } from '../db/entities/index';
import { BookRecordType } from '../db/entities/enums';
import { BookRecordInterface } from '../../interfaces/book.records.interface';
import { isNotNullish } from '../../utils/general';
import { logger } from '../../utils/logger';

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

    const creatable: BookRecordCreate[] = [];

    const findCriteria = bookRecords.map(
      (r): { type: BookRecordType; userId: string; googleId: string } => ({
        type: r.type,
        userId: r.userId,
        googleId: r.googleId,
      }),
    );

    const existing = await repo.find({ where: findCriteria });

    const duplicates = existing.reduce(
      (acc, r): Record<string, BookRecord> => {
        acc[r.googleId] = r;
        return acc;
      },
      {} as Record<string, BookRecord>,
    );

    for (const record of bookRecords) {
      const duplicate = duplicates[record.googleId];
      if (isNotNullish(duplicate)) {
        logger('skipped:', { googleId: record.googleId });
        continue;
      }

      creatable.push(record);
    }

    if (!user) {
      throw new Error('User not found');
    }

    const created = await repo.save(creatable);
    return [...created, ...existing];
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
        userId,
        type,
      },
      ...(isNotNullish(take) && { take }),
    });
  }
}
