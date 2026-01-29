import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  CalendarIcon, 
  ChartBarIcon, 
  DocumentTextIcon,
  PlusIcon,
  ArrowLeftIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const fetchClient = async (clientId) => {
  const response = await fetch(`http://localhost:3456/api/clients/${clientId}`);
  if (!response.ok) throw new Error('Failed to fetch client');
  return response.json();
};

const fetchClientMeetings = async (clientId) => {
  const response = await fetch(`http://localhost:3456/api/clients/${clientId}/meetings`);
  if (!response.ok) throw new Error('Failed to fetch meetings');
  return response.json();
};

const fetchClientTodos = async (clientId) => {
  const response = await fetch(`http://localhost:3456/api/clients/${clientId}/todos`);
  if (!response.ok) throw new Error('Failed to fetch todos');
  return response.json();
};

const fetchScorecardItems = async (clientId) => {
  const response = await fetch(`http://localhost:3456/api/clients/${clientId}/scorecard-items`);
  if (!response.ok) throw new Error('Failed to fetch scorecard items');
  return response.json();
};

const InfoCard = ({ label, value, icon: Icon, href }) => {
  const content = (
    <div className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="p-2 bg-figmints-primary/10 rounded-lg">
        <Icon className="h-5 w-5 text-figmints-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-gray-900 dark:text-white truncate">{value || 'Not provided'}</p>
      </div>
    </div>
  );

  if (href && value) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
        {content}
      </a>
    );
  }

  return content;
};

const ScorecardMetric = ({ item }) => {
  const getStatus = () => {
    if (!item.current_value || !item.goal_min || !item.goal_max) return 'neutral';
    if (item.current_value >= item.goal_min && item.current_value <= item.goal_max) return 'good';
    if (item.current_value < item.goal_min) return 'below';
    return 'above';
  };

  const status = getStatus();
  const statusColors = {
    good: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    below: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
    above: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {status === 'good' ? 'On Track' : status === 'below' ? 'Below Goal' : status === 'above' ? 'Above Goal' : 'No Data'}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Current: {item.current_value || 'N/A'}</span>
          <span>Goal: {item.goal_min}-{item.goal_max}</span>
        </div>
        {item.goal_min && item.goal_max && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${status === 'good' ? 'bg-green-500' : status === 'below' ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{
                width: `${Math.min(100, Math.max(0, (item.current_value / item.goal_max) * 100))}%`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const ClientDetail = () => {
  const { clientId } = useParams();
  
  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => fetchClient(clientId),
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['client-meetings', clientId],
    queryFn: () => fetchClientMeetings(clientId),
    enabled: !!clientId,
  });

  const { data: todos = [] } = useQuery({
    queryKey: ['client-todos', clientId],
    queryFn: () => fetchClientTodos(clientId),
    enabled: !!clientId,
  });

  const { data: scorecardItems = [] } = useQuery({
    queryKey: ['scorecard-items', clientId],
    queryFn: () => fetchScorecardItems(clientId),
    enabled: !!clientId,
  });

  if (clientLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-figmints-primary"></div>
      </div>
    );
  }

  const pendingTodos = todos.filter(todo => todo.status === 'pending');
  const recentMeetings = meetings.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{client?.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Client Management Dashboard</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">Edit Client</button>
          <button className="btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            New Meeting
          </button>
        </div>
      </div>

      {/* Client Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoCard
          label="Website"
          value={client?.url}
          icon={GlobeAltIcon}
          href={client?.url}
        />
        <InfoCard
          label="Primary Contact"
          value={client?.client_contact}
          icon={EnvelopeIcon}
          href={client?.client_contact ? `mailto:${client.client_contact}` : null}
        />
        <InfoCard
          label="Account Manager"
          value={client?.account_manager}
          icon={UserIcon}
        />
        <InfoCard
          label="Strategist"
          value={client?.strategist}
          icon={UserIcon}
        />
        <InfoCard
          label="Meeting Schedule"
          value={client?.regular_meeting_date}
          icon={CalendarIcon}
        />
        <InfoCard
          label="Address"
          value={client?.address}
          icon={BuildingOfficeIcon}
        />
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scorecard Metrics */}
        <div className="card">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Scorecard Metrics</h2>
              <button className="text-figmints-primary hover:text-figmints-primary-dark text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {scorecardItems.length > 0 ? (
              <div className="space-y-4">
                {scorecardItems.slice(0, 4).map((item) => (
                  <ScorecardMetric key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No scorecard metrics configured
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          {/* Recent Meetings */}
          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Meetings</h2>
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              {recentMeetings.length > 0 ? (
                <div className="space-y-3">
                  {recentMeetings.map((meeting) => (
                    <Link
                      key={meeting.id}
                      to={`/meetings/${meeting.id}`}
                      className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(meeting.meeting_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {meeting.status.replace('_', ' ')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        meeting.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                        meeting.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                      }`}>
                        {meeting.status}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No meetings yet
                </p>
              )}
            </div>
          </div>

          {/* Pending Todos */}
          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Todos</h2>
                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              {pendingTodos.length > 0 ? (
                <div className="space-y-3">
                  {pendingTodos.slice(0, 4).map((todo) => (
                    <div key={todo.id} className="flex justify-between items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{todo.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            todo.assigned_to === 'us' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                            'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
                          }`}>
                            {todo.assigned_to === 'us' ? 'FIGMINTS' : 'Client'}
                          </span>
                          {todo.due_date && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Due {new Date(todo.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No pending todos
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;