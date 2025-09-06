export class SyncRepository {
  constructor(connection) {
    this.connection = connection;
  }

  async addToSyncQueue(item) {
    const sql = `INSERT INTO sync_queue (id, task_id, operation, data, created_at, retry_count, error_message) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
    await this.connection.run(sql, [
      item.id,
      item.task_id,
      item.operation,
      JSON.stringify(item.data),
      item.created_at,
      item.retry_count || 0,
      item.error_message || null
    ]);
  }

  async getSyncQueue() {
    const sql = `SELECT * FROM sync_queue WHERE retry_count < 3`;
    return await this.connection.all(sql);
  }

  async updateRetryCount(id, count) {
    const sql = `UPDATE sync_queue SET retry_count = $1 WHERE id = $2`;
    await this.connection.run(sql, [count, id]);
  }

  async removeSyncItem(id) {
    const sql = `DELETE FROM sync_queue WHERE id = $1`;
    await this.connection.run(sql, [id]);
  }
}
