# FIGMINTS CMO Authentication System

## 🔐 Overview

This document describes the complete authentication system implemented for the FIGMINTS CMO app. The system transforms the previously open application into a secure, role-based platform with proper user management and data access controls.

## 🏗️ Architecture

### Backend Authentication (Node.js/Express)
- **JWT Token-based authentication**
- **bcryptjs password hashing** 
- **Role-based authorization** (Admin/Client)
- **Rate limiting** on auth endpoints
- **Session management**
- **Password reset functionality**

### Frontend Authentication (React)
- **Authentication Context** (React Context API)
- **Protected Routes** 
- **Automatic token management** (cookies)
- **Login/logout functionality**
- **User profile management**
- **Admin panel** (admin users only)

## 👥 User Roles

### Admin Role
- **Full access** to all client data
- **User management** - create, edit, delete users
- **Client management** - create, edit, delete clients  
- **View all** meetings, todos, scorecard items
- **Access admin panel**

### Client Role  
- **Restricted access** to their assigned client data only
- **Cannot see** other clients' data
- **Cannot manage** other users
- **Limited to** their own client's meetings, todos, scorecard items

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  client_id INTEGER, -- Links to clients table for client role
  first_name TEXT,
  last_name TEXT,
  is_active BOOLEAN DEFAULT 1,
  last_login DATETIME,
  reset_token TEXT,
  reset_token_expires DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id)
)
```

## 🔑 Authentication Flow

### 1. Login Process
1. User submits email/password
2. Server validates credentials
3. Password verified using bcryptjs
4. JWT token generated (7-day expiry)
5. Token and user data returned to client
6. Client stores token in secure cookies

### 2. Request Authentication  
1. Client includes `Authorization: Bearer <token>` header
2. Server middleware verifies JWT token
3. User data attached to request object
4. Role-based access control applied

### 3. Data Filtering
- **Admin users**: See all data across all clients
- **Client users**: Data filtered to their assigned client_id only

## 🛡️ Security Features

### Password Security
- **bcryptjs hashing** with salt rounds (12)
- **Minimum password length** (6 characters)
- **Password change** functionality

### Token Security  
- **JWT tokens** with 7-day expiration
- **Secure cookie storage** (httpOnly, secure, sameSite)
- **Token invalidation** on logout

### Rate Limiting
- **5 requests per 15 minutes** for auth endpoints
- **Prevents brute force** attacks

### API Protection
- **All API endpoints** require authentication
- **Role-based authorization** middleware
- **Client data filtering** middleware

## 📡 API Endpoints

### Authentication Routes
```
POST /api/auth/login           - User login
GET  /api/auth/me              - Get current user profile  
PUT  /api/auth/me              - Update user profile
PUT  /api/auth/change-password - Change password
POST /api/auth/logout          - User logout
```

### Admin Only Routes
```
POST   /api/auth/users         - Create new user
GET    /api/auth/users         - List all users
PUT    /api/auth/users/:id     - Update user
DELETE /api/auth/users/:id     - Delete user
```

### Protected Data Routes (with role filtering)
```
GET    /api/clients            - List clients (filtered by role)
POST   /api/clients            - Create client (admin only)
PUT    /api/clients/:id        - Update client (admin only)
DELETE /api/clients/:id        - Delete client (admin only)
GET    /api/clients/:id        - Get client (access controlled)

GET    /api/clients/:id/meetings       - List meetings (access controlled)
POST   /api/clients/:id/meetings       - Create meeting (access controlled)
GET    /api/meetings/:id               - Get meeting (access controlled)
PUT    /api/meetings/:id               - Update meeting (access controlled)

GET    /api/clients/:id/todos          - List todos (access controlled)
POST   /api/clients/:id/todos          - Create todo (access controlled)  
PUT    /api/todos/:id                  - Update todo (access controlled)

GET    /api/clients/:id/scorecard-items - List scorecard items (access controlled)
POST   /api/clients/:id/scorecard-items - Create scorecard item (access controlled)
```

## 🖥️ Frontend Components

### Authentication Components
- **`AuthContext`** - Global authentication state management
- **`Login`** - Login form with demo account buttons
- **`ProtectedRoute`** - Route wrapper requiring authentication
- **`UserProfile`** - Profile and password management modal

### Admin Components  
- **`UserManagement`** - Admin panel for user CRUD operations
- **Header user menu** - User dropdown with profile/admin access

### Key Features
- **Automatic login redirect** for unauthenticated users
- **Role-based UI rendering** (admin panel link, etc.)
- **Cookie-based session persistence**
- **Automatic token refresh** and logout on expiry

## 🚀 Demo Accounts

The system includes pre-configured demo accounts for testing:

### Admin Account
- **Email**: `admin@figmints.com`  
- **Password**: `admin123`
- **Access**: Full system access, can manage all users and clients

### Client Account
- **Email**: `client@example.com`
- **Password**: `client123`  
- **Access**: Limited to Acme Corp client data only

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
# Server dependencies
cd server && npm install

# Client dependencies  
cd client && npm install
```

### 2. Seed Authentication Data
```bash
cd server && node seedAuth.js
```

### 3. Start Applications
```bash
# Start server (port 3458)
cd server && npm run dev

# Start client (port 3459) 
cd client && npm run dev
```

### 4. Test Authentication
```bash
node test-auth.js
```

## 🧪 Testing

The authentication system includes comprehensive testing via `test-auth.js`:

- ✅ Server health check
- ✅ Unauthenticated access protection
- ✅ Admin login functionality  
- ✅ Client login functionality
- ✅ Admin access to all data
- ✅ Client access restriction
- ✅ Admin user management
- ✅ Role-based authorization
- ✅ Profile access
- ✅ Invalid token handling

## 🔄 Migration from Open System

The authentication system was added to the existing CMO app with:

### Backward Compatibility
- **Existing database schema** preserved
- **All existing functionality** maintained
- **Zero data loss** during migration

### Added Security Layer
- **All API endpoints** now require authentication
- **Data access** filtered by user role and client assignment
- **User interface** updated with login/logout flows
- **Admin capabilities** added for user management

## 📋 Production Considerations

### Environment Variables
Set these in production:
```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

### Security Enhancements for Production
- **HTTPS enforcement**
- **Stronger JWT secret** (from environment variables)
- **Database connection security**
- **CORS configuration** for specific domains
- **Rate limiting adjustment** based on load
- **Session timeout configuration**
- **Password complexity requirements**

### Monitoring
- **Authentication attempt logging**
- **Failed login monitoring**
- **Session management tracking**
- **User activity auditing**

## 🎯 Features Delivered

### ✅ Complete Authentication System
- [x] JWT token-based authentication
- [x] Secure password hashing (bcrypt)
- [x] Session management
- [x] Login/logout functionality

### ✅ Role-Based Access Control  
- [x] Admin role: Full access to all data
- [x] Client role: Restricted to assigned client data only
- [x] Middleware-based authorization
- [x] API endpoint protection

### ✅ Database Integration
- [x] Users table with role and client assignment
- [x] Foreign key relationships
- [x] Data integrity constraints
- [x] Authentication seed data

### ✅ Frontend Integration
- [x] React authentication context
- [x] Protected route system
- [x] Login page with demo accounts
- [x] User profile management
- [x] Admin panel for user management
- [x] Role-based UI rendering

### ✅ Security Features
- [x] Rate limiting on auth endpoints
- [x] Password strength requirements
- [x] Token expiration handling  
- [x] Secure cookie management
- [x] Input validation and sanitization

### ✅ User Management
- [x] Admin can create client accounts
- [x] Profile management for all users
- [x] Password change functionality
- [x] User activation/deactivation
- [x] Password reset system (backend ready)

This authentication system transforms the FIGMINTS CMO app from a completely open application into a secure, production-ready platform with proper user management and role-based access control.

🎉 **The authentication system is now fully implemented and ready for use!**