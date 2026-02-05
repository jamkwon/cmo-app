import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'cmo.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = () => {
  // Users table for authentication
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'client')) DEFAULT 'client',
      client_id INTEGER,
      first_name TEXT,
      last_name TEXT,
      is_active BOOLEAN DEFAULT 1,
      last_login DATETIME,
      reset_token TEXT,
      reset_token_expires DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
    )
  `);

  // Clients table
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT,
      address TEXT,
      client_name TEXT,
      client_contact TEXT,
      preferred_contact TEXT,
      account_manager TEXT,
      am_email TEXT,
      strategist TEXT,
      strat_email TEXT,
      regular_meeting_date TEXT,
      passwords_access TEXT, -- JSON
      important_links TEXT, -- JSON array
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Meetings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      meeting_date DATE NOT NULL,
      meeting_score_avg REAL,
      status TEXT DEFAULT 'draft', -- draft, in_progress, completed
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  // Big Wins table
  db.exec(`
    CREATE TABLE IF NOT EXISTS big_wins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
    )
  `);

  // Scorecard Items table (client-level metrics)
  db.exec(`
    CREATE TABLE IF NOT EXISTS scorecard_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      goal_min REAL,
      goal_max REAL,
      current_value REAL,
      previous_value REAL,
      trend TEXT, -- up, down, flat
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  // Scorecard Entries table (meeting-specific values)
  db.exec(`
    CREATE TABLE IF NOT EXISTS scorecard_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scorecard_item_id INTEGER NOT NULL,
      meeting_id INTEGER NOT NULL,
      value REAL NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (scorecard_item_id) REFERENCES scorecard_items(id) ON DELETE CASCADE,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
    )
  `);

  // Todos table
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      meeting_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to TEXT NOT NULL, -- 'us' or 'client'
      status TEXT DEFAULT 'pending', -- pending, in_progress, complete, carried_over
      due_date DATE,
      notes TEXT,
      attachments TEXT, -- JSON
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE SET NULL
    )
  `);

  // Baseline Updates table
  db.exec(`
    CREATE TABLE IF NOT EXISTS baseline_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id INTEGER NOT NULL,
      category TEXT NOT NULL, -- newsletter, seo, paid_ads, etc.
      status TEXT,
      notes TEXT,
      link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
    )
  `);

  // Campaign Updates table
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaign_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phase TEXT,
      progress_percent INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  // IDS Items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ids_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id INTEGER NOT NULL,
      type TEXT NOT NULL, -- issue, discussion, strategy, project
      title TEXT NOT NULL,
      description TEXT,
      owner TEXT,
      status TEXT DEFAULT 'identified', -- identified, discussed, solved
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
    )
  `);

  // Meeting Scores table
  db.exec(`
    CREATE TABLE IF NOT EXISTS meeting_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id INTEGER NOT NULL,
      scorer_name TEXT NOT NULL,
      score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
    )
  `);

  // Big Ideas table
  db.exec(`
    CREATE TABLE IF NOT EXISTS big_ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      priority INTEGER DEFAULT 0,
      status TEXT DEFAULT 'backlog',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  // Timeline Items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS timeline_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      project_name TEXT NOT NULL,
      phase TEXT,
      color TEXT,
      spans_months BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  // Newsletters table
  db.exec(`
    CREATE TABLE IF NOT EXISTS newsletters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      subject TEXT,
      status TEXT DEFAULT 'planned', -- planned, in_progress, sent
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);
};

// Initialize database
createTables();

export default db;