export class TaskRepository {
  constructor(connection) {
    this.connection = connection;
  }

  async createTask(task) {
    const sql = `INSERT INTO tasks (id, title, description, completed, created_at, updated_at, is_deleted, sync_status, server_id, last_synced_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
    await this.connection.run(sql, [
      task.id,
      task.title,
      task.description || '',
      task.completed || false,
      task.created_at,
      task.updated_at,
      task.is_deleted || false,
      task.sync_status || 'pending',
      task.server_id || null,
      task.last_synced_at || null
    ]);
  }

  async updateTask(id, updates) {
    const fields = [];
    const params = [];
    let paramIndex = 1;
    
    for (const key in updates) {
      fields.push(`${key} = $${paramIndex}`);
      params.push(updates[key]);
      paramIndex++;
    }
    params.push(id);
    const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
    await this.connection.run(sql, params);
  }

  async softDeleteTask(id) {
    const sql = `UPDATE tasks SET is_deleted = TRUE, updated_at = $1 WHERE id = $2`;
    await this.connection.run(sql, [new Date().toISOString(), id]);
  }

  async getTask(id) {
    const sql = `SELECT * FROM tasks WHERE id = $1 AND is_deleted = FALSE`;
    const row = await this.connection.get(sql, [id]);
    return row;
  }

  async getAllTasks() {
    const sql = `SELECT * FROM tasks WHERE is_deleted = FALSE`;
    const rows = await this.connection.all(sql);
    return rows;
  }

  async updateSyncStatus(task_id, status) {
    const sql = `UPDATE tasks SET sync_status = ? WHERE id = ?`;
    await this.connection.run(sql, [status, task_id]);
  }
}
