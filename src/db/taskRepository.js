export class TaskRepository {
  constructor(connection) {
    this.connection = connection;
  }

  async createTask(task) {
<<<<<<< HEAD
    const sql = `INSERT INTO tasks (id, title, description, completed, created_at, updated_at, is_deleted, sync_status, server_id, last_synced_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
=======
    const sql = `INSERT INTO tasks (id, title, description, completed, created_at, updated_at, is_deleted, sync_status, server_id, last_synced_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
>>>>>>> 48dd4c7c25db550133cb05d41668f42e72f7de6a
    await this.connection.run(sql, [
      task.id,
      task.title,
      task.description || '',
<<<<<<< HEAD
      task.completed || false,
      task.created_at,
      task.updated_at,
      task.is_deleted || false,
=======
      task.completed ? 1 : 0,
      task.created_at,
      task.updated_at,
      task.is_deleted ? 1 : 0,
>>>>>>> 48dd4c7c25db550133cb05d41668f42e72f7de6a
      task.sync_status || 'pending',
      task.server_id || null,
      task.last_synced_at || null
    ]);
  }

  async updateTask(id, updates) {
    const fields = [];
    const params = [];
<<<<<<< HEAD
    let paramIndex = 1;
    
    for (const key in updates) {
      fields.push(`${key} = $${paramIndex}`);
      params.push(updates[key]);
      paramIndex++;
    }
    params.push(id);
    const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
=======
    for (const key in updates) {
      fields.push(`${key} = ?`);
      params.push(updates[key]);
    }
    params.push(id);
    const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
>>>>>>> 48dd4c7c25db550133cb05d41668f42e72f7de6a
    await this.connection.run(sql, params);
  }

  async softDeleteTask(id) {
<<<<<<< HEAD
    const sql = `UPDATE tasks SET is_deleted = TRUE, updated_at = $1 WHERE id = $2`;
=======
    const sql = `UPDATE tasks SET is_deleted = 1, updated_at = ? WHERE id = ?`;
>>>>>>> 48dd4c7c25db550133cb05d41668f42e72f7de6a
    await this.connection.run(sql, [new Date().toISOString(), id]);
  }

  async getTask(id) {
<<<<<<< HEAD
    const sql = `SELECT * FROM tasks WHERE id = $1 AND is_deleted = FALSE`;
    const row = await this.connection.get(sql, [id]);
=======
    const sql = `SELECT * FROM tasks WHERE id = ? AND is_deleted = 0`;
    const row = await this.connection.get(sql, [id]);
    if (row) {
      // Convert SQLite integers to booleans
      row.completed = Boolean(row.completed);
      row.is_deleted = Boolean(row.is_deleted);
    }
>>>>>>> 48dd4c7c25db550133cb05d41668f42e72f7de6a
    return row;
  }

  async getAllTasks() {
<<<<<<< HEAD
    const sql = `SELECT * FROM tasks WHERE is_deleted = FALSE`;
    const rows = await this.connection.all(sql);
    return rows;
=======
    const sql = `SELECT * FROM tasks WHERE is_deleted = 0`;
    const rows = await this.connection.all(sql);
    return rows.map(row => ({
      ...row,
      completed: Boolean(row.completed),
      is_deleted: Boolean(row.is_deleted)
    }));
>>>>>>> 48dd4c7c25db550133cb05d41668f42e72f7de6a
  }

  async updateSyncStatus(task_id, status) {
    const sql = `UPDATE tasks SET sync_status = ? WHERE id = ?`;
    await this.connection.run(sql, [status, task_id]);
  }
}
