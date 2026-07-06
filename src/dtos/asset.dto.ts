//* asset dto
import * as z from 'zod';

// create asset
export const CreateAssetSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  type: z.enum(['HARDWARE', 'SOFTWARE', 'ACCESSORY']),
  serialNumber: z.string().min(5, 'Serial Number must be atlest 5 chars').trim(),
  /*
    There is one golden rule for Zod schemas: Zod should only validate data that comes from the outside world (the HTTP Request Body).
Because assignedTo and _modifiedBy are managed internally by your server (not by the user), you must not include them in your CreateAssetSchema.
    */
});

// update asset (basic)
// cannot use same -
/*
	1.	Required Fields: In CreateAssetSchema, all fields (name, type, serial) are required. If you want to update only the name, the Zod validation will fail because you didn't provide type and serialNumber.
	2.	Immutability: You usually do not want users to be able to change the serialNumber once it has been created, but they must provide it when creating the item.
*/
export const UpdateAssetFieldsSchema = CreateAssetSchema.partial().omit({ serialNumber: true });

// type
export type CreateAssetInput = z.infer<typeof CreateAssetSchema>;
export type UpdateAssetFieldsInput = z.infer<typeof UpdateAssetFieldsSchema>;
