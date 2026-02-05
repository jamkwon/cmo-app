// Cloudflare Function for Main API Routes (clients, meetings, todos, etc.)

// Simple JWT verification for Cloudflare
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

// Helper function to check client access
function hasClientAccess(user, clientId) {
  if (user.role === 'admin') return true;
  if (user.role === 'client' && user.client_id === parseInt(clientId)) return true;
  return false;
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathParts = url.pathname.replace('/api/', '').split('/');
  const method = request.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Authenticate all API requests
  const authResult = await authenticate(request, env);
  if (authResult.error) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: authResult.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const user = authResult.user;

  try {
    // Health check
    if (pathParts[0] === 'health' && method === 'GET') {
      return new Response(JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Clients endpoints
    if (pathParts[0] === 'clients') {
      // GET /api/clients
      if (method === 'GET' && pathParts.length === 1) {
        let clients;
        
        if (user.role === 'admin') {
          clients = await env.DB.prepare('SELECT * FROM clients ORDER BY name').all();
        } else {
          clients = await env.DB.prepare('SELECT * FROM clients WHERE id = ? ORDER BY name')
            .bind(user.client_id).all();
        }
        
        return new Response(JSON.stringify(clients.results || []), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // GET /api/clients/:id
      if (method === 'GET' && pathParts.length === 2) {
        const clientId = pathParts[1];
        
        if (!hasClientAccess(user, clientId)) {
          return new Response(JSON.stringify({ error: 'Access denied' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        const client = await env.DB.prepare('SELECT * FROM clients WHERE id = ?')
          .bind(clientId).first();
          
        if (!client) {
          return new Response(JSON.stringify({ error: 'Client not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        return new Response(JSON.stringify(client), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // GET /api/clients/:clientId/meetings
      if (method === 'GET' && pathParts.length === 3 && pathParts[2] === 'meetings') {
        const clientId = pathParts[1];
        
        if (!hasClientAccess(user, clientId)) {
          return new Response(JSON.stringify({ error: 'Access denied' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        const meetings = await env.DB.prepare(
          'SELECT * FROM meetings WHERE client_id = ? ORDER BY meeting_date DESC'
        ).bind(clientId).all();
        
        return new Response(JSON.stringify(meetings.results || []), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // POST /api/clients/:clientId/meetings
      if (method === 'POST' && pathParts.length === 3 && pathParts[2] === 'meetings') {
        const clientId = pathParts[1];
        const { meeting_date, status, notes } = await request.json();
        
        if (!hasClientAccess(user, clientId)) {
          return new Response(JSON.stringify({ error: 'Access denied' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        const result = await env.DB.prepare(`
          INSERT INTO meetings (client_id, meeting_date, status, notes)
          VALUES (?, ?, ?, ?)
        `).bind(clientId, meeting_date, status || 'draft', notes).run();
        
        const meeting = await env.DB.prepare('SELECT * FROM meetings WHERE id = ?')
          .bind(result.meta.last_row_id).first();
          
        return new Response(JSON.stringify(meeting), {
          status: 201,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // GET /api/clients/:clientId/todos
      if (method === 'GET' && pathParts.length === 3 && pathParts[2] === 'todos') {
        const clientId = pathParts[1];
        
        if (!hasClientAccess(user, clientId)) {
          return new Response(JSON.stringify({ error: 'Access denied' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        const todos = await env.DB.prepare(
          'SELECT * FROM todos WHERE client_id = ? ORDER BY created_at DESC'
        ).bind(clientId).all();
        
        return new Response(JSON.stringify(todos.results || []), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // Meetings endpoints
    if (pathParts[0] === 'meetings') {
      // GET /api/meetings/:id
      if (method === 'GET' && pathParts.length === 2) {
        const meetingId = pathParts[1];
        
        const meeting = await env.DB.prepare('SELECT * FROM meetings WHERE id = ?')
          .bind(meetingId).first();
          
        if (!meeting) {
          return new Response(JSON.stringify({ error: 'Meeting not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        if (!hasClientAccess(user, meeting.client_id)) {
          return new Response(JSON.stringify({ error: 'Access denied' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        return new Response(JSON.stringify(meeting), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // POST /api/meetings/session - Get or create meeting session
      if (method === 'POST' && pathParts[1] === 'session') {
        const { client_id, meeting_date } = await request.json();
        
        if (!hasClientAccess(user, client_id)) {
          return new Response(JSON.stringify({ error: 'Access denied' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        
        // Try to find existing meeting
        let meeting = await env.DB.prepare(
          'SELECT * FROM meetings WHERE client_id = ? AND meeting_date = ?'
        ).bind(client_id, meeting_date).first();
        
        if (!meeting) {
          // Create new meeting session
          const result = await env.DB.prepare(`
            INSERT INTO meetings (client_id, meeting_date, status)
            VALUES (?, ?, 'in_progress')
          `).bind(client_id, meeting_date).run();
          
          meeting = await env.DB.prepare('SELECT * FROM meetings WHERE id = ?')
            .bind(result.meta.last_row_id).first();
        }
        
        return new Response(JSON.stringify(meeting), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // Default response for unknown routes
    return new Response(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}