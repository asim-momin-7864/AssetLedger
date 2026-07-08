//* app
// 3rd-party modules
import express, { type Application } from 'express';
import cors from 'cors';
import pino from 'pino';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import { expressMiddleware } from 'pino-correlation-id';

// user defined modules
import { env } from '#config/env.config.js';
import { baseLogger } from '#utils/logger.js';
import { AppError } from '#errors/AppError.js';
import { globalErrorHandler } from '#middlewares/error.middleware.js';
import { apiLimiter } from '#middlewares/rateLimiter.middleware.js';

// routers
import authRouter from '#routes/auth.routes.js';
import assetRouter from '#routes/asset.routes.js';
import assetReqRouter from '#routes/assetReq.routes.js';
import auditLogRouter from '#routes/audit.routes.js';

const app: Application = express();

// security
app.use(helmet());
app.use(
  cors({
    origin: env.NODE_ENV === 'production' ? 'your-production-url.com' : '*',
  })
);

// body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie reader
app.use(cookieParser());

// middleware to generate req ID and create isolated thread
app.use(
  expressMiddleware({
    generateId: () => crypto.randomUUID(),
    header: 'x-request-id',
  })
);

// pinoHttp - to log every req
app.use(
  pinoHttp({
    // logger
    logger: baseLogger,

    // req-id is already generated
    genReqId: (req) => req.id,

    // serialization - trimming log content
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),

      err: pino.stdSerializers.err,
    },
  })
);

// rate limiter
app.use('/api', apiLimiter);

// health check
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy and running',
  });
});

// business routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/assets', assetRouter);
app.use('/api/v1/requests', assetReqRouter);
app.use('/api/v1/audit-logs', auditLogRouter);

// Unhandled route fallbacks
app.all('/{*splat}', (req, _res, next) => {
  const err = new AppError(`The path ${req.originalUrl} does not exist on this server.`, 404);
  next(err);
  //! here insted send res, not error
});

// Global error handler
app.use(globalErrorHandler);

export default app;
