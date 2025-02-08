import { Router, Request, Response } from 'express';
import { BookRecordsRepository } from '../infrastructure/repositories/book.records.repository.js';
import { unexpectedError } from '../infrastructure/constants.js';
import { UsersRepository } from '../infrastructure/repositories/users.repository.js';
import { BookRecordType } from '../infrastructure/db/entities/enums.js';

const router = Router();
const bookRecordsRepository = new BookRecordsRepository();
const usersRepository = new UsersRepository();

router.post('/dislike', async (req: Request, res: Response): Promise<void> => {
  const data = req.body;

  if (!data) {
    res.json({ error: 'Please provide an user id and a self link' });
    return;
  }

  try {
    const created = await bookRecordsRepository.create({
      userId: data.userId,
      selfLink: data.selfLink,
      type: BookRecordType.DISLIKE,
    });
    await usersRepository.invalidateFreshness(data.userId);
    res.json(created);
  } catch (createError) {
    res.status(500).json(unexpectedError);
    throw new Error(`Error while creating disliked book: ${createError}`);
  }
});

router.get(
  '/dislike/:userId',
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    if (!userId) {
      throw new Error('ID is required to retrieve dislike.');
    }

    try {
      const dislikedBook = await bookRecordsRepository.getRecordsOfTypeForUser(
        userId as string,
        BookRecordType.DISLIKE,
      );
      res.json(dislikedBook);
    } catch (getError) {
      res.status(500).json(unexpectedError);
      throw new Error(`Error while getting disliked book: ${getError}`);
    }
  },
);

router.post('/favorite', async (req: Request, res: Response): Promise<void> => {
  const data = req.body;

  if (!data) {
    res.json({ error: 'Please provide an user id and a self link' });
    return;
  }

  try {
    const created = await bookRecordsRepository.create({
      userId: data.userId,
      selfLink: data.selfLink,
      type: BookRecordType.FAVORITE,
    });
    await usersRepository.invalidateFreshness(data.userId);
    res.json(created);
  } catch (createError) {
    res.status(500).json(unexpectedError);
    throw new Error(`Error while creating favorite book: ${createError}`);
  }
});

router.get(
  '/favorite/:userId',
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    if (!userId) {
      throw new Error('ID is required to retrieve favorite.');
    }

    try {
      const dislikedBook = await bookRecordsRepository.getRecordsOfTypeForUser(
        userId as string,
        BookRecordType.FAVORITE,
      );
      res.json(dislikedBook);
    } catch (getError) {
      res.status(500).json(unexpectedError);
      throw new Error(`Error while getting disliked book: ${getError}`);
    }
  },
);

export default router;
