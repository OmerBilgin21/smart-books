import { Router, Request, Response } from 'express';
import { UserService } from 'services';
import { dbClient, USERS_TABLE } from 'infrastructure';
import { parseData } from 'utils';
import { userSchema } from 'schemas';

const router = Router();
const userService = new UserService({
  db: dbClient,
  tableName: USERS_TABLE,
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const data = parseData(req.body, userSchema);

  if (!data) {
    res.status(400).json({ error: 'Invalid user data!' });
    return;
  }

  try {
    const created = await userService.create(data);
    res.json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error while creating user!' });
  }
});

router.get('/:email', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.params;

  if (!email) {
    res.status(400).json({ error: 'Please provide an email!' });
    return;
  }

  try {
    const found = await userService.get(email);

    res.json({
      email: found.email,
      firstName: found.firstName,
      id: found.id,
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'User not found!' });
  }
});

export default router;
