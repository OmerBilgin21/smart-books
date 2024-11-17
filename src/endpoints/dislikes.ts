import { Router, Request, Response } from 'express';
import { DislikeService } from 'services';
import { dbClient, DISLIKES_TABLE } from 'infrastructure';
import { parseData } from 'utils';
import { dislikeSchema } from 'schemas';

const router = Router();
const dislikeService = new DislikeService({
  db: dbClient,
  tableName: DISLIKES_TABLE,
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const data = parseData(req.body, dislikeSchema);

  if (!data) {
    res.json({ error: 'Please provide an user id and a self link' });
    return;
  }

  try {
    const created = await dislikeService.create({
      userId: data.userId,
      selfLink: data.selfLink,
    });
    res.json(created);
  } catch (createError) {
    console.error(createError);
  }
});

export default router;
