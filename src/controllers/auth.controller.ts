//* auth controller

import type { Request, Response } from 'express';
import { User } from '#models/user.model.js';
import { RegisterSchema, LoginSchema, RegisterInput, LoginInput } from '#dtos/auth.dto.js';
import { generateTokenAndSetCookie } from '#utils/auth.utils.js';
import { AppError } from '#errors/AppError.js';
import { getLogger } from 'pino-correlation-id';
import { baseLogger } from '#utils/logger.js';

// register controller
export const register = async (req: Request<unknown, unknown, RegisterInput>, res: Response) => {
  // log
  const logger = getLogger(baseLogger);

  // validate data
  const validatedData = RegisterSchema.parse(req.body);

  // user exists
  const userExists = await User.findOne({
    email: validatedData.email,
  });

  if (userExists) {
    throw new AppError('User with this email aleady exists', 409);
  }

  // create user
  const user = await User.create(validatedData);

  // generate JWT token and set in cookie
  generateTokenAndSetCookie(user.id, res);

  // log
  logger.info({ userId: user._id, email: user.email }, 'New user account successfully created');

  // res
  res.status(201).json({
    success: true,
    data: {
      _id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};

// login controller
export const login = async (req: Request<unknown, unknown, LoginInput>, res: Response) => {
  // logger
  const logger = getLogger(baseLogger);

  // validate
  const validatedData = LoginSchema.parse(req.body);

  // find user
  const user = await User.findOne({
    email: validatedData.email,
  }).select('+password'); // bcz if same email user exist - we need password to compare

  if (!user || !(await user.comparePassword(validatedData.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  // generate token
  generateTokenAndSetCookie(user.id, res);

  // log
  logger.info({ userId: user._id }, 'User successfully authenticated and logged in');

  res.status(200).json({
    success: true,
    data: {
      _id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};

// logout controller
export const logout = async (_req: Request, res: Response) => {
  // overwrite cookie - login means having JWT cookie
  res.cookie('jwt', '', {
    maxAge: 0,
    httpOnly: true,
    sameSite: 'strict',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
