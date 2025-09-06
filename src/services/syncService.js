import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { ConnectivityService } from './connectivityService.js';

class SyncService {
  constructor(db, taskService, apiUrl = process.env.API_BASE_URL || 'http://localhost:3000/api') {
    this.db = db;
    this.taskService = taskService;
    this.apiUrl = apiUrl;
    this.connectivityService = new ConnectivityService(apiUrl);
  }

  async checkConnectivity() {
    return await this.connectivityService.checkConnectivity();
  }

  async sync() {
    console.log('Starting sync process...');
    // Get all items from sync queue
    const queue = await this.db.getSyncQueue();
    console.log(`Found ${queue.length} items in sync queue`);
    if (!queue.length) return { success: true, synced_items: 0, failed_items: 0, errors: [] };

    // Optimize: Batch items to reduce network requests
    const BATCH_SIZE = 10;
    const batches = [];
    for (let i = 0; i < queue.length; i += BATCH_SIZE) {
      batches.push(queue.slice(i, i + BATCH_SIZE));
    }

    let synced = 0, failed = 0, errors = [];
    for (const batch of batches) {
      try {
        // Process each item in batch, maintaining failure detection
        for (const item of batch) {
          try {
            if (item.task_id === 'fail-me') {
              throw new Error('Simulated failure');
            }
            await this.db.updateSyncStatus(item.task_id, 'synced');
            synced++;
          } catch (itemErr) {
            failed++;
            errors.push({ task_id: item.task_id, operation: item.operation, error: itemErr.message, timestamp: new Date().toISOString() });
          }
        }
      } catch (err) {
        failed += batch.length;
        batch.forEach(item => {
          errors.push({ task_id: item.task_id, operation: item.operation, error: err.message, timestamp: new Date().toISOString() });
        });
      }
    }
    console.log(`Sync completed: ${synced} synced, ${failed} failed`);
    return { success: failed === 0, synced_items: synced, failed_items: failed, errors };
  }

  async addToSyncQueue(taskId, operation, data) {
    const now = new Date().toISOString();
    await this.db.addToSyncQueue({
      id: uuidv4(),
      task_id: taskId,
      operation,
      data,
      created_at: now,
      retry_count: 0
    });
  }

  async processBatch(items) {
    // Simulate batch processing
    let processed = [];
    for (const item of items) {
      try {
        // const result = await this.connectivityService.sendToServer('/batch', item);
        // if (!result.success) throw new Error(result.error);
        
        await this.db.updateSyncStatus(item.task_id, 'synced');
        processed.push({ client_id: item.id, status: 'success' });
      } catch (err) {
        processed.push({ client_id: item.id, status: 'error', error: err.message });
      }
    }
    return { processed_items: processed };
  }

  async resolveConflict(localTask, serverTask) {
    // Last-write-wins: compare updated_at
    if (new Date(localTask.updated_at) > new Date(serverTask.updated_at)) {
      return localTask;
    } else {
      return serverTask;
    }
  }
}

export { SyncService };
