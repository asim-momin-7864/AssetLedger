//* db
import mongoose from 'mongoose';
import { env } from './env.config.js';
import { baseLogger } from '#utils/logger.js';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    baseLogger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    baseLogger.error(`MongoDB Connection Error: ${(error as Error).message}`);
    process.exit(1);
  }
};
