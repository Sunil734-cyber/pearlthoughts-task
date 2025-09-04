import { Router } from 'express';
import { SyncService } from '../services/syncService.js';
import { TaskService } from '../services/taskService.js';
import { Database } from '../db/database.js';
import { asyncHandler } from './asynchandler.js';

function createSyncRouter(db) {
  const router = Router();
  const taskService = new TaskService(db);
  const syncService = new SyncService(db, taskService);

  // Trigger manual sync
  router.post('/sync', asyncHandler(async (req, res) => {
    const result = await syncService.sync();
    res.json(result);
  }));

  // Check sync status
  router.get('/status', asyncHandler(async (req, res) => {
    const queue = await db.getSyncQueue();
    const lastSync = queue.length ? queue[queue.length - 1].created_at : null;
    res.json({ pending: queue.length, lastSync });
  }));

  // Batch sync endpoint (for server-side)
  router.post('/batch', asyncHandler(async (req, res) => {
    const items = req.body.items || [];
    const result = await syncService.processBatch(items);
    res.json(result);
  }));

  // Health check endpoint
  router.get('/health', asyncHandler(async (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
  }));

  return router;
}

export { createSyncRouter };
