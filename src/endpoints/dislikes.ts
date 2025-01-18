import { Router, Request, Response } from 'express';
import { DislikeService } from 'services';
import { dbClient, DISLIKES_TABLE, unexpectedError } from 'infrastructure';
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
    res.status(500).json(unexpectedError);
    throw new Error(`Error while creating disliked book: ${createError}`);
  }
});

router.get('/:userId', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  if (!userId) {
    throw new Error('ID is required to retrieve dislike.');
  }

  try {
    const dislikedBook = await dislikeService.userDislikes(userId as string);
    res.json(dislikedBook);
  } catch (getError) {
    res.status(500).json(unexpectedError);
    throw new Error(`Error while getting disliked book: ${getError}`);
  }
});

export default router;
