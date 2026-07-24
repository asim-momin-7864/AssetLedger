import { describe, it, expect, vi, beforeEach } from 'vitest';
import { protectRoute } from '#middlewares/protectRoute.middleware.js';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '#config/env.config.js';
import { AppError } from '#errors/AppError.js';

vi.mock('jsonwebtoken');

describe('protectRoute Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      cookies: {},
    };
    mockRes = {};
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('should return 401 Unauthorized if no token is provided', () => {
    mockReq.cookies = {}; // No jwt cookie

    protectRoute(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    const errorCall = vi.mocked(mockNext).mock.calls[0][0] as unknown as AppError;
    expect(errorCall.statusCode).toBe(401);
    expect(errorCall.message).toBe('Unauthorized - Invalid Token Payload');
  });

  it('should attach user to request and call next if token is valid', () => {
    const mockDecoded = { userId: 'user123', role: 'IT_ADMIN' };
    mockReq.cookies = { jwt: 'valid-token' };
    vi.mocked(jwt.verify).mockReturnValue(mockDecoded as any);

    protectRoute(mockReq as Request, mockRes as Response, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', env.JWT_SECRET);
    expect((mockReq as any).user).toBeDefined();
    expect((mockReq as any).user?._id).toBe('user123');
    expect((mockReq as any).user?.role).toBe('IT_ADMIN');
    expect(mockNext).toHaveBeenCalledWith(); // Called without arguments (success)
  });

  it('should return 401 if token decoded payload is invalid', () => {
    mockReq.cookies = { jwt: 'valid-token' };
    vi.mocked(jwt.verify).mockReturnValue({} as any); // Missing userId

    protectRoute(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    const errorCall = vi.mocked(mockNext).mock.calls[0][0] as unknown as AppError;
    expect(errorCall.statusCode).toBe(401);
    expect(errorCall.message).toBe('Unauthorized - Invalid Token Payload');
  });

  it('should return 401 Token Expired if token expired error is thrown', () => {
    mockReq.cookies = { jwt: 'expired-token' };
    const err = new Error('jwt expired');
    err.name = 'TokenExpiredError';
    vi.mocked(jwt.verify).mockImplementation(() => { throw err; });

    protectRoute(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    const errorCall = vi.mocked(mockNext).mock.calls[0][0] as unknown as AppError;
    expect(errorCall.statusCode).toBe(401);
    expect(errorCall.message).toBe('Unauthorized - Token Expired');
  });

  it('should return 401 Invalid Token for general verification errors', () => {
    mockReq.cookies = { jwt: 'bad-token' };
    const err = new Error('some other jwt error');
    vi.mocked(jwt.verify).mockImplementation(() => { throw err; });

    protectRoute(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    const errorCall = vi.mocked(mockNext).mock.calls[0][0] as unknown as AppError;
    expect(errorCall.statusCode).toBe(401);
    expect(errorCall.message).toBe('Unauthorized - Invalid Token');
  });
});
