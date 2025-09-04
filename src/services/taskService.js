import { v4 as uuidv4 } from 'uuid';
import { TaskSyncManager } from './taskSyncManager.js';

class TaskService {
  constructor(db) {
    this.db = db;
    this.syncManager = new TaskSyncManager(db);
  }

  async createTask(taskData) {
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
    return task;
  }

  async updateTask(id, updates) {
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
    return await this.db.getAllTasks();
  }

  async getTasksNeedingSync() {
    return await this.syncManager.getTasksNeedingSync();
  }
}

export { TaskService };
