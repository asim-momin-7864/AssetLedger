//* env

import * as z from 'zod';
import dotenv from 'dotenv';
import { fromZodError } from 'zod-validation-error';
import jwt from 'jsonwebtoken';

// load env from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URL: z.string({ error: 'MONGO_URL is required' }),
  JWT_SECRET: z.string({ error: 'JWT_string is required' }),
  JWT_EXPIRES_IN: z.string().default('7d') as unknown as z.ZodType<jwt.SignOptions['expiresIn']>,
});

// parsing with safeParse without breaking
// as flag/switch _env
const _env = envSchema.safeParse(process.env);

// check missing
if (!_env.success) {
  // error into simple readable string
  const readableError = fromZodError(_env.error);
  console.error('Invalid environment variables: ', readableError);
  process.exit(1);

  // error in terminal
  console.error(readableError.message);
}

// export parses variables
export const env = _env.data;
