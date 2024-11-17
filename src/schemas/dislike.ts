import { z } from 'zod';

export const dislikeSchema = z.object({
  id: z.number().optional(),
  selfLink: z.string(),
  userId: z.number(),
});

export const dislikeDbSchema = z.object({
  id: z.number().optional(),
  self_link: z.string(),
  user_id: z.number(),
});

export type Dislike = z.infer<typeof dislikeSchema>;
export type DislikeDb = z.infer<typeof dislikeDbSchema>;

export const dislikeTransform = dislikeDbSchema.transform((input): Dislike => {
  const transformed: Dislike = {
    selfLink: input.self_link,
    userId: input.user_id,
  };

  if (input?.id) transformed['id'] = input.id;
  return transformed;
});

export const dislikeDbTransform = dislikeSchema.transform(
  (input): DislikeDb => {
    const transformed: DislikeDb = {
      self_link: input.selfLink,
      user_id: input.userId,
    };
    if (input?.id) transformed['id'] = input.id;
    return transformed;
  },
);
