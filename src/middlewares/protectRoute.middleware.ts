//* protect route
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { env } from '#config/env.config.js';
import { AppError } from '#errors/AppError.js';

// shape of decoded JWT
interface DecodedToken extends JwtPayload {
  userId: string;
}

export const protectRoute = (req: Request, _res: Response, next: NextFunction): void => {
  // extract token form cookies
  const token = req.cookies?.jwt;

  if (!token) {
    throw new AppError('Unauthorized - Invalid Token Payload', 401);
  }

  try {
    // verify
    const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;

    if (!decoded || !decoded.userId) {
      throw new AppError('Unauthorized - Invalid Token Payload', 401);
    }

    // attched userId to request
    req.user = {
      _id: decoded.userId,
    };

    next();
  } catch (error: unknown) {
    // jwt error
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      throw new AppError('Unauthorized - Token Expired', 401);
    }

    // unhandled error
    throw new AppError('Unauthorized - Invalid Token', 401);
  }
};
