<<<<<<< HEAD
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
=======
import sqlite3 from 'sqlite3';

const sqlite = sqlite3.verbose();

export class DatabaseConnection {
  constructor(filename = ':memory:') {
    this.db = new sqlite.Database(filename);
    // Optimize: Configure SQLite for better performance
    this.db.run('PRAGMA journal_mode = WAL');
    this.db.run('PRAGMA synchronous = NORMAL');
    this.db.run('PRAGMA cache_size = 1000');
    this.db.run('PRAGMA temp_store = MEMORY');
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
>>>>>>> 48dd4c7c25db550133cb05d41668f42e72f7de6a
  }
}
