export class DatabaseSchema {
  static async createTables(connection) {
    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
<<<<<<< HEAD
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE,
        sync_status TEXT DEFAULT 'pending',
        server_id TEXT,
        last_synced_at TIMESTAMP
=======
        completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_deleted INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'pending',
        server_id TEXT,
        last_synced_at DATETIME
>>>>>>> 48dd4c7c25db550133cb05d41668f42e72f7de6a
      )
    `;

    const createSyncQueueTable = `
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        data TEXT NOT NULL,
<<<<<<< HEAD
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
=======
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
>>>>>>> 48dd4c7c25db550133cb05d41668f42e72f7de6a
        retry_count INTEGER DEFAULT 0,
        error_message TEXT,
        FOREIGN KEY (task_id) REFERENCES tasks(id)
      )
    `;

    await connection.run(createTasksTable);
    await connection.run(createSyncQueueTable);
  }
}
