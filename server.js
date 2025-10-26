const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const connectDB = require('./config/db');

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

// Logging (use morgan in non-test environments)
if (!isProd) {
  app.use(morgan('dev'));
}

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
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

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
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message || 'Server Error' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process if it's running
  if (typeof server !== 'undefined' && server && server.close) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});