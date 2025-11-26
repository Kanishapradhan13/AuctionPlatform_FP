import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { serverConfig } from './config';
import { errorHandler } from './middleware/errorHandler';
import bidsRouter from './routes/bids.routes';
import logger from './config/logger';

const app: Express = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: serverConfig.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Bidding Service is running',
    timestamp: new Date().toISOString(),
    service: 'real-time-bidding-service',
    version: '1.0.0',
  });
});

// API routes
app.use('/api/bids', bidsRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
