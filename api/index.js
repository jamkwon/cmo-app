import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize database
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/cmo.db' 
  : join(__dirname, '../server/cmo.db');

let db;

const initDatabase = () => {
  if (db) return db;
  
  db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  
  // Create tables if they don't exist
  const createTables = () => {
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
        passwords_access TEXT,
        important_links TEXT,
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
        status TEXT DEFAULT 'draft',
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

    // Scorecard Items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS scorecard_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        goal_min REAL,
        goal_max REAL,
        current_value REAL,
        previous_value REAL,
        trend TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
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
        assigned_to TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        due_date DATE,
        notes TEXT,
        attachments TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE SET NULL
      )
    `);
  };
  
  createTables();
  
  // Seed data if empty
  const clientCount = db.prepare('SELECT COUNT(*) as count FROM clients').get().count;
  if (clientCount === 0) {
    console.log('Seeding database with sample data...');
    const insertClient = db.prepare(`
      INSERT INTO clients (name, url, client_name, client_contact, account_manager, strategist)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    insertClient.run('FIGMINTS Demo Client', 'https://example.com', 'John Doe', 'john@example.com', 'Sarah Wilson', 'Mike Chen');
    console.log('Sample data seeded');
  }
  
  return db;
};

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize database on first request
app.use((req, res, next) => {
  if (!db) {
    initDatabase();
  }
  next();
});

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Clients
app.get('/clients', (req, res) => {
  try {
    const clients = db.prepare('SELECT * FROM clients ORDER BY name').all();
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/clients', (req, res) => {
  try {
    const {
      name, url, address, client_name, client_contact, preferred_contact,
      account_manager, am_email, strategist, strat_email, regular_meeting_date,
      passwords_access, important_links
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO clients (
        name, url, address, client_name, client_contact, preferred_contact,
        account_manager, am_email, strategist, strat_email, regular_meeting_date,
        passwords_access, important_links
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name, url, address, client_name, client_contact, preferred_contact,
      account_manager, am_email, strategist, strat_email, regular_meeting_date,
      JSON.stringify(passwords_access), JSON.stringify(important_links)
    );

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/clients/:id', (req, res) => {
  try {
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/clients/:id', (req, res) => {
  try {
    const {
      name, url, address, client_name, client_contact, preferred_contact,
      account_manager, am_email, strategist, strat_email, regular_meeting_date,
      passwords_access, important_links
    } = req.body;

    const stmt = db.prepare(`
      UPDATE clients SET
        name = ?, url = ?, address = ?, client_name = ?, client_contact = ?,
        preferred_contact = ?, account_manager = ?, am_email = ?, strategist = ?,
        strat_email = ?, regular_meeting_date = ?, passwords_access = ?,
        important_links = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      name, url, address, client_name, client_contact, preferred_contact,
      account_manager, am_email, strategist, strat_email, regular_meeting_date,
      JSON.stringify(passwords_access), JSON.stringify(important_links),
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/clients/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Meetings
app.get('/clients/:clientId/meetings', (req, res) => {
  try {
    const meetings = db.prepare('SELECT * FROM meetings WHERE client_id = ? ORDER BY meeting_date DESC').all(req.params.clientId);
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/clients/:clientId/meetings', (req, res) => {
  try {
    const { meeting_date, status, notes } = req.body;
    const stmt = db.prepare(`
      INSERT INTO meetings (client_id, meeting_date, status, notes)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(req.params.clientId, meeting_date, status || 'draft', notes);
    const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(meeting);
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/meetings/:id', (req, res) => {
  try {
    const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json(meeting);
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/meetings/:id', (req, res) => {
  try {
    const { meeting_date, status, notes, meeting_score_avg } = req.body;
    const stmt = db.prepare(`
      UPDATE meetings SET
        meeting_date = ?, status = ?, notes = ?, meeting_score_avg = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(meeting_date, status, notes, meeting_score_avg, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(req.params.id);
    res.json(meeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Big Wins
app.get('/meetings/:meetingId/wins', (req, res) => {
  try {
    const wins = db.prepare('SELECT * FROM big_wins WHERE meeting_id = ? ORDER BY created_at').all(req.params.meetingId);
    res.json(wins);
  } catch (error) {
    console.error('Error fetching big wins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/meetings/:meetingId/wins', (req, res) => {
  try {
    const { title, description } = req.body;
    const stmt = db.prepare('INSERT INTO big_wins (meeting_id, title, description) VALUES (?, ?, ?)');
    const result = stmt.run(req.params.meetingId, title, description);
    const win = db.prepare('SELECT * FROM big_wins WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(win);
  } catch (error) {
    console.error('Error creating big win:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Scorecard Items
app.get('/clients/:clientId/scorecard-items', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM scorecard_items WHERE client_id = ? ORDER BY name').all(req.params.clientId);
    res.json(items);
  } catch (error) {
    console.error('Error fetching scorecard items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/clients/:clientId/scorecard-items', (req, res) => {
  try {
    const { name, goal_min, goal_max, current_value } = req.body;
    const stmt = db.prepare(`
      INSERT INTO scorecard_items (client_id, name, goal_min, goal_max, current_value)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(req.params.clientId, name, goal_min, goal_max, current_value);
    const item = db.prepare('SELECT * FROM scorecard_items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating scorecard item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Todos
app.get('/clients/:clientId/todos', (req, res) => {
  try {
    const todos = db.prepare('SELECT * FROM todos WHERE client_id = ? ORDER BY created_at DESC').all(req.params.clientId);
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/clients/:clientId/todos', (req, res) => {
  try {
    const { title, description, assigned_to, due_date, meeting_id } = req.body;
    const stmt = db.prepare(`
      INSERT INTO todos (client_id, meeting_id, title, description, assigned_to, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(req.params.clientId, meeting_id, title, description, assigned_to, due_date);
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(todo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/todos/:id', (req, res) => {
  try {
    const { title, description, assigned_to, status, due_date, notes } = req.body;
    const completed_at = status === 'complete' ? new Date().toISOString() : null;
    
    const stmt = db.prepare(`
      UPDATE todos SET
        title = ?, description = ?, assigned_to = ?, status = ?,
        due_date = ?, notes = ?, completed_at = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(title, description, assigned_to, status, due_date, notes, completed_at, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
    res.json(todo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;