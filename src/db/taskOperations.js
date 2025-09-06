// Task-related database operations
export async function createTask(connection, task) {
  const sql = `INSERT INTO tasks (id, title, description, completed, created_at, updated_at, is_deleted, sync_status, server_id, last_synced_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  await connection.run(sql, [
    task.id,
    task.title,
    task.description || '',
    task.completed ? 1 : 0,
    task.created_at,
    task.updated_at,
    task.is_deleted ? 1 : 0,
    task.sync_status || 'pending',
    task.server_id || null,
    task.last_synced_at || null
  ]);
}

export async function getTask(connection, id) {
  const sql = `SELECT * FROM tasks WHERE id = ? AND is_deleted = 0`;
  const row = await connection.get(sql, [id]);
  if (row) {
    row.completed = Boolean(row.completed);
    row.is_deleted = Boolean(row.is_deleted);
  }
  return row;
}

export async function getAllTasks(connection) {
  const sql = `SELECT * FROM tasks WHERE is_deleted = 0`;
  const rows = await connection.all(sql);
  return rows.map(row => ({
    ...row,
    completed: Boolean(row.completed),
    is_deleted: Boolean(row.is_deleted)
  }));
}

export async function updateTask(connection, id, updates) {
  const fields = [];
  const params = [];
  for (const key in updates) {
    fields.push(`${key} = ?`);
    params.push(updates[key]);
  }
  params.push(id);
  const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
  await connection.run(sql, params);
}

export async function softDeleteTask(connection, id) {
  const sql = `UPDATE tasks SET is_deleted = 1, updated_at = ? WHERE id = ?`;
  await connection.run(sql, [new Date().toISOString(), id]);
}
