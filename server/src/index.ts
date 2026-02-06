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
app.use(cors());

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

// Serve the dashboard from the public directory
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Fallback - serve index.html for the root
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

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
