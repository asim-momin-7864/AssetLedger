//* logger

import pino from 'pino';
import type { LoggerOptions } from 'pino';
import { env } from '#config/env.config.js';

// pino configuration
const loggerOptions: LoggerOptions = {
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',

  // redaction sensitive info
  redact: {
    paths: [
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'req.body.password',
      'req.body.email',
      'req.body.address',
      'req.body.token',
      'req.body.creditCard',
    ],
    censor: '[REDACTED]',
  },
};

// adding location & log format for - development environment
if (env.NODE_ENV === 'development') {
  // pino configuration
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      ignore: 'pid, hostname',
    },
  };
}

export const logger = pino(loggerOptions);
