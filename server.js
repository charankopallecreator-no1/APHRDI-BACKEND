const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const connectDB = require('./config/db');
const Sentry = require('@sentry/node');
const logger = require('./utils/logger');
const promBundle = require('express-prom-bundle');
const mongoose = require('mongoose');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Load runtime mode
const isProd = process.env.NODE_ENV === 'production';

// Middleware
app.use(express.json());
app.use(helmet());

// Metrics (Prometheus) - lightweight metrics endpoint (/metrics)
app.use(promBundle({ includeMethod: true, includePath: true }));

// Initialize Sentry if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV });
  // Request handler must be the first middleware for Sentry
  app.use(Sentry.Handlers.requestHandler());
}

// Logging: use morgan but direct output to our structured logger
app.use(morgan(isProd ? 'combined' : 'dev', { stream: logger.stream }));

// CORS - allow list via environment variable (comma separated) or default localhost:3000
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim());
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (corsOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/modules', require('./routes/moduleRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/translate', require('./routes/translationRoutes'));
app.use('/api/adaptive', require('./routes/adaptiveRoutes'));
app.use('/api/gamification', require('./routes/gamificationRoutes'));

const PORT = process.env.PORT || 5000;

// Simple root route to confirm server is running (helps avoid 404 on '/')
// Health endpoint
app.get('/', (req, res) => res.json({ success: true, message: 'APHRDI API is running' }));
app.get('/health', async (req, res) => {
  const uptime = process.uptime();

  // Map mongoose connection states to human readable values
  const mapState = (s) => {
    switch (s) {
      case 0: return 'disconnected';
      case 1: return 'connected';
      case 2: return 'connecting';
      case 3: return 'disconnecting';
      default: return 'unknown';
    }
  };

  const dbState = mongoose.connection ? mongoose.connection.readyState : 0;
  let dbPing = null;

  if (dbState === 1) {
    try {
      // Attempt a lightweight ping to the DB admin command (works with MongoDB)
      if (mongoose.connection.db && mongoose.connection.db.admin) {
        // eslint-disable-next-line no-unused-vars
        const ping = await mongoose.connection.db.admin().ping();
        dbPing = 'ok';
      }
    } catch (err) {
      dbPing = 'error';
    }
  }

  res.json({
    status: 'ok',
    uptime,
    db: {
      state: mapState(dbState),
      ping: dbPing,
    },
  });
});

// If Sentry is enabled, use the error handler middleware provided by Sentry
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Start server and keep reference so it can be closed on errors
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  // Capture exception in Sentry if configured
  try {
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(err);
    }
  } catch (e) {
    // ignore Sentry errors
  }

  logger.error(err.stack || err.message || 'Server Error');
  res.status(500).json({ success: false, error: err.message || 'Server Error' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process if it's running
  // Flush Sentry events (if configured) before exiting
  const shutdown = async () => {
    try {
      if (process.env.SENTRY_DSN) {
        await Sentry.flush(2000);
      }
    } catch (e) {
      // ignore
    }
    if (typeof server !== 'undefined' && server && server.close) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  };
  shutdown();
});