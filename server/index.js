import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';
import authRoutes from './authRoutes.js';
import { authenticate, authorize, filterClientData, createDefaultAdmin } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3458; // Changed to 3458 to avoid conflicts

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Initialize default admin user
createDefaultAdmin();

// Authentication routes (no auth required)
app.use('/api/auth', authRoutes);

// API Routes (all protected with authentication)

// Clients
app.get('/api/clients', authenticate, filterClientData, (req, res) => {
  try {
    let clients;
    
    if (req.user.role === 'admin') {
      // Admins can see all clients
      clients = db.prepare('SELECT * FROM clients ORDER BY name').all();
    } else {
      // Clients can only see their own data
      clients = db.prepare('SELECT * FROM clients WHERE id = ? ORDER BY name').all(req.clientFilter);
    }
    
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/clients', authenticate, authorize('admin'), (req, res) => {
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

app.get('/api/clients/:id', authenticate, filterClientData, (req, res) => {
  try {
    const clientId = req.params.id;
    
    // Check access permissions
    if (req.user.role === 'client' && parseInt(clientId) !== req.clientFilter) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/clients/:id', authenticate, authorize('admin'), (req, res) => {
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

app.delete('/api/clients/:id', authenticate, authorize('admin'), (req, res) => {
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
app.get('/api/clients/:clientId/meetings', authenticate, filterClientData, (req, res) => {
  try {
    const clientId = req.params.clientId;
    
    // Check access permissions
    if (req.user.role === 'client' && parseInt(clientId) !== req.clientFilter) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const meetings = db.prepare('SELECT * FROM meetings WHERE client_id = ? ORDER BY meeting_date DESC').all(clientId);
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/clients/:clientId/meetings', authenticate, filterClientData, (req, res) => {
  try {
    const clientId = req.params.clientId;
    const { meeting_date, status, notes } = req.body;
    
    // Check access permissions
    if (req.user.role === 'client' && parseInt(clientId) !== req.clientFilter) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO meetings (client_id, meeting_date, status, notes)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(clientId, meeting_date, status || 'draft', notes);
    const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(meeting);
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/meetings/:id', authenticate, filterClientData, (req, res) => {
  try {
    const meetingId = req.params.id;
    
    // Get meeting with client info
    const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(meetingId);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Check access permissions
    if (req.user.role === 'client' && meeting.client_id !== req.clientFilter) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(meeting);
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/meetings/:id', authenticate, filterClientData, (req, res) => {
  try {
    const meetingId = req.params.id;
    const { meeting_date, status, notes, meeting_score_avg } = req.body;
    
    // Get meeting to check ownership
    const meeting = db.prepare('SELECT client_id FROM meetings WHERE id = ?').get(meetingId);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Check access permissions
    if (req.user.role === 'client' && meeting.client_id !== req.clientFilter) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const stmt = db.prepare(`
      UPDATE meetings SET
        meeting_date = ?, status = ?, notes = ?, meeting_score_avg = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(meeting_date, status, notes, meeting_score_avg, meetingId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    const updatedMeeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(meetingId);
    res.json(updatedMeeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Big Wins
app.get('/api/meetings/:meetingId/wins', authenticate, filterClientData, (req, res) => {
  try {
    const meetingId = req.params.meetingId;
    
    // Check meeting access
    const meeting = db.prepare('SELECT client_id FROM meetings WHERE id = ?').get(meetingId);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    if (req.user.role === 'client' && meeting.client_id !== req.clientFilter) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const wins = db.prepare('SELECT * FROM big_wins WHERE meeting_id = ? ORDER BY created_at').all(meetingId);
    res.json(wins);
  } catch (error) {
    console.error('Error fetching big wins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/meetings/:meetingId/wins', authenticate, filterClientData, (req, res) => {
  try {
    const meetingId = req.params.meetingId;
    const { title, description } = req.body;
    
    // Check meeting access
    const meeting = db.prepare('SELECT client_id FROM meetings WHERE id = ?').get(meetingId);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    if (req.user.role === 'client' && meeting.client_id !== req.clientFilter) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const stmt = db.prepare('INSERT INTO big_wins (meeting_id, title, description) VALUES (?, ?, ?)');
    const result = stmt.run(meetingId, title, description);
    const win = db.prepare('SELECT * FROM big_wins WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(win);
  } catch (error) {
    console.error('Error creating big win:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Scorecard Items
app.get('/api/clients/:clientId/scorecard-items', authenticate, filterClientData, (req, res) => {
  try {
    const clientId = req.params.clientId;
    
    // Check access permissions
    if (req.user.role === 'client' && parseInt(clientId) !== req.clientFilter) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const items = db.prepare('SELECT * FROM scorecard_items WHERE client_id = ? ORDER BY name').all(clientId);
    res.json(items);
  } catch (error) {
    console.error('Error fetching scorecard items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/clients/:clientId/scorecard-items', authenticate, filterClientData, (req, res) => {
  try {
    const clientId = req.params.clientId;
    const { name, goal_min, goal_max, current_value } = req.body;
    
    // Check access permissions
    if (req.user.role === 'client' && parseInt(clientId) !== req.clientFilter) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO scorecard_items (client_id, name, goal_min, goal_max, current_value)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(clientId, name, goal_min, goal_max, current_value);
    const item = db.prepare('SELECT * FROM scorecard_items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating scorecard item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Todos
app.get('/api/clients/:clientId/todos', authenticate, filterClientData, (req, res) => {
  try {
    const clientId = req.params.clientId;
    
    // Check access permissions
    if (req.user.role === 'client' && parseInt(clientId) !== req.clientFilter) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const todos = db.prepare('SELECT * FROM todos WHERE client_id = ? ORDER BY created_at DESC').all(clientId);
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/clients/:clientId/todos', authenticate, filterClientData, (req, res) => {
  try {
    const clientId = req.params.clientId;
    const { title, description, assigned_to, due_date, meeting_id } = req.body;
    
    // Check access permissions
    if (req.user.role === 'client' && parseInt(clientId) !== req.clientFilter) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO todos (client_id, meeting_id, title, description, assigned_to, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(clientId, meeting_id, title, description, assigned_to, due_date);
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(todo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/todos/:id', authenticate, filterClientData, (req, res) => {
  try {
    const todoId = req.params.id;
    const { title, description, assigned_to, status, due_date, notes } = req.body;
    
    // Get todo to check ownership
    const todo = db.prepare('SELECT client_id FROM todos WHERE id = ?').get(todoId);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    // Check access permissions
    if (req.user.role === 'client' && todo.client_id !== req.clientFilter) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const completed_at = status === 'complete' ? new Date().toISOString() : null;
    
    const stmt = db.prepare(`
      UPDATE todos SET
        title = ?, description = ?, assigned_to = ?, status = ?,
        due_date = ?, notes = ?, completed_at = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(title, description, assigned_to, status, due_date, notes, completed_at, todoId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const updatedTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(todoId);
    res.json(updatedTodo);
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