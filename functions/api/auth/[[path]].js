// Cloudflare Function for Authentication Routes
import bcrypt from 'bcryptjs';

// JWT utilities (simplified for Cloudflare runtime)
const JWT_SECRET = 'figmints-cmo-secret-key-change-in-production'; // In production, use env var

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Simple JWT implementation for Cloudflare
function generateToken(userId) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { userId, exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) }; // 7 days
  
  const encodedHeader = btoa(JSON.stringify(header)).replace(/[=]/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/[=]/g, '');
  
  // Create signature (simplified)
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`).replace(/[=]/g, '');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  try {
    const [header, payload, signature] = token.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check expiration
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return decodedPayload;
  } catch (error) {
    return null;
  }
}

// Authentication middleware
async function authenticate(request, env) {
  const authorization = request.headers.get('authorization');
  if (!authorization) {
    return { error: 'Authentication required', status: 401 };
  }
  
  const token = authorization.replace('Bearer ', '');
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return { error: 'Invalid token', status: 401 };
  }
  
  // Get user from D1 database
  const user = await env.DB.prepare(`
    SELECT u.*, c.name as client_name 
    FROM users u 
    LEFT JOIN clients c ON u.client_id = c.id 
    WHERE u.id = ? AND u.is_active = 1
  `).bind(decoded.userId).first();
  
  if (!user) {
    return { error: 'User not found or inactive', status: 401 };
  }
  
  return { user };
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/auth/', '');
  const method = request.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Route handling
    if (path === 'login' && method === 'POST') {
      const { email, password } = await request.json();

      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Get user from database
      const user = await env.DB.prepare(`
        SELECT u.*, c.name as client_name 
        FROM users u 
        LEFT JOIN clients c ON u.client_id = c.id 
        WHERE u.email = ? AND u.is_active = 1
      `).bind(email).first();

      if (!user) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Check password
      const isValidPassword = await comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Generate token
      const token = generateToken(user.id);

      // Update last login
      await env.DB.prepare('UPDATE users SET last_login = datetime("now") WHERE id = ?')
        .bind(user.id).run();

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

      return new Response(JSON.stringify({
        message: 'Login successful',
        token,
        user: userData
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get current user profile
    if (path === 'me' && method === 'GET') {
      const authResult = await authenticate(request, env);
      if (authResult.error) {
        return new Response(JSON.stringify({ error: authResult.error }), {
          status: authResult.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const userData = {
        id: authResult.user.id,
        email: authResult.user.email,
        role: authResult.user.role,
        client_id: authResult.user.client_id,
        client_name: authResult.user.client_name,
        first_name: authResult.user.first_name,
        last_name: authResult.user.last_name,
        last_login: authResult.user.last_login
      };

      return new Response(JSON.stringify({ user: userData }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Logout
    if (path === 'logout' && method === 'POST') {
      return new Response(JSON.stringify({ message: 'Logout successful' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Default response for unknown routes
    return new Response(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Auth API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}