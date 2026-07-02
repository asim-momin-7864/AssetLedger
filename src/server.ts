//* server
import '#config/zod.config.js';

import app from './app.js';
import { connectDB } from '#config/db.config.js';
import { env } from '#config/env.config.js';
import { baseLogger as logger } from '#utils/logger.js';

// server func
const startServer = async () => {
  await connectDB();

  // Boot express server
  const server = app.listen(env.PORT, () => {
    logger.info(`Server booted in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  // when 3rd party packages crashed
  process.on('unhandledRejection', (err: Error) => {
    logger.error(`Unhandled Rejection:${err.message}. Shutting down gracefully...`);
    // waiting to server close server first then, terminate executing
    server.close(() => {
      process.exit(1);
    });
  });

  // when synchronous uncaught exceptions
  process.on('uncaughtException', (err: Error) => {
    logger.error(`UncaughtException:${err.message}. Shutting down aggressivelly...`);
    // we are directly terminating execution/code
    process.exit(1);
  });
};

// execute function
startServer();
