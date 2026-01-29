import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Simple test dashboard component
const SimpleDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          <span className="text-figmints-primary">FIGMINTS</span> CMO Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Clients</h3>
            <p className="text-3xl font-bold text-figmints-primary">3</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Active Meetings</h3>
            <p className="text-3xl font-bold text-blue-500">5</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pending Todos</h3>
            <p className="text-3xl font-bold text-yellow-500">12</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-500">45</p>
          </div>
        </div>
        
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to the FIGMINTS CMO application. The TailwindCSS styling is now working correctly!
          </p>
          <div className="mt-4 space-x-4">
            <button className="btn-primary">Primary Action</button>
            <button className="btn-secondary">Secondary Action</button>
          </div>
        </div>
      </div>
    </div>
  );
};

function SimpleApp() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<SimpleDashboard />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default SimpleApp;