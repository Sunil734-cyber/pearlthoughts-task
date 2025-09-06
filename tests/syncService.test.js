
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Database } from '../src/db/database.js';
import { TaskService } from '../src/services/taskService.js';
import { SyncService } from '../src/services/syncService.js';
import { ConnectivityService } from '../src/services/connectivityService.js';
import axios from 'axios';

// Mock axios and ConnectivityService
vi.mock('axios');
vi.mock('../src/services/connectivityService.js');

describe('SyncService', () => {
  let db;
  let taskService;
  let syncService;

  beforeEach(async () => {
    db = new Database(':memory:');
    await db.initialize();
    taskService = new TaskService(db);
    syncService = new SyncService(db, taskService);
  });

  afterEach(async () => {
    await db.close();
    vi.clearAllMocks();
  });

  describe('checkConnectivity', () => {
    it('should return true when server is reachable', async () => {
      // Mock the ConnectivityService's checkConnectivity method
      vi.mocked(ConnectivityService).mockImplementation(() => ({
        checkConnectivity: vi.fn().mockResolvedValueOnce(true)
      }));
      
      const testSyncService = new SyncService(db, taskService);
      const isOnline = await testSyncService.checkConnectivity();
      expect(isOnline).toBe(true);
    });

    it('should return false when server is unreachable', async () => {
      // Mock the ConnectivityService's checkConnectivity method  
      vi.mocked(ConnectivityService).mockImplementation(() => ({
        checkConnectivity: vi.fn().mockResolvedValueOnce(false)
      }));
      
      const testSyncService = new SyncService(db, taskService);
      const isOnline = await testSyncService.checkConnectivity();
      expect(isOnline).toBe(false);
    });
  });

  describe('addToSyncQueue', () => {
    it('should add operation to sync queue', async () => {
      const task = await taskService.createTask({ title: 'Test Task' });
      
      await syncService.addToSyncQueue(task.id, 'update', {
        title: 'Updated Title',
      });

      const queueItems = await db.all('SELECT * FROM sync_queue WHERE task_id = ?', [task.id]);
      expect(queueItems.length).toBeGreaterThan(0);
      expect(queueItems[queueItems.length - 1].operation).toBe('update');
    });
  });

  describe('sync', () => {
    it('should process all items in sync queue', async () => {
      // Create tasks that need syncing
      const task1 = await taskService.createTask({ title: 'Task 1' });
      const task2 = await taskService.createTask({ title: 'Task 2' });

      // Mock successful sync response
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: {
          processed_items: [
            {
              client_id: task1.id,
              server_id: 'srv_1',
              status: 'success',
            },
            {
              client_id: task2.id,
              server_id: 'srv_2',
              status: 'success',
            },
          ],
        },
      });

      const result = await syncService.sync();
      
      expect(result.success).toBe(true);
      expect(result.synced_items).toBe(2);
      expect(result.failed_items).toBe(0);
    });

    it('should handle sync failures gracefully', async () => {
      // Create a task with an ID that will trigger failure in sync
      await db.createTask({
        id: 'fail-me',
        title: 'Task that will fail',
        description: '',
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
        sync_status: 'pending'
      });
      
      await syncService.addToSyncQueue('fail-me', 'create', { title: 'Task that will fail' });

      const result = await syncService.sync();
      
      expect(result.success).toBe(false);
      expect(result.failed_items).toBeGreaterThan(0);
    });
  });

  describe('conflict resolution', () => {
    it('should resolve conflicts using last-write-wins', async () => {
      // This test would verify that when there's a conflict,
      // the task with the more recent updated_at timestamp wins
      // Implementation depends on the actual conflict resolution logic
    });
  });
});