import { Router, Request, Response } from 'express';
import { unexpectedError } from '../infrastructure/constants';
import { FavoriteCategoriesRepository } from '../infrastructure/repositories/favorite.categories.repository';
import { UsersRepository } from '../infrastructure/repositories/users.repository';

const router = Router();

const favoriteCategoriesRepository = new FavoriteCategoriesRepository();
const usersRepository = new UsersRepository();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const data = req.body;

  if (!data) {
    res.json({ error: 'Please provide a category' });
    return;
  }

  try {
    const created = await favoriteCategoriesRepository.create({
      name: data.name,
      userId: data.userId,
      rank: data.rank,
    });
    await usersRepository.invalidateFreshness(data.userId);
    res.json(created);
  } catch (createError) {
    res.status(500).json(unexpectedError);
    throw new Error(`Error while creating favorite category: ${createError}`);
  }
});

router.get('/:userId', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  if (!userId) {
    res.json({ error: 'Please provide a user id' });
  }

  try {
    const found =
      await favoriteCategoriesRepository.getFavoriteCategoriesOfUser(userId);
    res.json(found);
  } catch (getError) {
    res.status(500).json(unexpectedError);
    throw new Error(`Error while getting favorite category: ${getError}`);
  }
});

export default router;
