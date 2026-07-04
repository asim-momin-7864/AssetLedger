//* Authorize roles middleware
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '#errors/AppError.js';

//* Factory Function (or a function that returns a function).
/*
Because a standard Express middleware is strictly required to only take (req, res, next), 
you cannot pass your own custom arguments (like 'IT_ADMIN') directly into it. 
To bypass this rule, you wrap the middleware inside a parent function that accepts your arguments first.
*/

export const authorizeRoles = (...allowedRoles: string[]) => {
  // the middleware func
  return (req: Request, _res: Response, next: NextFunction): void => {
    // user is valid
    if (!req.user) {
      return next(new AppError('Authentication Required', 401));
    }

    // is role allowed
    if (allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

//* use of closure
/*
2. The Closure Effect
When your app boots up and reads your route file, it immediately runs the outer function authorizeRoles('IT_ADMIN'). 
That outer function finishes executing instantly, 
but it leaves behind the inner (req, res, next) function.

Thanks to a JavaScript concept called closures, 
that inner function permanently remembers the allowedRoles array you passed to its parent, 
even hours later when a user makes an HTTP request.
*/
