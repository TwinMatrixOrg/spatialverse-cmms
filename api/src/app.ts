import { feathers } from '@feathersjs/feathers';
import express, {
  rest,
  json,
  urlencoded,
  cors,
  serveStatic,
  notFound,
  errorHandler,
} from '@feathersjs/express';
import configuration from '@feathersjs/configuration';
import helmet from 'helmet';
import compression from 'compression';
import * as dotenv from 'dotenv';

import { services } from './services';
import { logger } from './logger';

dotenv.config();

// Create Express + Feathers app
const app = express(feathers());

// Load configuration
app.configure(configuration());

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true,
  })
);

// Parse JSON and URL-encoded bodies
app.use(json());
app.use(urlencoded({ extended: true }));

// Host static files from public directory
app.use('/', serveStatic('public'));

// Configure REST API
app.configure(rest());

// Configure services
app.configure(services);

// 404 handler
app.use(notFound());

// Error handler
app.use(
  errorHandler({
    logger,
  })
);

export { app };
