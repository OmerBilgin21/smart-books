import { Router, Request, Response } from 'express';
import { BooksService } from '../services/books.service';
import { validate } from '../utils/validation.middleware';
import { BookSearchQuerySchema } from '../schemas';

const router = Router();
const booksService = new BooksService();

router.get(
  '/',
  validate({ query: BookSearchQuerySchema }),
  async (req: Request, res: Response): Promise<void> => {
    const { q, startIndex, maxResults } = req.query as unknown as {
      q: string;
      startIndex?: number;
      maxResults?: number;
    };

    const books = await booksService.getVolumes([{ term: 'title', value: q }], {
      start: startIndex || 0,
      limit: maxResults || 25,
    });

    res.json(books);
  },
);

export default router;
