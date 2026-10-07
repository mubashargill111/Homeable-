const mysql = require('mysql2/promise');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let pool;
let isSqlite = false;
let sqliteDbInstance = null;

// Determine if we should use SQLite
if (process.env.DB_TYPE === 'sqlite' || !process.env.DB_HOST) {
  isSqlite = true;
}

if (isSqlite) {
  const dbPath = path.join(__dirname, 'homeable.db');
  console.log(`Using SQLite database at: ${dbPath}`);
  
  // Initialize SQLite database instance
  sqliteDbInstance = new DatabaseSync(dbPath);
  sqliteDbInstance.exec('PRAGMA foreign_keys = ON;');
  
  // Register NOW() function compatibility
  sqliteDbInstance.function('now', () => {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  });

  // Check if database needs initialization (e.g. if users table doesn't exist)
  let needsInit = false;
  try {
    sqliteDbInstance.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    const checkTable = sqliteDbInstance.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='users'").get();
    if (!checkTable || checkTable.count === 0) {
      needsInit = true;
    }
  } catch (err) {
    needsInit = true;
  }

  if (needsInit) {
    console.log('Initializing SQLite database with schema and sample data...');
    const sqlPath = path.join(__dirname, 'database_sqlite.sql');
    try {
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      
      // Execute the SQL script. node:sqlite exec executes multiple SQL statements separated by semicolons.
      sqliteDbInstance.exec(sqlContent);
      console.log('SQLite database initialized successfully.');
    } catch (err) {
      console.error('Failed to initialize SQLite database:', err.message);
    }
  }

  // Create compatible pool interface
  pool = {
    async query(sql, params = []) {
      let cleanedSql = sql.replace(/\bFOR UPDATE\b/gi, '');
      const stmt = sqliteDbInstance.prepare(cleanedSql);
      const isSelect = /^\s*SELECT\b/i.test(cleanedSql);
      
      if (isSelect) {
        const rows = stmt.all(...params);
        const standardRows = rows.map(r => ({ ...r }));
        return [standardRows, null];
      } else {
        const info = stmt.run(...params);
        return [{
          insertId: info.lastInsertRowid !== undefined ? Number(info.lastInsertRowid) : null,
          affectedRows: info.changes
        }, null];
      }
    },

    async getConnection() {
      return {
        query: async (sql, params = []) => {
          let cleanedSql = sql.replace(/\bFOR UPDATE\b/gi, '');
          const stmt = sqliteDbInstance.prepare(cleanedSql);
          const isSelect = /^\s*SELECT\b/i.test(cleanedSql);
          if (isSelect) {
            const rows = stmt.all(...params);
            const standardRows = rows.map(r => ({ ...r }));
            return [standardRows, null];
          } else {
            const info = stmt.run(...params);
            return [{
              insertId: info.lastInsertRowid !== undefined ? Number(info.lastInsertRowid) : null,
              affectedRows: info.changes
            }, null];
          }
        },
        beginTransaction: async () => {
          sqliteDbInstance.prepare('BEGIN TRANSACTION').run();
        },
        commit: async () => {
          sqliteDbInstance.prepare('COMMIT').run();
        },
        rollback: async () => {
          sqliteDbInstance.prepare('ROLLBACK').run();
        },
        release: () => {
          // no-op
        }
      };
    }
  };
} else {
  // MySQL configuration
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'homeable_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
  });
}

async function testConnection() {
  if (isSqlite) {
    console.log('SQLite database connected and verified successfully.');
    return;
  }
  try {
    const conn = await pool.getConnection();
    console.log('MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.warn('MySQL connection failed:', err.message);
    console.log('Falling back to SQLite database...');
    
    // Fall back to SQLite setup
    isSqlite = true;
    const dbPath = path.join(__dirname, 'homeable.db');
    sqliteDbInstance = new DatabaseSync(dbPath);
    sqliteDbInstance.exec('PRAGMA foreign_keys = ON;');
    sqliteDbInstance.function('now', () => {
      return new Date().toISOString().replace('T', ' ').substring(0, 19);
    });

    let needsInit = false;
    try {
      const checkTable = sqliteDbInstance.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='users'").get();
      if (!checkTable || checkTable.count === 0) {
        needsInit = true;
      }
    } catch {
      needsInit = true;
    }

    if (needsInit) {
      console.log('Initializing SQLite database (fallback)...');
      const sqlPath = path.join(__dirname, 'database_sqlite.sql');
      try {
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        sqliteDbInstance.exec(sqlContent);
        console.log('SQLite database initialized successfully.');
      } catch (sqErr) {
        console.error('Failed to initialize SQLite database:', sqErr.message);
      }
    }

    // Override the query/getConnection methods to use SQLite
    pool.query = async (sql, params = []) => {
      let cleanedSql = sql.replace(/\bFOR UPDATE\b/gi, '');
      const stmt = sqliteDbInstance.prepare(cleanedSql);
      const isSelect = /^\s*SELECT\b/i.test(cleanedSql);
      if (isSelect) {
        const rows = stmt.all(...params);
        return [rows.map(r => ({ ...r })), null];
      } else {
        const info = stmt.run(...params);
        return [{
          insertId: info.lastInsertRowid !== undefined ? Number(info.lastInsertRowid) : null,
          affectedRows: info.changes
        }, null];
      }
    };

    pool.getConnection = async () => {
      return {
        query: async (sql, params = []) => {
          let cleanedSql = sql.replace(/\bFOR UPDATE\b/gi, '');
          const stmt = sqliteDbInstance.prepare(cleanedSql);
          const isSelect = /^\s*SELECT\b/i.test(cleanedSql);
          if (isSelect) {
            const rows = stmt.all(...params);
            return [rows.map(r => ({ ...r })), null];
          } else {
            const info = stmt.run(...params);
            return [{
              insertId: info.lastInsertRowid !== undefined ? Number(info.lastInsertRowid) : null,
              affectedRows: info.changes
            }, null];
          }
        },
        beginTransaction: async () => {
          sqliteDbInstance.prepare('BEGIN TRANSACTION').run();
        },
        commit: async () => {
          sqliteDbInstance.prepare('COMMIT').run();
        },
        rollback: async () => {
          sqliteDbInstance.prepare('ROLLBACK').run();
        },
        release: () => {}
      };
    };
  }
}

module.exports = { pool, testConnection };
