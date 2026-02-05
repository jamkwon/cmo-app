import express from 'express';
import rateLimit from 'express-rate-limit';
import db from './database.js';
import {
  hashPassword,
  comparePassword,
  generateToken,
  authenticate,
  authorize,
  createUser,
  generateResetToken,
  verifyToken
} from './auth.js';

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login endpoint
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user from database
    const user = db.prepare(`
      SELECT u.*, c.name as client_name 
      FROM users u 
      LEFT JOIN clients c ON u.client_id = c.id 
      WHERE u.email = ? AND u.is_active = 1
    `).get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Update last login
    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    // Return user data without password
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      client_id: user.client_id,
      client_name: user.client_name,
      first_name: user.first_name,
      last_name: user.last_name,
      last_login: user.last_login
    };

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', authenticate, (req, res) => {
  const userData = {
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    client_id: req.user.client_id,
    client_name: req.user.client_name,
    first_name: req.user.first_name,
    last_name: req.user.last_name,
    last_login: req.user.last_login
  };
  
  res.json({ user: userData });
});

// Update user profile
router.put('/me', authenticate, async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;
    const userId = req.user.id;

    // Check if email is already taken by another user
    if (email !== req.user.email) {
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Update user
    const stmt = db.prepare(`
      UPDATE users SET first_name = ?, last_name = ?, email = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(first_name, last_name, email, userId);

    // Get updated user
    const updatedUser = db.prepare(`
      SELECT u.*, c.name as client_name 
      FROM users u 
      LEFT JOIN clients c ON u.client_id = c.id 
      WHERE u.id = ?
    `).get(userId);

    const userData = {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      client_id: updatedUser.client_id,
      client_name: updatedUser.client_name,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      last_login: updatedUser.last_login
    };

    res.json({ message: 'Profile updated successfully', user: userData });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Verify current password
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
    const isValidPassword = await comparePassword(currentPassword, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password and update
    const newPasswordHash = await hashPassword(newPassword);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newPasswordHash, req.user.id);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin-only: Create new user
router.post('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { email, password, role, client_id, first_name, last_name } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (!['admin', 'client'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either admin or client' });
    }

    if (role === 'client' && !client_id) {
      return res.status(400).json({ error: 'Client ID is required for client role' });
    }

    const user = await createUser({
      email,
      password,
      role,
      client_id: role === 'client' ? client_id : null,
      first_name,
      last_name
    });

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('User creation error:', error);
    if (error.message === 'User with this email already exists') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin-only: Get all users
router.get('/users', authenticate, authorize('admin'), (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.id, u.email, u.role, u.client_id, u.first_name, u.last_name, 
             u.is_active, u.last_login, u.created_at, c.name as client_name
      FROM users u 
      LEFT JOIN clients c ON u.client_id = c.id 
      ORDER BY u.created_at DESC
    `).all();

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin-only: Update user
router.put('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { email, role, client_id, first_name, last_name, is_active } = req.body;
    const userId = req.params.id;

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is taken by another user
    const emailTaken = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId);
    if (emailTaken) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Update user
    const stmt = db.prepare(`
      UPDATE users SET 
        email = ?, role = ?, client_id = ?, first_name = ?, last_name = ?, 
        is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(email, role, role === 'client' ? client_id : null, first_name, last_name, is_active, userId);

    // Get updated user
    const updatedUser = db.prepare(`
      SELECT u.id, u.email, u.role, u.client_id, u.first_name, u.last_name, 
             u.is_active, u.last_login, u.created_at, c.name as client_name
      FROM users u 
      LEFT JOIN clients c ON u.client_id = c.id 
      WHERE u.id = ?
    `).get(userId);

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin-only: Delete user
router.delete('/users/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent self-deletion
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Password reset request
router.post('/reset-password-request', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = db.prepare('SELECT id FROM users WHERE email = ? AND is_active = 1').get(email);
    
    // Always return success to prevent email enumeration
    if (user) {
      const resetToken = generateResetToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
      
      db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?')
        .run(resetToken, expiresAt, user.id);
      
      // In a real app, you would send an email with the reset token
      console.log(`Password reset token for ${email}: ${resetToken}`);
    }

    res.json({ message: 'If an account with that email exists, a password reset link has been sent' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Password reset
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded || !decoded.reset) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Find user with valid reset token
    const user = db.prepare(`
      SELECT id FROM users 
      WHERE reset_token = ? AND reset_token_expires > datetime('now') AND is_active = 1
    `).get(token);

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password and clear reset token
    const newPasswordHash = await hashPassword(newPassword);
    db.prepare(`
      UPDATE users 
      SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(newPasswordHash, user.id);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (client-side token removal, but we can track it server-side if needed)
router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logout successful' });
});

export default router;