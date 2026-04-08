require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Initialize database (creates tables on first run)
require('./db');

const authRoutes = require('./routes/auth');
const fsRoutes = require('./routes/fs');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 8000;

// Parse CORS origins from env
let corsOrigins = ['http://localhost:5173', 'http://localhost:4173'];
if (process.env.CORS_ORIGINS) {
  try {
    corsOrigins = JSON.parse(process.env.CORS_ORIGINS);
  } catch {
    corsOrigins = process.env.CORS_ORIGINS.split(',').map((s) => s.trim());
  }
}

// Middleware
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/fs', fsRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(`[${new Date().toISOString()}]`, err.message);
  const status = err.status || 500;
  res.status(status).json({ detail: err.message || 'Internal server error' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`RetroOS backend listening on http://127.0.0.1:${PORT}`);
});
