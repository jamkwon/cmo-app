import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  DocumentTextIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../config/api';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Clients', href: '/clients', icon: UsersIcon },
  { name: 'Meetings', href: '/meetings', icon: CalendarIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Templates', href: '/templates', icon: DocumentTextIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

const fetchClients = async () => {
  const response = await fetch(`${API_BASE_URL}/api/clients`);
  if (!response.ok) {
    throw new Error('Failed to fetch clients');
  }
  return response.json();
};

const Sidebar = () => {
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-figmints-primary rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">CMO</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-figmints-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Quick Client Access */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Quick Access
        </h3>
        <div className="space-y-1">
          {clients.slice(0, 3).map((client) => (
            <NavLink
              key={client.id}
              to={`/clients/${client.id}`}
              className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {client.name.charAt(0)}
                </span>
              </div>
              <span className="truncate">{client.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 FIGMINTS
        </p>
      </div>
    </div>
  );
};

export default Sidebar;