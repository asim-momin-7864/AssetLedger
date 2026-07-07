//* dto for asset request input
import * as z from 'zod';

// create request input
export const CreateAssetReqSchema = z.object({
  requestedItem: z.string().min(5, 'Name is too small'),
});

export type CreateAssetReqInput = z.infer<typeof CreateAssetReqSchema>;
