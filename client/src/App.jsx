import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Simple test component for the full app structure
const TestDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              <span className="text-figmints-primary">FIGMINTS</span> CMO Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              TailwindCSS is now working correctly!
            </p>
          </div>
          <button className="btn-primary">
            Test Button
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Clients</h3>
            <p className="text-3xl font-bold text-figmints-primary">3</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Meetings</h3>
            <p className="text-3xl font-bold text-blue-500">5</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Todos</h3>
            <p className="text-3xl font-bold text-yellow-500">12</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-500">45</p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Status</h2>
          <p className="text-green-600 font-medium">
            ✅ TailwindCSS configuration has been fixed and is working correctly!
          </p>
          <p className="text-gray-600 mt-2">
            The styling system is now fully functional with proper colors, spacing, and components.
          </p>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<TestDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;