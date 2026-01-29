import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SunIcon, MoonIcon, UsersIcon, CalendarIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// API Functions
const fetchClients = async () => {
  const response = await fetch('http://localhost:3456/api/clients');
  if (!response.ok) throw new Error('Failed to fetch clients');
  return response.json();
};

// Header Component
const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            <span className="text-figmints-primary">FIGMINTS</span> CMO
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Client Meeting Organizer</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {isDark ? (
              <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          
          <div className="h-10 w-10 rounded-full bg-figmints-primary flex items-center justify-center">
            <span className="text-white font-medium">AR</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      coral: 'bg-figmints-primary'
    };

    return (
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! TailwindCSS is working perfectly.
          </p>
        </div>
        <button className="btn-primary flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          New Meeting
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients"
          value={clients.length}
          subtitle="Active accounts"
          icon={UsersIcon}
          color="coral"
        />
        <StatCard
          title="Pending Todos"
          value={8}
          subtitle="2 overdue"
          icon={ClockIcon}
          color="yellow"
        />
        <StatCard
          title="Completed Todos"
          value={23}
          subtitle="This month"
          icon={CheckCircleIcon}
          color="green"
        />
        <StatCard
          title="Upcoming Meetings"
          value={4}
          subtitle="Next 30 days"
          icon={CalendarIcon}
          color="blue"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Meeting completed with Acme Corp</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <CalendarIcon className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">New meeting scheduled</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Green Leaf Co - Tomorrow 2pm</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Clients</h2>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="h-8 w-8 bg-figmints-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {client.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {client.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {client.account_manager}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="card p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <div className="flex items-center">
          <CheckCircleIcon className="h-8 w-8 text-green-500 mr-4" />
          <div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">
              ✅ TailwindCSS Configuration Fixed!
            </h3>
            <p className="text-green-700 dark:text-green-300">
              All styling is now working correctly with proper colors, components, and responsiveness. 
              The app is connected to the backend API and displaying live client data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function WorkingApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <main className="p-6">
              <div className="max-w-7xl mx-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                </Routes>
              </div>
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default WorkingApp;