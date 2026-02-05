import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './database.js';

// JWT Secret - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'figmints-cmo-secret-key-change-in-production';

// Hash password
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Compare password
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user from database
    const user = db.prepare(`
      SELECT u.*, c.name as client_name 
      FROM users u 
      LEFT JOIN clients c ON u.client_id = c.id 
      WHERE u.id = ? AND u.is_active = 1
    `).get(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Update last login
    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Client access filter - ensure clients can only see their own data
export const filterClientData = (req, res, next) => {
  if (req.user.role === 'client') {
    // Add client_id filter to query parameters for client users
    req.clientFilter = req.user.client_id;
  }
  next();
};

// Create default admin user if none exists
export const createDefaultAdmin = async () => {
  try {
    const adminExists = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin');
    
    if (adminExists.count === 0) {
      const hashedPassword = await hashPassword('admin123');
      
      db.prepare(`
        INSERT INTO users (email, password_hash, role, first_name, last_name)
        VALUES (?, ?, ?, ?, ?)
      `).run('admin@figmints.com', hashedPassword, 'admin', 'Admin', 'User');
      
      console.log('Default admin user created: admin@figmints.com / admin123');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// User management functions
export const createUser = async (userData) => {
  const { email, password, role, client_id, first_name, last_name } = userData;
  
  // Check if user already exists
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const password_hash = await hashPassword(password);

  // Create user
  const stmt = db.prepare(`
    INSERT INTO users (email, password_hash, role, client_id, first_name, last_name)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(email, password_hash, role, client_id, first_name, last_name);
  
  // Return user without password
  const user = db.prepare(`
    SELECT u.*, c.name as client_name 
    FROM users u 
    LEFT JOIN clients c ON u.client_id = c.id 
    WHERE u.id = ?
  `).get(result.lastInsertRowid);
  
  delete user.password_hash;
  return user;
};

// Generate password reset token
export const generateResetToken = () => {
  return jwt.sign({ reset: true }, JWT_SECRET, { expiresIn: '1h' });
};