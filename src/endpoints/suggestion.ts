import { Router, Request, Response } from 'express';
import { BooksService } from '../services/books.service';
import { BookRecordsRepository } from '../infrastructure/repositories/book.records.repository';
import { UsersRepository } from '../infrastructure/repositories/users.repository';
import { FavoriteCategoriesRepository } from '../infrastructure/repositories/favorite.categories.repository';
import { SuggestionService } from '../services/suggestion.service';
import { LLMService } from '../services/llm.service';

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

router.get(
  '/test/endpoint',
  async (_: Request, res: Response): Promise<void> => {
    const ssrr = await llmService.composeSuggestionStructuredResponseRequest([
      { id: '1', name: 'the witcher blood of the elves' },
      { id: '2', name: 'the witcher time of contempt' },
      { id: '3', name: 'Dune 2' },
      { id: '4', name: "Harry Potter and the Philosopher's Stone" },
      { id: '5', name: 'Harry Potter and the Prisoner of Azkaban' },
      { id: '7', name: 'Harry Potter and the Chamber of Secrets' },
    ]);

    const chatRes = await llmService.structuredChat(ssrr);

    res.json(chatRes);
  },
);

export default router;
