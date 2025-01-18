import { Router, Request, Response } from 'express';
import { FavoriteService } from 'services';
import { dbClient, FAVORITES_TABLE } from 'infrastructure';
import { parseData } from 'utils';
import { favoriteSchema } from 'schemas';
import { unexpectedError } from 'infrastructure';

const router = Router();
const favoritesService = new FavoriteService({
  db: dbClient,
  tableName: FAVORITES_TABLE,
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const data = parseData(req.body, favoriteSchema);

  if (!data) {
    res.json({ error: 'Please provide an user id and a self link' });
    return;
  }

  try {
    const created = await favoritesService.create({
      userId: data.userId,
      selfLink: data.selfLink,
    });
    res.json(created);
  } catch (createError) {
    res.status(500).json(unexpectedError);
    throw new Error(
      `Error while trying to create a favorite book: ${createError}`,
    );
  }
});

router.get('/:userId', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  if (!userId) {
    res.json({ error: 'Please provide an user id and a self link' });
    return;
  }

  try {
    const found = await favoritesService.userFavorites(userId);
    res.json(found);
  } catch (getError) {
    res.status(500).json(unexpectedError);
    throw new Error(`Error while getting favorite book: ${getError}`);
  }
});

export default router;
