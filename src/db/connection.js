import pkg from 'pg';
const { Pool } = pkg;

export class DatabaseConnection {
  constructor(connectionString = process.env.DATABASE_URL) {
    this.pool = new Pool({
      connectionString: connectionString,
      ssl: connectionString?.includes('sslmode=require') ? { rejectUnauthorized: false } : false
    });
  }

  async run(sql, params = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result;
    } finally {
      client.release();
    }
  }

  async get(sql, params = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async all(sql, params = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async close() {
    await this.pool.end();
  }
}
