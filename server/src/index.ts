/**
 * Express server entry point for the workout tracker API
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './db.js';
import webhookRouter from './routes/webhook.js';
import workoutsRouter from './routes/workouts.js';

// ESM compatibility - get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const PORT = parseInt(process.env.PORT || '3001', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize database
console.log('Initializing database...');
initializeDatabase();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

// Parse URL-encoded bodies (for Twilio webhooks)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (for API requests)
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Mount webhook routes
app.use('/webhook', webhookRouter);

// Mount API routes
app.use('/api', workoutsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from client dist directory in production
if (NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
  app.use(express.static(clientDistPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get('/*', (req, res) => {
    const indexPath = path.join(clientDistPath, 'index.html');
    res.sendFile(indexPath);
  });
}

// 404 handler (only for non-SPA routes in dev)
if (NODE_ENV === 'development') {
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

// Error handling middleware
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
=================================================
Workout Tracker Server
=================================================
Environment: ${NODE_ENV}
Port: ${PORT}
Frontend URL: ${FRONTEND_URL}
API Running at: http://localhost:${PORT}/api
Webhook URL: http://localhost:${PORT}/webhook
=================================================
  `);
});
