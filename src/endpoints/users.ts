import { Router, Request, Response } from 'express';
import { UsersRepository } from 'infrastructure/repositories';

const router = Router();
const userRepository = new UsersRepository();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const data = req.body;

  if (!data) {
    res.status(400).json({ error: 'Invalid user data!' });
    return;
  }

  try {
    const created = await userRepository.create({
      email: data.email,
      lastName: data.lastName,
      firstName: data.lastName,
      password: data.password,
      suggestionIsFresh: false,
    });

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
    const found = await userRepository.get(email);

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
