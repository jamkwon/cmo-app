import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';

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
          {/* Search Bar */}
          <div className="hidden md:block">
            <input
              type="text"
              placeholder="Search clients, meetings..."
              className="input w-64"
            />
          </div>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          
          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Alex Rivera</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Account Manager</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-figmints-primary flex items-center justify-center">
              <span className="text-white font-medium">AR</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;