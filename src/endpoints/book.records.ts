import { Router, Request, Response } from 'express';
import { BookRecordsRepository } from '../infrastructure/repositories/book.records.repository';
import { unexpectedError } from '../infrastructure/constants';
import { UsersRepository } from '../infrastructure/repositories/users.repository';
import { BookRecordType } from '../infrastructure/db/entities/enums';
import { BookRecordService } from '../services/book.record.service';
import { validate } from '../utils/validation.middleware';
import { logger } from '../utils/logger';
import { BookRecordCreateSchema, BookRecordParamsSchema } from '../schemas';

const router = Router();
const bookRecordsService = new BookRecordService(new BookRecordsRepository());
const usersRepository = new UsersRepository();

router.post(
  '/dislike',
  validate({ body: BookRecordCreateSchema }),
  async (req: Request, res: Response): Promise<void> => {
    const data = req.body;

    try {
      const created = await bookRecordsService.create({
        userId: data.userId,
        selfLink: data.selfLink,
        type: BookRecordType.DISLIKE,
        googleId: data.googleId,
      });
      await usersRepository.toggleFreshness(data.userId);
      res.json(created);
    } catch (createError) {
      logger('Error while creating a disliked book', createError);
      res.status(500).json(unexpectedError);
    }
  },
);

router.get(
  '/dislike/:userId',
  validate({ params: BookRecordParamsSchema }),
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    try {
      const dislikedBook = await bookRecordsService.getRecordsOfTypeForUser(
        userId as string,
        BookRecordType.DISLIKE,
      );
      res.json(dislikedBook);
    } catch (getError) {
      logger('Error while getting disliked book', getError);
      res.status(500).json(unexpectedError);
    }
  },
);

router.post(
  '/favorite',
  validate({ body: BookRecordCreateSchema }),
  async (req: Request, res: Response): Promise<void> => {
    const data = req.body;

    try {
      const created = await bookRecordsService.create({
        userId: data.userId,
        googleId: data.googleId,
        selfLink: data.selfLink,
        type: BookRecordType.FAVORITE,
      });
      await usersRepository.toggleFreshness(data.userId);
      res.json(created);
    } catch (createError) {
      logger('Error while creating favorite book', createError);
      res.status(500).json(unexpectedError);
    }
  },
);

router.get(
  '/favorite/:userId',
  validate({ params: BookRecordParamsSchema }),
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    try {
      const favoriteBook = await bookRecordsService.getRecordsOfTypeForUser(
        userId as string,
        BookRecordType.FAVORITE,
      );
      res.json(favoriteBook);
    } catch (getError) {
      logger('Error while getting favorite book', getError);
      res.status(500).json(unexpectedError);
    }
  },
);

export default router;
