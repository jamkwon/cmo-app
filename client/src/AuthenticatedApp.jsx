import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import ClientDetail from './pages/ClientDetail';
import MeetingView from './pages/MeetingView';
import UserManagement from './components/admin/UserManagement';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error) => {
        // Don't retry on 401 (authentication errors)
        if (error?.status === 401) return false;
        return failureCount < 2;
      },
    },
  },
});

const AppRoutes = () => {
  const { user, getAuthHeader } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/clients/:id" element={<ClientDetail />} />
      <Route path="/meetings/:id" element={<MeetingView />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <UserManagement />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <AppRoutes />
        </div>
      </main>
    </div>
  );
};

function AuthenticatedApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default AuthenticatedApp;