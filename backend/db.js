const Database = require('better-sqlite3');
const path = require('path');
const { config } = require('./src/config');

let dbInstance = null;

function getSchemaStatements() {
  return [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('viewer', 'analyst', 'admin')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS financial_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL CHECK (amount > 0),
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      deleted_at TEXT DEFAULT NULL,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  ];
}

function initializeTables(database) {
  const statements = getSchemaStatements();
  for (const sql of statements) {
    database.exec(sql);
  }
}

function getDb() {
  if (!dbInstance) {
    const resolvedPath =
      path.isAbsolute(config.databasePath)
        ? config.databasePath
        : path.resolve(process.cwd(), config.databasePath);
    dbInstance = new Database(resolvedPath);
    dbInstance.pragma('foreign_keys = ON');
    initializeTables(dbInstance);
  }
  return dbInstance;
}

function resetDbForTesting(databasePath) {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
  const fs = require('fs');
  const resolvedPath =
    path.isAbsolute(databasePath)
      ? databasePath
      : path.resolve(process.cwd(), databasePath);
  if (fs.existsSync(resolvedPath)) {
    fs.unlinkSync(resolvedPath);
  }
  dbInstance = new Database(resolvedPath);
  dbInstance.pragma('foreign_keys = ON');
  initializeTables(dbInstance);
  return dbInstance;
}

function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

module.exports = {
  getDb,
  initializeTables,
  resetDbForTesting,
  closeDb,
};
