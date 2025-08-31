import { Router, Request, Response } from 'express';
import { unexpectedError } from '../infrastructure/constants';
import { FavoriteCategoriesRepository } from '../infrastructure/repositories/favorite.categories.repository';
import { UsersRepository } from '../infrastructure/repositories/users.repository';
import { validate } from '../utils/validation.middleware';
import {
  FavoriteCategoryCreateSchema,
  FavoriteCategoryParamsSchema,
} from '../schemas';
import { logger } from '../utils/logger';

const router = Router();

const favoriteCategoriesRepository = new FavoriteCategoriesRepository();
const usersRepository = new UsersRepository();

router.post(
  '/',
  validate({ body: FavoriteCategoryCreateSchema }),
  async (req: Request, res: Response): Promise<void> => {
    const data = req.body;

    try {
      const created = await favoriteCategoriesRepository.create({
        name: data.name,
        userId: data.userId,
        rank: data.rank,
      });
      await usersRepository.toggleFreshness(data.userId);
      res.json(created);
    } catch (createError) {
      logger('Error while creating favorite category', createError);
      res.status(500).json(unexpectedError);
    }
  },
);

router.get(
  '/:userId',
  validate({ params: FavoriteCategoryParamsSchema }),
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    try {
      const found =
        await favoriteCategoriesRepository.getFavoriteCategoriesOfUser(userId);
      res.json(found);
    } catch (getError) {
      logger('Error while getting favorite category', getError);
      res.status(500).json(unexpectedError);
    }
  },
);

export default router;
