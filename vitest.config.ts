import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
    alias: {
      '#config': path.resolve(__dirname, './src/config'),
      '#controllers': path.resolve(__dirname, './src/controllers'),
      '#dtos': path.resolve(__dirname, './src/dtos'),
      '#errors': path.resolve(__dirname, './src/errors'),
      '#middlewares': path.resolve(__dirname, './src/middlewares'),
      '#models': path.resolve(__dirname, './src/models'),
      '#routes': path.resolve(__dirname, './src/routes'),
      '#utils': path.resolve(__dirname, './src/utils'),
      '#types': path.resolve(__dirname, './src/types'),
    },
  },
});
