import { Router, Request, Response } from 'express';
import { UsersRepository } from '../infrastructure/repositories/users.repository';
import { UserService } from '../services/user.service';
import envs from '../infrastructure/envs';
import { User } from '../infrastructure/db/entities';
import { logger } from '../utils/logger';

const router = Router();
const userService = new UserService(new UsersRepository());
const { NODE_ENV } = envs;

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const data = req.body;

  if (!data) {
    res.status(400).json({ error: 'Invalid user data!' });
    return;
  }

  try {
    const created = await userService.create({
      email: data.email,
      lastName: data.lastName,
      firstName: data.firstName,
      password: data.password,
      suggestionIsFresh: false,
    });

    const accessToken = userService.generateAccessToken(created);

    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
      })
      .status(200)
      .json(created);
  } catch (error) {
    logger('Error while creating user!', error);
    res.status(500).json({ error: 'Error while creating user!' });
  }
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ error: 'Not Logged In!' });
    return;
  }

  try {
    const decodedToken = await userService.verifyToken(token);

    res.json({
      email: decodedToken.email,
      firstName: decodedToken.name,
      id: decodedToken.id,
    });
  } catch {
    res
      .status(404)
      .json({ error: 'User not found or provided acccess token invalid!' });
  }
});

router.get(
  '/:email/:password',
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.params;

    const validatedUser = await userService.login(email, password);

    if (validatedUser === null) {
      res.status(401).json({ error: 'Incorrect credentials' });
      return;
    }

    const token = userService.generateAccessToken(validatedUser as User);

    res
      .cookie('accessToken', token, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
      })
      .status(200)
      .json(validatedUser);
  },
);

router.post('/logout', async (_req: Request, res: Response): Promise<void> => {
  res
    .clearCookie('accessToken', {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
    })
    .status(204)
    .send();
});

export default router;
