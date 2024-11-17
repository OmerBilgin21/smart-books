import { Router, Request, Response } from 'express';
import {
  BooksService,
  FavoriteService,
  SuggestionService,
  DislikeService,
  FavoriteCategoriesService,
} from 'services';
import {
  dbClient,
  DISLIKES_TABLE,
  FAVORITE_CATEGORIES_TABLE,
  FAVORITES_TABLE,
} from 'infrastructure';

const router = Router();

const suggestionService = new SuggestionService(
  new BooksService(),
  new FavoriteService({
    db: dbClient,
    tableName: FAVORITES_TABLE,
  }),
  new DislikeService({ db: dbClient, tableName: DISLIKES_TABLE }),
  new FavoriteCategoriesService({
    db: dbClient,
    tableName: FAVORITE_CATEGORIES_TABLE,
  }),
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
