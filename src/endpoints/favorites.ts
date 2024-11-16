import { Router, Request, Response } from 'express';
import { FavoriteService } from 'services';
import { dbClient, FAVORITES_TABLE } from 'infrastructure';
import { parseData } from 'utils';
import { favoriteSchema } from 'schemas';

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
    console.error(createError);
  }
});

export default router;
