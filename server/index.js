import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3456;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// API Routes

// Clients
app.get('/api/clients', (req, res) => {
  try {
    const clients = db.prepare('SELECT * FROM clients ORDER BY name').all();
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/clients', (req, res) => {
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

app.get('/api/clients/:id', (req, res) => {
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

app.put('/api/clients/:id', (req, res) => {
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

app.delete('/api/clients/:id', (req, res) => {
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
app.get('/api/clients/:clientId/meetings', (req, res) => {
  try {
    const meetings = db.prepare('SELECT * FROM meetings WHERE client_id = ? ORDER BY meeting_date DESC').all(req.params.clientId);
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/clients/:clientId/meetings', (req, res) => {
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

app.get('/api/meetings/:id', (req, res) => {
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

app.put('/api/meetings/:id', (req, res) => {
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
app.get('/api/meetings/:meetingId/wins', (req, res) => {
  try {
    const wins = db.prepare('SELECT * FROM big_wins WHERE meeting_id = ? ORDER BY created_at').all(req.params.meetingId);
    res.json(wins);
  } catch (error) {
    console.error('Error fetching big wins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/meetings/:meetingId/wins', (req, res) => {
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
app.get('/api/clients/:clientId/scorecard-items', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM scorecard_items WHERE client_id = ? ORDER BY name').all(req.params.clientId);
    res.json(items);
  } catch (error) {
    console.error('Error fetching scorecard items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/clients/:clientId/scorecard-items', (req, res) => {
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
app.get('/api/clients/:clientId/todos', (req, res) => {
  try {
    const todos = db.prepare('SELECT * FROM todos WHERE client_id = ? ORDER BY created_at DESC').all(req.params.clientId);
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/clients/:clientId/todos', (req, res) => {
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

app.put('/api/todos/:id', (req, res) => {
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`CMO Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;