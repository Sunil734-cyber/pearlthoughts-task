import { DatabaseConnection } from './connection.js';
import { DatabaseSchema } from './schema.js';
import { TaskRepository } from './taskRepository.js';
import { SyncRepository } from './syncRepository.js';

export class Database {
  constructor(filename = ':memory:') {
    this.connection = new DatabaseConnection(filename);
    this.tasks = new TaskRepository(this.connection);
    this.sync = new SyncRepository(this.connection);
  }

  async initialize() {
    await DatabaseSchema.createTables(this.connection);
  }

  // Delegate methods to repositories for backward compatibility
  async createTask(task) {
    return this.tasks.createTask(task);
  }

  async updateTask(id, updates) {
    return this.tasks.updateTask(id, updates);
  }

  async softDeleteTask(id) {
    return this.tasks.softDeleteTask(id);
  }

  async getTask(id) {
    return this.tasks.getTask(id);
  }

  async getAllTasks() {
    return this.tasks.getAllTasks();
  }

  async updateSyncStatus(task_id, status) {
    return this.tasks.updateSyncStatus(task_id, status);
  }

  async addToSyncQueue(item) {
    return this.sync.addToSyncQueue(item);
  }

  async getSyncQueue() {
    return this.sync.getSyncQueue();
  }

  // Direct access to connection methods
  async run(sql, params) {
    return this.connection.run(sql, params);
  }

  async get(sql, params) {
    return this.connection.get(sql, params);
  }

  async all(sql, params) {
    return this.connection.all(sql, params);
  }

  async close() {
    return this.connection.close();
  }
}
