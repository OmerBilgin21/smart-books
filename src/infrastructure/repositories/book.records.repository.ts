import { BaseRepository } from './base.repository.js';
import { BookRecordCreate } from '../../schemas/book.record.js';
import { BookRecord, User } from '../db/entities/index.js';
import { BookRecordType } from '../db/entities/enums.js';

export class BookRecordsRepository extends BaseRepository {
  public async bulkCreate(
    bookRecords: BookRecordCreate[],
  ): Promise<BookRecord[]> {
    const uniqueIds: string[] = [];
    const uniqueCreateObjs: Omit<BookRecordCreate, 'userId'>[] = [];

    const thisRepo = await this.getRepository(BookRecord);
    const usersRepo = await this.getRepository(User);

    const {
      books: _,
      categories: __,
      ...user
    } = await usersRepo.findOneOrFail({
      where: {
        id: bookRecords[0].userId,
      },
    });

    if (!user) {
      throw new Error('Given user could not be found!');
    }

    for (const bookRecord of bookRecords) {
      if (!uniqueIds.includes(bookRecord.googleId)) {
        uniqueIds.push(bookRecord.googleId);
        const { userId: _userId, ...rest } = bookRecord;
        uniqueCreateObjs.push(rest);
      }
    }

    const qb = thisRepo.createQueryBuilder('book_records');

    const rawRecords = await qb
      .select('book_records.googleId')
      .where(
        'book_records.user = :userId AND book_records.type = :type AND book_records.googleId IN (:...googleIds)',
        { userId: user.id, type: bookRecords[0].type, googleIds: uniqueIds },
      )
      .getRawMany();

    const existingIds = rawRecords.map((row): string => row.googleId);

    uniqueCreateObjs.forEach((record, idx): void => {
      if (existingIds.includes(record.googleId)) {
        existingIds.splice(idx, 1);
      }
    });

    const promises = uniqueCreateObjs.map((record): Promise<BookRecord> => {
      const beforeCreate = {
        ...record,
        user,
      };

      return thisRepo.save(beforeCreate);
    });

    return await Promise.all(promises);
  }

  public async create(bookRecord: BookRecordCreate): Promise<BookRecord> {
    const thisRepo = await this.getRepository(BookRecord);
    const usersRepo = await this.getRepository(User);

    const user = await usersRepo.findOneOrFail({
      where: {
        id: bookRecord.userId,
      },
    });

    if (!user) {
      throw new Error('Given user could not be found!');
    }

    const existingRecord = await thisRepo.findOne({
      where: {
        type: bookRecord.type,
        user: {
          id: bookRecord.userId,
        },
        googleId: bookRecord.googleId,
        selfLink: bookRecord.selfLink,
      },
    });

    if (existingRecord) {
      return existingRecord;
    }

    const { userId: _userId, ...rest } = bookRecord;

    return thisRepo.save({
      ...rest,
      user,
    });
  }

  public async getRecordsOfTypeForUser(
    userId: string,
    type: BookRecordType,
  ): Promise<BookRecord[]> {
    try {
      const repo = await this.getRepository(BookRecord);
      return await repo
        .createQueryBuilder('book_records')
        .where(
          'book_records.user = :identifier AND book_records.type = :bookRecordType',
          { identifier: userId, bookRecordType: type },
        )
        .getMany();
    } catch {
      throw new Error(
        `Book record for user: ${userId} not found for type: ${type}`,
      );
    }
  }
}
