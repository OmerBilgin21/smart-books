import { Router, Request, Response } from 'express';
import {
  BookRecordsRepository,
  FavoriteCategoriesRepository,
} from 'infrastructure/repositories';
import { BooksService, SuggestionService } from 'services';

const router = Router();

const suggestionService = new SuggestionService(
  new BooksService(),
  new BookRecordsRepository(),
  new FavoriteCategoriesRepository(),
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
    throw new Error(
      `Error while generating suggestions for user ${userId}.\n${suggestionGenerationError}`,
    );
  }
});

export default router;
