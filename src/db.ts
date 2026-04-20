import Database from "better-sqlite3";

/* ======================================================
   DATABASE INITIALIZATION
====================================================== */

export const db = new Database("auth.db");

/* ======================================================
   USERS TABLE
   - stores login accounts
   - supports role-based access control
====================================================== */

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
);
`);

/* ======================================================
   SAFE MIGRATION: ADD ROLE COLUMN
   NOTE: SQLite has no "IF NOT EXISTS" for ALTER TABLE
   so we check manually before adding column
====================================================== */

const userTableInfo = db.prepare("PRAGMA table_info(users)").all();
const hasRoleColumn = userTableInfo.some((col: any) => col.name === "role");

if (!hasRoleColumn) {
  db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'admin';`);
}

/* ======================================================
   AUDIT LOGS TABLE
   - tracks admin actions (create/delete peer, login, etc.)
====================================================== */

db.exec(`
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT,
  target TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

/* ======================================================
   API TOKENS TABLE
   - used for programmatic access (automation, scripts)
   - supports role-based API control
====================================================== */

db.exec(`
CREATE TABLE IF NOT EXISTS api_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT UNIQUE,
  role TEXT DEFAULT 'admin'
);
`);