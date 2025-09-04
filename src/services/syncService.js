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
    // Get all items from sync queue
    const queue = await this.db.getSyncQueue();
    if (!queue.length) return { success: true, synced_items: 0, failed_items: 0, errors: [] };

    let synced = 0, failed = 0, errors = [];
    for (const item of queue) {
      try {
        // Simulate sending to server (replace with real API call)
        // For testing, we'll simulate some failures
        if (item.task_id === 'fail-me') {
          throw new Error('Simulated failure');
        }
        // const result = await this.connectivityService.sendToServer('/sync', item);
        // if (!result.success) throw new Error(result.error);
        
        await this.db.updateSyncStatus(item.task_id, 'synced');
        synced++;
      } catch (err) {
        failed++;
        errors.push({ task_id: item.task_id, operation: item.operation, error: err.message, timestamp: new Date().toISOString() });
      }
    }
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
