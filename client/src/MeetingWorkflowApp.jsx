import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ChatBubbleLeftRightIcon, 
  CheckCircleIcon, 
  RocketLaunchIcon,
  LightBulbIcon,
  CalendarDaysIcon,
  ListBulletIcon,
  StarIcon,
  ArrowPathIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import ClientSelection from './components/ClientSelection';

const API_BASE_URL = window.location.origin;

// Main Meeting Workflow App - Complete rebuild for client meeting workflow
const MeetingWorkflowApp = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('bigwins');
  const [meetingData, setMeetingData] = useState({
    bigWins: '',
    scorecard: [],
    todoRecap: [],
    campaigns: [],
    ids: {
      identify: '',
      discuss: '',
      solve: ''
    },
    headlines: {
      nextMeetingDate: '',
      teamUpdates: ''
    },
    newTodos: [],
    meetingScore: 0
  });
  
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [clientId, setClientId] = useState(1); // Default to client 1 for demo
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  
  // Initialize meeting session on load
  useEffect(() => {
    initializeMeetingSession();
  }, []);
  
  // Auto-save every 30 seconds
  useEffect(() => {
    if (currentMeeting) {
      const interval = setInterval(() => {
        saveAllData(true); // Silent save
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [currentMeeting, meetingData]);
  
  // API Functions
  const initializeMeetingSession = async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch(`${API_BASE_URL}/api/meetings/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          client_id: clientId,
          meeting_date: today
        })
      });
      
      if (response.ok) {
        const meeting = await response.json();
        setCurrentMeeting(meeting);
        await loadMeetingData(meeting.id);
      } else {
        console.error('Failed to initialize meeting session');
      }
    } catch (error) {
      console.error('Error initializing meeting:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadMeetingData = async (meetingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/data`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMeetingData({
          bigWins: data.bigWins || '',
          scorecard: data.scorecard || [],
          todoRecap: data.todoRecap || [],
          campaigns: data.campaigns || [],
          ids: data.ids || { identify: '', discuss: '', solve: '' },
          headlines: {
            nextMeetingDate: '',
            teamUpdates: ''
          },
          newTodos: data.newTodos || [],
          meetingScore: data.meetingScore || 0
        });
      }
    } catch (error) {
      console.error('Error loading meeting data:', error);
    }
  };
  
  const saveAllData = async (silent = false) => {
    if (!currentMeeting) return;
    
    try {
      if (!silent) {
        setIsLoading(true);
        setSaveStatus('Saving...');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/meetings/${currentMeeting.id}/data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(meetingData)
      });
      
      if (response.ok) {
        if (!silent) {
          setSaveStatus('Saved ✓');
          setTimeout(() => setSaveStatus(''), 2000);
        }
      } else {
        setSaveStatus('Save failed');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setSaveStatus('Save failed');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'bigwins', name: 'Big Wins', icon: StarIcon, color: 'text-yellow-600' },
    { id: 'scorecard', name: 'Scorecard', icon: ChartBarIcon, color: 'text-blue-600' },
    { id: 'todorecap', name: 'To-do Recap', icon: CheckCircleIcon, color: 'text-green-600' },
    { id: 'campaigns', name: 'Campaign Progress', icon: RocketLaunchIcon, color: 'text-purple-600' },
    { id: 'ids', name: 'IDS', icon: LightBulbIcon, color: 'text-orange-600' },
    { id: 'headlines', name: 'Headlines/Admin', icon: CalendarDaysIcon, color: 'text-indigo-600' },
    { id: 'newtodos', name: 'New To-dos', icon: ListBulletIcon, color: 'text-red-600' },
    { id: 'score', name: 'Meeting Score', icon: ChatBubbleLeftRightIcon, color: 'text-pink-600' }
  ];

  // Component for Big Wins Section
  const BigWinsSection = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Big Wins</h2>
      <p className="text-gray-600">Capture client wins from the past period</p>
      <textarea
        value={meetingData.bigWins}
        onChange={(e) => setMeetingData({...meetingData, bigWins: e.target.value})}
        placeholder="What big wins has the client achieved since our last meeting?"
        className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
      <div className="text-sm text-gray-500">
        Example: "Launched new product line", "Hit quarterly revenue goal", "Hired key team member"
      </div>
    </div>
  );

  // Component for Scorecard Section
  const ScorecardSection = () => {
    const [newMetric, setNewMetric] = useState({ name: '', goal: '', current: '', previous: '' });

    const addMetric = () => {
      if (newMetric.name && newMetric.goal && newMetric.current) {
        setMeetingData({
          ...meetingData, 
          scorecard: [...meetingData.scorecard, { ...newMetric, id: Date.now(), trend: calculateTrend(newMetric.current, newMetric.previous) }]
        });
        setNewMetric({ name: '', goal: '', current: '', previous: '' });
      }
    };

    const calculateTrend = (current, previous) => {
      if (!previous || !current) return 'neutral';
      const curr = parseFloat(current);
      const prev = parseFloat(previous);
      if (curr > prev) return 'up';
      if (curr < prev) return 'down';
      return 'neutral';
    };

    const getTrendIcon = (trend) => {
      if (trend === 'up') return '↗️';
      if (trend === 'down') return '↘️';
      return '→';
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Scorecard</h2>
        <p className="text-gray-600">Track key metrics: Goals vs Current vs Previous</p>
        
        {/* Add new metric form */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Add New Metric</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Metric name"
              value={newMetric.name}
              onChange={(e) => setNewMetric({...newMetric, name: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Goal"
              value={newMetric.goal}
              onChange={(e) => setNewMetric({...newMetric, goal: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Current"
              value={newMetric.current}
              onChange={(e) => setNewMetric({...newMetric, current: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Previous"
              value={newMetric.previous}
              onChange={(e) => setNewMetric({...newMetric, previous: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <button 
            onClick={addMetric}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Metric
          </button>
        </div>

        {/* Scorecard table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-left">Metric</th>
                <th className="border border-gray-300 p-3 text-center">Goal</th>
                <th className="border border-gray-300 p-3 text-center">Current</th>
                <th className="border border-gray-300 p-3 text-center">Previous</th>
                <th className="border border-gray-300 p-3 text-center">Trend</th>
                <th className="border border-gray-300 p-3 text-center">Progress</th>
              </tr>
            </thead>
            <tbody>
              {meetingData.scorecard.map((metric) => {
                const progress = metric.goal > 0 ? ((metric.current / metric.goal) * 100).toFixed(1) : 0;
                return (
                  <tr key={metric.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium">{metric.name}</td>
                    <td className="border border-gray-300 p-3 text-center">{metric.goal}</td>
                    <td className="border border-gray-300 p-3 text-center font-bold">{metric.current}</td>
                    <td className="border border-gray-300 p-3 text-center">{metric.previous || '-'}</td>
                    <td className="border border-gray-300 p-3 text-center text-xl">{getTrendIcon(metric.trend)}</td>
                    <td className="border border-gray-300 p-3 text-center">
                      <span className={`font-bold ${progress >= 100 ? 'text-green-600' : progress >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {progress}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {meetingData.scorecard.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No metrics added yet. Add your first metric above.
            </div>
          )}
        </div>
      </div>
    );
  };

  // Component for To-do Recap Section
  const TodoRecapSection = () => {
    const [newTodo, setNewTodo] = useState({ item: '', status: 'progress', notes: '' });

    const addTodoItem = () => {
      if (newTodo.item) {
        setMeetingData({
          ...meetingData, 
          todoRecap: [...meetingData.todoRecap, { ...newTodo, id: Date.now() }]
        });
        setNewTodo({ item: '', status: 'progress', notes: '' });
      }
    };

    const getStatusColor = (status) => {
      switch(status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'progress': return 'bg-yellow-100 text-yellow-800';
        case 'hold': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">To-do Recap</h2>
        <p className="text-gray-600">Review previous to-dos and update their status</p>
        
        {/* Add todo form */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Add Previous To-do Item</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="To-do item description"
              value={newTodo.item}
              onChange={(e) => setNewTodo({...newTodo, item: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <select
              value={newTodo.status}
              onChange={(e) => setNewTodo({...newTodo, status: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="completed">✅ Completed</option>
              <option value="progress">🔄 In Progress</option>
              <option value="hold">⏸️ On Hold</option>
            </select>
            <textarea
              placeholder="Status notes or updates"
              value={newTodo.notes}
              onChange={(e) => setNewTodo({...newTodo, notes: e.target.value})}
              className="w-full h-20 border border-gray-300 rounded px-3 py-2 resize-none"
            />
          </div>
          <button 
            onClick={addTodoItem}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add To-do Item
          </button>
        </div>

        {/* Todo list */}
        <div className="space-y-3">
          {meetingData.todoRecap.map((todo) => (
            <div key={todo.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{todo.item}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(todo.status)}`}>
                  {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
                </span>
              </div>
              {todo.notes && (
                <div className="text-gray-600 text-sm mt-2">{todo.notes}</div>
              )}
            </div>
          ))}
          {meetingData.todoRecap.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No previous to-dos added yet.
            </div>
          )}
        </div>
      </div>
    );
  };

  // Component for Campaign Progress Section
  const CampaignSection = () => {
    const [newCampaign, setNewCampaign] = useState({ name: '', status: '', progress: '', notes: '' });

    const addCampaign = () => {
      if (newCampaign.name && newCampaign.status) {
        setMeetingData({
          ...meetingData, 
          campaigns: [...meetingData.campaigns, { ...newCampaign, id: Date.now() }]
        });
        setNewCampaign({ name: '', status: '', progress: '', notes: '' });
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Campaign Progress</h2>
        <p className="text-gray-600">Track existing campaigns and their current status</p>
        
        {/* Add campaign form */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Add Campaign</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Campaign name"
              value={newCampaign.name}
              onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2"
            />
            <select
              value={newCampaign.status}
              onChange={(e) => setNewCampaign({...newCampaign, status: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Select status</option>
              <option value="planning">📋 Planning</option>
              <option value="active">🚀 Active</option>
              <option value="paused">⏸️ Paused</option>
              <option value="completed">✅ Completed</option>
            </select>
            <input
              type="text"
              placeholder="Progress update"
              value={newCampaign.progress}
              onChange={(e) => setNewCampaign({...newCampaign, progress: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2"
            />
            <textarea
              placeholder="Campaign notes"
              value={newCampaign.notes}
              onChange={(e) => setNewCampaign({...newCampaign, notes: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <button 
            onClick={addCampaign}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Add Campaign
          </button>
        </div>

        {/* Campaign list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetingData.campaigns.map((campaign) => (
            <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{campaign.name}</h3>
                <span className="text-sm">{campaign.status}</span>
              </div>
              <div className="text-gray-600 text-sm mb-2">{campaign.progress}</div>
              {campaign.notes && (
                <div className="text-gray-500 text-xs">{campaign.notes}</div>
              )}
            </div>
          ))}
          {meetingData.campaigns.length === 0 && (
            <div className="text-center py-8 text-gray-500 col-span-2">
              No campaigns added yet.
            </div>
          )}
        </div>
      </div>
    );
  };

  // Component for IDS Section (Identify, Discuss, Solve)
  const IDSSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">IDS - Identify, Discuss, Solve</h2>
      <p className="text-gray-600">Work through issues, strategy, and questions systematically</p>
      
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-lg font-medium mb-3 text-red-600">🔍 Identify</label>
          <textarea
            value={meetingData.ids.identify}
            onChange={(e) => setMeetingData({
              ...meetingData, 
              ids: {...meetingData.ids, identify: e.target.value}
            })}
            placeholder="What issues, opportunities, or questions need attention?"
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          />
        </div>
        
        <div>
          <label className="block text-lg font-medium mb-3 text-blue-600">💬 Discuss</label>
          <textarea
            value={meetingData.ids.discuss}
            onChange={(e) => setMeetingData({
              ...meetingData, 
              ids: {...meetingData.ids, discuss: e.target.value}
            })}
            placeholder="What are the different perspectives, options, and considerations?"
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
        
        <div>
          <label className="block text-lg font-medium mb-3 text-green-600">✅ Solve</label>
          <textarea
            value={meetingData.ids.solve}
            onChange={(e) => setMeetingData({
              ...meetingData, 
              ids: {...meetingData.ids, solve: e.target.value}
            })}
            placeholder="What are the decisions, action items, and next steps?"
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </div>
  );

  // Component for Headlines/Admin Section
  const HeadlinesSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Headlines & Admin</h2>
      <p className="text-gray-600">Administrative items and team updates</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-medium mb-3">Next Meeting Date</label>
          <input
            type="datetime-local"
            value={meetingData.headlines.nextMeetingDate}
            onChange={(e) => setMeetingData({
              ...meetingData, 
              headlines: {...meetingData.headlines, nextMeetingDate: e.target.value}
            })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        <div className="md:col-span-1">
          <label className="block text-lg font-medium mb-3">FIGMINTS Team Updates</label>
          <textarea
            value={meetingData.headlines.teamUpdates}
            onChange={(e) => setMeetingData({
              ...meetingData, 
              headlines: {...meetingData.headlines, teamUpdates: e.target.value}
            })}
            placeholder="Team news, updates, announcements..."
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </div>
  );

  // Component for New To-dos Section
  const NewTodosSection = () => {
    const [newTodoItem, setNewTodoItem] = useState('');

    const addNewTodo = () => {
      if (newTodoItem.trim()) {
        setMeetingData({
          ...meetingData, 
          newTodos: [...meetingData.newTodos, { id: Date.now(), item: newTodoItem.trim(), created: new Date().toISOString() }]
        });
        setNewTodoItem('');
      }
    };

    const removeTodo = (id) => {
      setMeetingData({
        ...meetingData, 
        newTodos: meetingData.newTodos.filter(todo => todo.id !== id)
      });
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">New To-dos</h2>
        <p className="text-gray-600">Action items that will carry forward to the next meeting</p>
        
        <div className="flex gap-4">
          <input
            type="text"
            value={newTodoItem}
            onChange={(e) => setNewTodoItem(e.target.value)}
            placeholder="Enter new to-do item..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && addNewTodo()}
          />
          <button 
            onClick={addNewTodo}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Add To-do
          </button>
        </div>
        
        <div className="space-y-2">
          {meetingData.newTodos.map((todo) => (
            <div key={todo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>{todo.item}</span>
              <button 
                onClick={() => removeTodo(todo.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          {meetingData.newTodos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No new to-dos created yet.
            </div>
          )}
        </div>
      </div>
    );
  };

  // Component for Meeting Score Section
  const MeetingScoreSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Meeting Score</h2>
      <p className="text-gray-600">Rate this meeting out of 10</p>
      
      <div className="text-center space-y-6">
        <div className="flex justify-center items-center space-x-4">
          {[1,2,3,4,5,6,7,8,9,10].map((score) => (
            <button
              key={score}
              onClick={() => setMeetingData({...meetingData, meetingScore: score})}
              className={`w-12 h-12 rounded-full border-2 font-bold text-lg transition-all ${
                meetingData.meetingScore === score 
                  ? 'bg-pink-600 text-white border-pink-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-pink-400'
              }`}
            >
              {score}
            </button>
          ))}
        </div>
        
        {meetingData.meetingScore > 0 && (
          <div className="text-6xl font-bold text-pink-600">
            {meetingData.meetingScore}/10
          </div>
        )}
        
        <div className="text-sm text-gray-500 max-w-md mx-auto">
          Consider: How productive was the meeting? Did we accomplish our goals? How engaged was everyone?
        </div>
      </div>
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'bigwins': return <BigWinsSection />;
      case 'scorecard': return <ScorecardSection />;
      case 'todorecap': return <TodoRecapSection />;
      case 'campaigns': return <CampaignSection />;
      case 'ids': return <IDSSection />;
      case 'headlines': return <HeadlinesSection />;
      case 'newtodos': return <NewTodosSection />;
      case 'score': return <MeetingScoreSection />;
      default: return <BigWinsSection />;
    }
  };

  // Show loading screen while initializing
  if (isLoading && !currentMeeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Meeting Session...</h2>
          <p className="text-gray-600">Setting up your client meeting workflow</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="text-blue-600">FIGMINTS</span> Client Meeting Workflow
              </h1>
              <p className="text-gray-600 text-sm">Every-other-week client meeting guide</p>
              {currentMeeting && (
                <p className="text-xs text-gray-400 mt-1">
                  Meeting ID: {currentMeeting.id} • {currentMeeting.meeting_date}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Session: {new Date().toLocaleDateString()}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => saveAllData()}
                  disabled={isLoading || !currentMeeting}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckIcon className="h-4 w-4" />
                  )}
                  <span>Save</span>
                </button>
                {saveStatus && (
                  <span className="text-sm text-green-600">{saveStatus}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Navigation Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className={`mr-3 h-5 w-5 ${tab.color}`} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
            
            {/* Progress indicator */}
            <div className="mt-6 p-4 bg-white rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Section Progress</h3>
              <div className="text-xs text-gray-500">
                Complete each section systematically during your client meeting.
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingWorkflowApp;