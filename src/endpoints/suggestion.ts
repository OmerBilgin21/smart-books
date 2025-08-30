import { Router, Request, Response } from 'express';
import { BooksService } from '../services/books.service';
import { BookRecordsRepository } from '../infrastructure/repositories/book.records.repository';
import { UsersRepository } from '../infrastructure/repositories/users.repository';
import { FavoriteCategoriesRepository } from '../infrastructure/repositories/favorite.categories.repository';
import { SuggestionService } from '../services/suggestion.service';
import { LLMService } from '../services/llm.service';
import { logger } from '../utils/logger';
import { UserService } from '../services/user.service';
import { BookRecordService } from '../services/book.record.service';
import { FavoriteCategoryService } from '../services/favorite.category.service';

const router = Router();

const llmService = new LLMService();

const suggestionService = new SuggestionService(
  new BooksService(),
  new BookRecordService(new BookRecordsRepository()),
  new FavoriteCategoryService(new FavoriteCategoriesRepository()),
  new UserService(new UsersRepository()),
  llmService,
);

router.get('/:userId', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  if (!userId) {
    res.json({ error: 'Please provide a user ID' });
    return;
  }

  try {
    const suggestions =
      await suggestionService.generateSuggestionsForUser(userId);

    res.json(suggestions);
  } catch (suggestionGenerationError) {
    res
      .status(500)
      .json({ error: 'Error while generating suggestions for user' });
    logger(
      `Error while generating suggestions for user ${userId}.`,
      suggestionGenerationError,
    );
  }
});

router.get(
  '/test/endpoint',
  async (_: Request, res: Response): Promise<void> => {
    logger('chatRes: ');

    res.json({});
  },
);

export default router;
