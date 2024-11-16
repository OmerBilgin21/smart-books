import { Router, Request, Response } from 'express';
import { BooksService } from 'services';

const router = Router();
const booksService = new BooksService();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const books = await booksService.getVolumes([
    { term: 'authors', value: 'sapkowski' },
    { term: 'title', value: 'witcher' },
  ]);

  res.json(books);
});

export default router;
