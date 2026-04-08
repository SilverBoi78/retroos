const path = require('path');
const Database = require('better-sqlite3');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'retroos.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// Enable foreign keys (critical for cascade deletes)
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    theme_id TEXT NOT NULL DEFAULT 'retro-classic',
    settings_json TEXT DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS fs_nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES fs_nodes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    node_type TEXT NOT NULL CHECK(node_type IN ('file', 'directory')),
    content TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    modified_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, parent_id, name)
  );

  CREATE TABLE IF NOT EXISTS user_wallpapers (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    image_data BLOB NOT NULL,
    mime_type TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_fs_nodes_user_id ON fs_nodes(user_id);
  CREATE INDEX IF NOT EXISTS idx_fs_nodes_parent_id ON fs_nodes(parent_id);
  CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
`);

module.exports = db;
