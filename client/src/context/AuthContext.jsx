import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from cookies
  useEffect(() => {
    const savedToken = Cookies.get('auth_token');
    const savedUser = Cookies.get('auth_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user in state and cookies
      setToken(data.token);
      setUser(data.user);
      
      // Set cookies (expires in 7 days to match JWT)
      Cookies.set('auth_token', data.token, { expires: 7, secure: true, sameSite: 'strict' });
      Cookies.set('auth_user', JSON.stringify(data.user), { expires: 7, secure: true, sameSite: 'strict' });

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if we have a token
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and cookies regardless of API call success
      setToken(null);
      setUser(null);
      Cookies.remove('auth_token');
      Cookies.remove('auth_user');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    Cookies.set('auth_user', JSON.stringify(updatedUser), { expires: 7, secure: true, sameSite: 'strict' });
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password change failed');
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        updateUser(data.user);
        return data.user;
      } else {
        throw new Error('Failed to refresh profile');
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
      // If token is invalid, logout
      if (error.status === 401) {
        logout();
      }
      throw error;
    }
  };

  // Helper function to check if user is admin
  const isAdmin = () => user?.role === 'admin';
  
  // Helper function to check if user is client
  const isClient = () => user?.role === 'client';

  // Helper function to get auth header
  const getAuthHeader = () => token ? { 'Authorization': `Bearer ${token}` } : {};

  // API helper function with auth
  const apiCall = async (url, options = {}) => {
    const authHeaders = getAuthHeader();
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expired or invalid
      logout();
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    changePassword,
    refreshProfile,
    isAdmin,
    isClient,
    getAuthHeader,
    apiCall,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};