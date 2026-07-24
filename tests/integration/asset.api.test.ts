import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { clearDB } from '../mocks/db.js';

describe('Asset API Integration', () => {
  let authCookie: any;

  beforeEach(async () => {
    await clearDB();
    
    // Register & Login as IT_ADMIN to get cookie for protected routes
    const adminUser = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'IT_ADMIN',
    };
    
    const res = await request(app).post('/api/v1/auth/register').send(adminUser);
    authCookie = res.headers['set-cookie'];
  });

  describe('GET /api/v1/assets', () => {
    it('should fetch assets for authenticated user', async () => {
      const response = await request(app)
        .get('/api/v1/assets')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 if no auth token is provided', async () => {
      const response = await request(app).get('/api/v1/assets');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  // You can expand this for POST, PUT, DELETE operations based on your routes.
});
