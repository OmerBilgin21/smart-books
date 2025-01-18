import { Router, Request, Response } from 'express';
import { FavoriteCategoriesService } from 'services';
import {
  dbClient,
  FAVORITE_CATEGORIES_TABLE,
  unexpectedError,
} from 'infrastructure';
import { parseData } from 'utils';
import { favoriteCategorySchema as schema } from 'schemas';

const router = Router();

const favoriteCategoriesService = new FavoriteCategoriesService({
  db: dbClient,
  tableName: FAVORITE_CATEGORIES_TABLE,
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const data = parseData(req.body, schema);

  if (!data) {
    res.json({ error: 'Please provide a category' });
    return;
  }

  try {
    const created = await favoriteCategoriesService.create({
      name: data.name,
      userId: data.userId,
      rank: data.rank,
    });
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
      await favoriteCategoriesService.userFavoriteCategories(userId);
    res.json(found);
  } catch (getError) {
    res.status(500).json(unexpectedError);
    throw new Error(`Error while getting favorite category: ${getError}`);
  }
});

export default router;
