//* auth utils
// generate JWT cookie

import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '#config/env.config.js';

// signOption type
type SignOptionsExpiresIn = NonNullable<jwt.SignOptions['expiresIn']>;

export const generateTokenAndSetCookie = (userId: string, res: Response): void => {
  const token = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptionsExpiresIn,
  });

  // attaching with cookie
  res.cookie('jwt', token, {
    maxAge: 15 * 24 * 60 * 1000, // 5 days
    httpOnly: true,
    sameSite: 'strict',
    secure: env.NODE_ENV !== 'development',
  });
};
