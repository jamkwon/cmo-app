// Temporarily simplified layout to isolate the issue
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Simplified header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          <span className="text-figmints-primary">FIGMINTS</span> CMO
        </h1>
      </header>
      
      {/* Main content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;