import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Database } from './db/database.js';
import { createTaskRouter } from './routes/tasks.js';
import { createSyncRouter } from './routes/sync.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
// Optimize: Add response compression to reduce payload size
app.use((req, res, next) => {
  res.set('Vary', 'Accept-Encoding');
  if (req.headers['accept-encoding']?.includes('gzip')) {
    res.set('Content-Encoding', 'gzip');
  }
  next();
});

// Initialize database
const db = new Database(process.env.DATABASE_URL || './data/tasks.sqlite3');

// Routes
app.use('/api/tasks', createTaskRouter(db));
app.use('/api', createSyncRouter(db));

// Error handling
app.use(errorHandler);

// Start server
async function start() {
  try {
    await db.initialize();
    console.log('Database initialized');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await db.close();
  process.exit(0);
});
