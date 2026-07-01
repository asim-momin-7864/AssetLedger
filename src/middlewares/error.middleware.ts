//* error middleware
import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { AppError } from '#errors/AppError.js';
import { env } from '#config/env.config.js';

// logger
import { getLogger } from 'pino-correlation-id';
import { baseLogger } from '#utils/logger.js';

// global error handler arrow function
export const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // logger
  const logger = getLogger(baseLogger);

  // error type narrowing & identifying

  // 1- zod validation error
  if (err instanceof ZodError) {
    const validationError = fromZodError(err);

    // log - warning
    logger.warn(
      {
        path: req.path,
        error: validationError.message,
      },
      'Validation Error'
    );

    // res
    res.status(400).json({
      success: false,
      error: 'validation error',
      message: validationError.message,
    });

    return;
  }

  // 2 - AppError error - business logic error
  if (err instanceof AppError) {
    // log
    logger.warn({
      path: req.path,
      error: err.status,
      message: err.message,
    });

    return;
  }

  // 3 - Unexpected system crash error
  // log for - monitoring team
  logger.error(err, 'Unhandled System Crash');

  // error msg hiding for production environment
  let errMessage = (err as Error).message;

  if (env.NODE_ENV === 'production') {
    errMessage = 'A severe error occured on our server';
  }

  // generating error res
  // type
  const errorResponse: {
    success: boolean;
    error: string;
    message: string;
    stack?: string | undefined;
  } = {
    success: false,
    error: 'error',
    message: errMessage,
  };

  // adding error stack - in development environment only
  if (env.NODE_ENV === 'development') {
    errorResponse.stack = (err as Error).stack;
  }

  // res
  res.status(500).json(errorResponse);
};
