// Simple test component to verify React and TailwindCSS are working
function TestApp() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8">
        <h1 className="text-4xl font-bold text-figmints-primary mb-4">
          FIGMINTS CMO Test
        </h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            TailwindCSS Test
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            If you can see this styled content, TailwindCSS is working correctly!
          </p>
          <button className="btn-primary">
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestApp;