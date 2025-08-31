import { BookRecordType } from '../infrastructure/db/entities/enums';
import { z } from 'zod';

export const BookRecordSchema = z.object({
  id: z.uuid(),
  selfLink: z.string(),
  googleId: z.string(),
  type: z.enum(BookRecordType),
  userId: z.uuid(),
});

export const BookRecordCreateSchema = BookRecordSchema.omit({
  id: true,
});

export type BookRecord = z.infer<typeof BookRecordSchema>;
export type BookRecordCreate = z.infer<typeof BookRecordCreateSchema>;
