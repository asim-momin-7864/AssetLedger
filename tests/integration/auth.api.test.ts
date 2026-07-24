import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { clearDB } from '../mocks/db.js';

describe('Auth API Integration', () => {
  beforeEach(async () => {
    await clearDB();
  });

  const registerEndpoint = '/api/v1/auth/register';
  const loginEndpoint = '/api/v1/auth/login';
  const logoutEndpoint = '/api/v1/auth/logout';

  const validUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'EMPLOYEE',
  };

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app).post(registerEndpoint).send(validUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(validUser.email);
      expect(response.headers['set-cookie']).toBeDefined(); // JWT cookie
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app).post(registerEndpoint).send({ email: 'invalid-email' }); // missing name, password

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if email already exists', async () => {
      await request(app).post(registerEndpoint).send(validUser); // Register once

      const response = await request(app).post(registerEndpoint).send(validUser); // Register again

      expect(response.status).toBe(409); // Or 409 depending on your implementation
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      // Create user before login tests
      await request(app).post(registerEndpoint).send(validUser);
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app).post(loginEndpoint).send({
        email: validUser.email,
        password: validUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app).post(loginEndpoint).send({
        email: validUser.email,
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail if user does not exist', async () => {
      const response = await request(app).post(loginEndpoint).send({
        email: 'notfound@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /logout', () => {
    it('should logout and clear cookie when authenticated', async () => {
      const loginRes = await request(app).post(registerEndpoint).send(validUser);
      const cookie = loginRes.headers['set-cookie'];

      const response = await request(app).get(logoutEndpoint).set('Cookie', cookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Cookie should be cleared (maxAge=0 or expires in past)
      expect(response.headers['set-cookie'][0]).toMatch(/Max-Age=0|Expires=/i);
    });

    it('should fail to logout if not authenticated', async () => {
      const response = await request(app).get(logoutEndpoint);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
