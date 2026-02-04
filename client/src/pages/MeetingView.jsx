import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
  ChartBarIcon,
  ListBulletIcon,
  LightBulbIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import TodoManager from '../components/meeting/TodoManager';
import ScorecardManager from '../components/meeting/ScorecardManager';
import { API_BASE_URL } from '../config/api';

const fetchMeeting = async (meetingId) => {
  const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}`);
  if (!response.ok) throw new Error('Failed to fetch meeting');
  return response.json();
};

const fetchClient = async (clientId) => {
  const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}`);
  if (!response.ok) throw new Error('Failed to fetch client');
  return response.json();
};

const fetchBigWins = async (meetingId) => {
  const response = await fetch(`http://localhost:3456/api/meetings/${meetingId}/wins`);
  if (!response.ok) throw new Error('Failed to fetch big wins');
  return response.json();
};

const addBigWin = async ({ meetingId, title, description }) => {
  const response = await fetch(`http://localhost:3456/api/meetings/${meetingId}/wins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  });
  if (!response.ok) throw new Error('Failed to add big win');
  return response.json();
};

const BigWinCard = ({ win }) => (
  <div className="card p-4">
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
        <TrophyIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 dark:text-white">{win.title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{win.description}</p>
      </div>
    </div>
  </div>
);

const AddBigWinForm = ({ meetingId, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addBigWin,
    onSuccess: () => {
      queryClient.invalidateQueries(['big-wins', meetingId]);
      onClose();
      setTitle('');
      setDescription('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      mutation.mutate({ meetingId, title, description });
    }
  };

  return (
    <div className="card p-4">
      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Add Big Win</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Win title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          required
        />
        <textarea
          placeholder="Description (optional)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input resize-none"
          rows={2}
        />
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary"
          >
            {mutation.isPending ? 'Adding...' : 'Add Win'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const MeetingSection = ({ title, icon: Icon, children, badge, onAdd, addLabel = "Add" }) => (
  <div className="card">
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-figmints-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-figmints-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            {badge && (
              <span className="text-sm text-gray-600 dark:text-gray-400">{badge}</span>
            )}
          </div>
        </div>
        {onAdd && (
          <button onClick={onAdd} className="btn-primary flex items-center text-sm">
            <PlusIcon className="h-4 w-4 mr-1" />
            {addLabel}
          </button>
        )}
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const MeetingView = () => {
  const { meetingId } = useParams();
  const [showAddWin, setShowAddWin] = useState(false);
  
  const { data: meeting, isLoading: meetingLoading } = useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: () => fetchMeeting(meetingId),
  });

  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ['client', meeting?.client_id],
    queryFn: () => fetchClient(meeting?.client_id),
    enabled: !!meeting?.client_id,
  });

  const { data: bigWins = [] } = useQuery({
    queryKey: ['big-wins', meetingId],
    queryFn: () => fetchBigWins(meetingId),
    enabled: !!meetingId,
  });

  if (meetingLoading || clientLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-figmints-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to={`/clients/${client?.id}`}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {client?.name} Meeting
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {meeting?.meeting_date && new Date(meeting.meeting_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} • EOS L10 Format
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            meeting?.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
            meeting?.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
          }`}>
            {meeting?.status?.replace('_', ' ').toUpperCase()}
          </span>
          <button className="btn-secondary">Export PDF</button>
          <button className="btn-primary">Save & Close</button>
        </div>
      </div>

      {/* Meeting Sections */}
      <div className="space-y-8">
        {/* 1. Big Wins / Headlines */}
        <MeetingSection
          title="Big Wins & Headlines"
          icon={TrophyIcon}
          badge="Celebrate your successes"
          onAdd={() => setShowAddWin(true)}
          addLabel="Add Win"
        >
          <div className="space-y-4">
            {showAddWin && (
              <AddBigWinForm 
                meetingId={meetingId} 
                onClose={() => setShowAddWin(false)} 
              />
            )}
            {bigWins.length > 0 ? (
              bigWins.map((win) => <BigWinCard key={win.id} win={win} />)
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No big wins added yet. Start by celebrating your recent successes!
              </p>
            )}
          </div>
        </MeetingSection>

        {/* 2. Scorecard Review */}
        <MeetingSection
          title="Scorecard Review"
          icon={ChartBarIcon}
          badge="Track your key metrics"
        >
          <ScorecardManager clientId={client?.id} />
        </MeetingSection>

        {/* 3. Previous Todos Review */}
        <MeetingSection
          title="Previous Todos Review"
          icon={CheckCircleIcon}
          badge="Review carryover tasks"
        >
          <TodoManager 
            clientId={client?.id} 
            meetingId={meetingId} 
            title="Previous Todos"
            showPrevious={true}
          />
        </MeetingSection>

        {/* 4. Baseline Updates */}
        <MeetingSection
          title="Baseline Updates"
          icon={ListBulletIcon}
          badge="Newsletter, SEO, Paid Ads status"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Newsletter', 'SEO', 'Paid Ads'].map((category) => (
              <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{category}</h4>
                <select className="input text-sm">
                  <option value="">Select status...</option>
                  <option value="on_track">On Track</option>
                  <option value="off_track">Off Track</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
            ))}
          </div>
        </MeetingSection>

        {/* 5. Campaign Updates */}
        <MeetingSection
          title="Campaign Updates"
          icon={CalendarIcon}
          badge="Quarterly campaign progress"
        >
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Campaign progress will be displayed here.</p>
          </div>
        </MeetingSection>

        {/* 6. IDS (Issues, Discussions, Solve) */}
        <MeetingSection
          title="IDS - Issues, Discuss, Solve"
          icon={LightBulbIcon}
          badge="Identify and solve problems"
          onAdd={() => {}}
          addLabel="Add Item"
        >
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <LightBulbIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>IDS items will be managed here.</p>
          </div>
        </MeetingSection>

        {/* 7. New Todos */}
        <MeetingSection
          title="New Todos"
          icon={PlusIcon}
          badge="Action items from this meeting"
        >
          <TodoManager 
            clientId={client?.id} 
            meetingId={meetingId} 
            title="Meeting Todos"
            showPrevious={false}
          />
        </MeetingSection>

        {/* 8. Meeting Score */}
        <MeetingSection
          title="Meeting Score"
          icon={StarIcon}
          badge="Rate this meeting (1-10)"
        >
          <div className="flex items-center justify-center space-x-4">
            <span className="text-gray-700 dark:text-gray-300 font-medium">How did this meeting go?</span>
            <div className="flex space-x-2">
              {[...Array(10)].map((_, i) => (
                <button
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-figmints-primary hover:text-figmints-primary transition-colors flex items-center justify-center font-medium"
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </MeetingSection>
      </div>
    </div>
  );
};

export default MeetingView;