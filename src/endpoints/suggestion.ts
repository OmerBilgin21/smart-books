import { Router, Request, Response } from 'express';
import { BooksService } from '../services/books.service.js';
import { BookRecordsRepository } from '../infrastructure/repositories/book.records.repository.js';
import { UsersRepository } from '../infrastructure/repositories/users.repository.js';
import { FavoriteCategoriesRepository } from '../infrastructure/repositories/favorite.categories.repository.js';
import { SuggestionService } from '../services/suggestion.service.js';
import { LLMService } from '../services/llm.service.js';

const router = Router();

const suggestionService = new SuggestionService(
  new BooksService(),
  new BookRecordsRepository(),
  new FavoriteCategoriesRepository(),
  new UsersRepository(),
);

const llmService = new LLMService();

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
    throw new Error(
      `Error while generating suggestions for user ${userId}.\n${suggestionGenerationError}`,
    );
  }
});

router.get('/', async (_: Request, res: Response): Promise<void> => {
  const ssrr = await llmService.composeSuggestionStructuredResponseRequest([
    'the witcher blood of the elves',
    'the witcher ashen sword',
    'Dune 2',
  ]);

  const chatRes = await llmService.structuredChat(ssrr);

  res.json(chatRes);
});

export default router;
