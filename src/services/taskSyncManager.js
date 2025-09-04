import { v4 as uuidv4 } from 'uuid';

class TaskSyncManager {
  constructor(db) {
    this.db = db;
  }

  async addTaskToSyncQueue(taskId, operation, data) {
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

  async addCreateToSyncQueue(task) {
    await this.addTaskToSyncQueue(task.id, 'create', task);
  }

  async addUpdateToSyncQueue(taskId, updates) {
    await this.addTaskToSyncQueue(taskId, 'update', updates);
  }

  async addDeleteToSyncQueue(taskId) {
    await this.addTaskToSyncQueue(taskId, 'delete', {});
  }

  async getTasksNeedingSync() {
    const sql = `SELECT * FROM tasks WHERE sync_status IN ('pending', 'error') AND is_deleted = 0`;
    return await this.db.all(sql);
  }

  async updateTaskSyncStatus(taskId, status) {
    const updates = { 
      sync_status: status,
      last_synced_at: status === 'synced' ? new Date().toISOString() : null
    };
    await this.db.updateTask(taskId, updates);
  }
}

export { TaskSyncManager };
