import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  CalendarIcon, 
  UsersIcon, 
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../config/api';

const fetchClients = async () => {
  const response = await fetch(`${API_BASE_URL}/api/clients`);
  if (!response.ok) throw new Error('Failed to fetch clients');
  return response.json();
};

const fetchRecentMeetings = async () => {
  // For now, we'll fetch all meetings and sort them
  const clients = await fetchClients();
  const allMeetings = [];
  
  for (const client of clients) {
    const response = await fetch(`${API_BASE_URL}/api/clients/${client.id}/meetings`);
    if (response.ok) {
      const meetings = await response.json();
      allMeetings.push(...meetings.map(meeting => ({ ...meeting, clientName: client.name })));
    }
  }
  
  return allMeetings.sort((a, b) => new Date(b.meeting_date) - new Date(a.meeting_date)).slice(0, 5);
};

const fetchTodos = async () => {
  const clients = await fetchClients();
  const allTodos = [];
  
  for (const client of clients) {
    const response = await fetch(`${API_BASE_URL}/api/clients/${client.id}/todos`);
    if (response.ok) {
      const todos = await response.json();
      allTodos.push(...todos.map(todo => ({ ...todo, clientName: client.name })));
    }
  }
  
  return allTodos;
};

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
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

const Dashboard = () => {
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const { data: recentMeetings = [], isLoading: meetingsLoading } = useQuery({
    queryKey: ['recent-meetings'],
    queryFn: fetchRecentMeetings,
  });

  const { data: todos = [], isLoading: todosLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  const pendingTodos = todos.filter(todo => todo.status === 'pending');
  const completedTodos = todos.filter(todo => todo.status === 'complete');
  const overdueTodos = todos.filter(todo => {
    if (!todo.due_date) return false;
    return new Date(todo.due_date) < new Date() && todo.status !== 'complete';
  });

  const upcomingMeetings = recentMeetings.filter(meeting => {
    const meetingDate = new Date(meeting.meeting_date);
    const today = new Date();
    return meetingDate >= today;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your clients.
          </p>
        </div>
        <button className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
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
          value={pendingTodos.length}
          subtitle={`${overdueTodos.length} overdue`}
          icon={ClockIcon}
          color="yellow"
        />
        <StatCard
          title="Completed Todos"
          value={completedTodos.length}
          subtitle="This month"
          icon={CheckCircleIcon}
          color="green"
        />
        <StatCard
          title="Upcoming Meetings"
          value={upcomingMeetings.length}
          subtitle="Next 30 days"
          icon={CalendarIcon}
          color="blue"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Meetings */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Meetings</h2>
            </div>
            <div className="p-6">
              {meetingsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentMeetings.length > 0 ? (
                <div className="space-y-4">
                  {recentMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-figmints-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {meeting.clientName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {meeting.clientName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(meeting.meeting_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          meeting.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                          meeting.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                        }`}>
                          {meeting.status.replace('_', ' ')}
                        </span>
                        <Link 
                          to={`/meetings/${meeting.id}`}
                          className="p-1 text-gray-400 hover:text-figmints-primary transition-colors"
                        >
                          <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No recent meetings found
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Clients Overview */}
        <div>
          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Clients</h2>
            </div>
            <div className="p-6">
              {clientsLoading ? (
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
                    <Link
                      key={client.id}
                      to={`/clients/${client.id}`}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;