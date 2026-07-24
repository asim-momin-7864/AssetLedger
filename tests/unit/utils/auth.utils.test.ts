import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateTokenAndSetCookie } from '#utils/auth.utils.js';
import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '#config/env.config.js';

vi.mock('jsonwebtoken');

describe('generateTokenAndSetCookie', () => {
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockRes = {
      cookie: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('should generate a JWT token and set it in the response cookie', () => {
    const payload = { userId: 'user123', role: 'EMPLOYEE' as const };
    const mockToken = 'mocked-jwt-token';
    vi.mocked(jwt.sign).mockReturnValue(mockToken as any);

    generateTokenAndSetCookie(payload, mockRes as Response);

    expect(jwt.sign).toHaveBeenCalledWith(
      payload,
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
    expect(mockRes.cookie).toHaveBeenCalledWith('jwt', mockToken, expect.any(Object));
  });

  it('should set secure flag to true when NODE_ENV is not development', () => {
    const originalEnv = env.NODE_ENV;
    env.NODE_ENV = 'production';

    const payload = { userId: 'user123', role: 'EMPLOYEE' as const };
    generateTokenAndSetCookie(payload, mockRes as Response);

    expect(mockRes.cookie).toHaveBeenCalledWith(
      'jwt',
      expect.any(String),
      expect.objectContaining({ secure: true })
    );

    env.NODE_ENV = originalEnv;
  });

  it('should set secure flag to false when NODE_ENV is development', () => {
    const originalEnv = env.NODE_ENV;
    env.NODE_ENV = 'development';

    const payload = { userId: 'user123', role: 'EMPLOYEE' as const };
    generateTokenAndSetCookie(payload, mockRes as Response);

    expect(mockRes.cookie).toHaveBeenCalledWith(
      'jwt',
      expect.any(String),
      expect.objectContaining({ secure: false })
    );

    env.NODE_ENV = originalEnv;
  });

  it('should set httpOnly, strict sameSite, and 15 days maxAge on cookie', () => {
    const payload = { userId: 'user123', role: 'EMPLOYEE' as const };
    generateTokenAndSetCookie(payload, mockRes as Response);

    expect(mockRes.cookie).toHaveBeenCalledWith(
      'jwt',
      expect.any(String),
      expect.objectContaining({
        maxAge: 15 * 24 * 60 * 1000,
        httpOnly: true,
        sameSite: 'strict',
      })
    );
  });
});
