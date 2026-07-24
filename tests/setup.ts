import { beforeAll, afterAll, afterEach } from 'vitest';
import { connectDB, closeDB, clearDB } from './mocks/db.js';

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await closeDB();
});
