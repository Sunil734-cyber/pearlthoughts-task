import { v4 as uuidv4 } from 'uuid';
import { TaskSyncManager } from './taskSyncManager.js';

class TaskService {
  constructor(db) {
    this.db = db;
    this.syncManager = new TaskSyncManager(db);
    // Optimize: Add in-memory cache to reduce database queries
    this.taskCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.lastCacheUpdate = 0;
  }

  async createTask(taskData) {
    console.log('Creating new task:', taskData.title);
    const now = new Date().toISOString();
    const task = {
      id: uuidv4(),
      title: taskData.title,
      description: taskData.description || '',
      completed: false,
      created_at: now,
      updated_at: now,
      is_deleted: false,
      sync_status: 'pending',
      server_id: null,
      last_synced_at: null
    };
    await this.db.createTask(task);
    await this.syncManager.addCreateToSyncQueue(task);
    console.log('Task created successfully:', task.id);
    return task;
  }

  async updateTask(id, updates) {
    console.log('Updating task:', id, updates);
    const existingTask = await this.getTask(id);
    if (!existingTask) return null;
    
    const now = new Date().toISOString();
    updates.updated_at = now;
    updates.sync_status = 'pending';
    await this.db.updateTask(id, updates);
    const updatedTask = await this.getTask(id);
    await this.syncManager.addUpdateToSyncQueue(id, updates);
    return updatedTask;
  }

  async deleteTask(id) {
    const existingTask = await this.getTask(id);
    if (!existingTask) return false;
    
    await this.db.softDeleteTask(id);
    await this.syncManager.addDeleteToSyncQueue(id);
    return true;
  }

  async getTask(id) {
    return await this.db.getTask(id);
  }

  async getAllTasks() {
    // Optimize: Use cache to reduce database queries
    const now = Date.now();
    if (this.taskCache.has('all') && (now - this.lastCacheUpdate) < this.cacheExpiry) {
      return this.taskCache.get('all');
    }
    const tasks = await this.db.getAllTasks();
    this.taskCache.set('all', tasks);
    this.lastCacheUpdate = now;
    return tasks;
  }

  async getTasksNeedingSync() {
    return await this.syncManager.getTasksNeedingSync();
  }
}

export { TaskService };
