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
  CheckIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

import ClientSelector from './components/ClientSelector';
import SaveIndicator from './components/SaveIndicator';
import ExportModal from './components/ExportModal';
import { ToastContainer } from './components/Toast';
import { DataService } from './utils/dataService';
import ValidationService from './utils/validation';

const API_BASE_URL = window.location.origin;

// Enhanced Meeting Workflow App - Cycle 2 with data persistence and external access
const MeetingWorkflowApp = () => {
  const [activeTab, setActiveTab] = useState('bigwins');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [currentMeeting, setCurrentMeeting] = useState(null);
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
  
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [validation, setValidation] = useState({ isValid: true, errors: {}, warnings: [] });
  const [showExportModal, setShowExportModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Auto-save interval and validation
  useEffect(() => {
    if (selectedClientId && currentMeeting) {
      // Auto-save every 30 seconds
      const interval = setInterval(() => {
        saveAllData(true); // Silent save
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [selectedClientId, currentMeeting, meetingData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentMeeting && !isLoading) {
          saveAllData();
        }
      }
      
      // Ctrl+Tab or Cmd+Tab to cycle through tabs
      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex].id);
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        if (showExportModal) {
          setShowExportModal(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, tabs, currentMeeting, isLoading, showExportModal]);

  // Toast management
  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    setToasts(prev => [...prev, toast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Validate data when it changes
  useEffect(() => {
    const validationResult = ValidationService.validateMeetingData(meetingData);
    setValidation(validationResult);
    setHasUnsavedChanges(true);
  }, [meetingData]);

  // Auto-save to localStorage on data changes
  useEffect(() => {
    if (selectedClientId && hasUnsavedChanges) {
      DataService.meetingData.autoSave(meetingData);
    }
  }, [meetingData, selectedClientId, hasUnsavedChanges]);

  // Handle client selection
  const handleClientSelect = async (clientId, existingMeetingId = null) => {
    try {
      setIsLoading(true);
      setSelectedClientId(clientId);
      
      // Get client info
      const clients = DataService.clients.getAll();
      const client = clients.find(c => c.id === clientId);
      setSelectedClient(client);
      
      if (existingMeetingId) {
        // Resume existing session
        const sessionData = DataService.sessions.load(clientId, existingMeetingId);
        if (sessionData) {
          setCurrentMeeting({ id: existingMeetingId, meeting_date: sessionData.meetingDate });
          setMeetingData(sessionData);
          setLastSaved(sessionData.lastSaved);
          setHasUnsavedChanges(false);
          return;
        }
      }

      // Create new meeting session
      await initializeMeetingSession(clientId);
    } catch (error) {
      console.error('Error selecting client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeMeetingSession = async (clientId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Try API first, fallback to localStorage
      try {
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
          return;
        }
      } catch (apiError) {
        console.warn('API unavailable, using localStorage:', apiError);
      }

      // Fallback to localStorage
      const meetingId = `local-${clientId}-${today}`;
      setCurrentMeeting({ id: meetingId, meeting_date: today });
      
      // Check for existing local data
      const existingData = DataService.meetingData.load(clientId, today);
      if (existingData) {
        setMeetingData(existingData);
      } else {
        // Check for auto-saved data
        const autoSaved = DataService.meetingData.loadAutoSave();
        if (autoSaved) {
          setMeetingData(autoSaved);
          DataService.meetingData.clearAutoSave();
        }
      }
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error initializing meeting session:', error);
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
          headlines: data.headlines || { nextMeetingDate: '', teamUpdates: '' },
          newTodos: data.newTodos || [],
          meetingScore: data.meetingScore || 0
        });
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.warn('Failed to load from API, checking localStorage:', error);
      // Fallback to localStorage
      const localData = DataService.meetingData.load(selectedClientId, currentMeeting?.meeting_date);
      if (localData) {
        setMeetingData(localData);
        setHasUnsavedChanges(false);
      }
    }
  };

  const saveAllData = async (silent = false) => {
    if (!currentMeeting || !selectedClientId) return;
    
    try {
      if (!silent) {
        setIsLoading(true);
        setSaveStatus('saving');
      }
      
      const now = new Date().toISOString();

      // Try API first
      try {
        const response = await fetch(`${API_BASE_URL}/api/meetings/${currentMeeting.id}/data`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(meetingData)
        });
        
        if (response.ok) {
          setLastSaved(now);
          setHasUnsavedChanges(false);
          if (!silent) {
            setSaveStatus('saved');
            addToast('Meeting data saved successfully!', 'success');
            setTimeout(() => setSaveStatus(''), 3000);
          } else {
            setSaveStatus('auto-saved');
            setTimeout(() => setSaveStatus(''), 2000);
          }
        } else {
          throw new Error('API save failed');
        }
      } catch (apiError) {
        console.warn('API save failed, using localStorage:', apiError);
        throw apiError;
      }

      // Always backup to localStorage
      DataService.meetingData.save(meetingData, selectedClientId, currentMeeting.meeting_date);
      DataService.sessions.save(meetingData, selectedClientId, currentMeeting.id);

    } catch (error) {
      console.error('Error saving data:', error);
      
      // Fallback save to localStorage only
      DataService.meetingData.save(meetingData, selectedClientId, currentMeeting.meeting_date);
      DataService.sessions.save(meetingData, selectedClientId, currentMeeting.id);
      
      setLastSaved(new Date().toISOString());
      setHasUnsavedChanges(false);
      
      if (!silent) {
        setSaveStatus('saved');
        addToast('Data saved locally (offline mode)', 'warning');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    if (hasUnsavedChanges && !confirm('You have unsaved changes. Are you sure you want to start over?')) {
      return;
    }
    
    setSelectedClientId(null);
    setSelectedClient(null);
    setCurrentMeeting(null);
    setMeetingData({
      bigWins: '',
      scorecard: [],
      todoRecap: [],
      campaigns: [],
      ids: { identify: '', discuss: '', solve: '' },
      headlines: { nextMeetingDate: '', teamUpdates: '' },
      newTodos: [],
      meetingScore: 0
    });
    setActiveTab('bigwins');
    setHasUnsavedChanges(false);
    DataService.meetingData.clearAutoSave();
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

  // Enhanced input component with validation
  const ValidatedInput = ({ value, onChange, placeholder, className = '', fieldName, rules = {}, ...props }) => {
    const [fieldErrors, setFieldErrors] = useState([]);

    const handleChange = (e) => {
      const newValue = e.target.value;
      onChange(e);
      
      if (rules && Object.keys(rules).length > 0) {
        const validation = ValidationService.validateField(fieldName, newValue, rules);
        setFieldErrors(validation.errors);
      }
    };

    const hasErrors = fieldErrors.length > 0;

    return (
      <div>
        <input
          {...props}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`${className} ${hasErrors ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
        />
        {hasErrors && (
          <div className="mt-1 text-sm text-red-600">
            {fieldErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Component for Big Wins Section
  const BigWinsSection = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Big Wins</h2>
        <p className="text-gray-600">Capture client wins from the past period</p>
      </div>
      <div>
        <label htmlFor="big-wins-textarea" className="sr-only">
          Big wins achieved since last meeting
        </label>
        <textarea
          id="big-wins-textarea"
          value={meetingData.bigWins}
          onChange={(e) => setMeetingData({...meetingData, bigWins: e.target.value})}
          placeholder="What big wins has the client achieved since our last meeting?"
          className="w-full h-32 sm:h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow"
          aria-describedby="big-wins-help"
        />
        <div id="big-wins-help" className="text-sm text-gray-500 mt-2">
          Example: "Launched new product line", "Hit quarterly revenue goal", "Hired key team member"
        </div>
      </div>
    </div>
  );

  // Enhanced Scorecard Section with validation
  const ScorecardSection = () => {
    const [newMetric, setNewMetric] = useState({ name: '', goal: '', current: '', previous: '' });

    const addMetric = () => {
      if (newMetric.name && newMetric.goal && newMetric.current) {
        setMeetingData({
          ...meetingData, 
          scorecard: [...meetingData.scorecard, { 
            ...newMetric, 
            id: Date.now(), 
            trend: calculateTrend(newMetric.current, newMetric.previous),
            goal: parseFloat(newMetric.goal),
            current: parseFloat(newMetric.current),
            previous: parseFloat(newMetric.previous) || 0
          }]
        });
        setNewMetric({ name: '', goal: '', current: '', previous: '' });
      }
    };

    const removeMetric = (id) => {
      setMeetingData({
        ...meetingData,
        scorecard: meetingData.scorecard.filter(metric => metric.id !== id)
      });
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
            <ValidatedInput
              type="text"
              placeholder="Metric name"
              value={newMetric.name}
              onChange={(e) => setNewMetric({...newMetric, name: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2"
              fieldName="metricName"
              rules={{ required: true, minLength: 2 }}
            />
            <ValidatedInput
              type="number"
              placeholder="Goal"
              value={newMetric.goal}
              onChange={(e) => setNewMetric({...newMetric, goal: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2"
              fieldName="goal"
              rules={{ required: true, type: 'number', min: 0 }}
            />
            <ValidatedInput
              type="number"
              placeholder="Current"
              value={newMetric.current}
              onChange={(e) => setNewMetric({...newMetric, current: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2"
              fieldName="current"
              rules={{ required: true, type: 'number', min: 0 }}
            />
            <ValidatedInput
              type="number"
              placeholder="Previous"
              value={newMetric.previous}
              onChange={(e) => setNewMetric({...newMetric, previous: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2"
              fieldName="previous"
              rules={{ type: 'number', min: 0 }}
            />
          </div>
          <button 
            onClick={addMetric}
            disabled={!newMetric.name || !newMetric.goal || !newMetric.current}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                <th className="border border-gray-300 p-3 text-center">Actions</th>
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
                    <td className="border border-gray-300 p-3 text-center">
                      <button
                        onClick={() => removeMetric(metric.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
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

  // Enhanced To-do Recap Section
  const TodoRecapSection = () => {
    const [newTodo, setNewTodo] = useState({ item: '', status: 'progress', notes: '' });

    const addTodoItem = () => {
      if (newTodo.item.trim()) {
        setMeetingData({
          ...meetingData, 
          todoRecap: [...meetingData.todoRecap, { ...newTodo, id: Date.now(), item: newTodo.item.trim() }]
        });
        setNewTodo({ item: '', status: 'progress', notes: '' });
      }
    };

    const removeTodoItem = (id) => {
      setMeetingData({
        ...meetingData,
        todoRecap: meetingData.todoRecap.filter(todo => todo.id !== id)
      });
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
            <ValidatedInput
              type="text"
              placeholder="To-do item description"
              value={newTodo.item}
              onChange={(e) => setNewTodo({...newTodo, item: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
              fieldName="todoItem"
              rules={{ required: true, minLength: 3 }}
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
            disabled={!newTodo.item.trim()}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(todo.status)}`}>
                    {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
                  </span>
                  <button
                    onClick={() => removeTodoItem(todo.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
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

  // Enhanced Campaign Section
  const CampaignSection = () => {
    const [newCampaign, setNewCampaign] = useState({ name: '', status: '', progress: '', notes: '' });

    const addCampaign = () => {
      if (newCampaign.name.trim() && newCampaign.status) {
        setMeetingData({
          ...meetingData, 
          campaigns: [...meetingData.campaigns, { ...newCampaign, id: Date.now(), name: newCampaign.name.trim() }]
        });
        setNewCampaign({ name: '', status: '', progress: '', notes: '' });
      }
    };

    const removeCampaign = (id) => {
      setMeetingData({
        ...meetingData,
        campaigns: meetingData.campaigns.filter(campaign => campaign.id !== id)
      });
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Campaign Progress</h2>
        <p className="text-gray-600">Track existing campaigns and their current status</p>
        
        {/* Add campaign form */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Add Campaign</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput
              type="text"
              placeholder="Campaign name"
              value={newCampaign.name}
              onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2"
              fieldName="campaignName"
              rules={{ required: true, minLength: 2 }}
            />
            <select
              value={newCampaign.status}
              onChange={(e) => setNewCampaign({...newCampaign, status: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2"
              required
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
            disabled={!newCampaign.name.trim() || !newCampaign.status}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{campaign.status}</span>
                  <button
                    onClick={() => removeCampaign(campaign.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
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

  // Enhanced IDS Section
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
      
      {/* IDS Progress Indicator */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">IDS Progress</h4>
        <div className="flex space-x-4">
          <div className={`flex items-center ${meetingData.ids.identify ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircleIcon className="h-5 w-5 mr-1" />
            Identify
          </div>
          <div className={`flex items-center ${meetingData.ids.discuss ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircleIcon className="h-5 w-5 mr-1" />
            Discuss
          </div>
          <div className={`flex items-center ${meetingData.ids.solve ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircleIcon className="h-5 w-5 mr-1" />
            Solve
          </div>
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

  // Enhanced New To-dos Section
  const NewTodosSection = () => {
    const [newTodoItem, setNewTodoItem] = useState('');

    const addNewTodo = () => {
      if (newTodoItem.trim()) {
        setMeetingData({
          ...meetingData, 
          newTodos: [...meetingData.newTodos, { 
            id: Date.now(), 
            item: newTodoItem.trim(), 
            created: new Date().toISOString() 
          }]
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
          <ValidatedInput
            type="text"
            value={newTodoItem}
            onChange={(e) => setNewTodoItem(e.target.value)}
            placeholder="Enter new to-do item..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && addNewTodo()}
            fieldName="newTodo"
            rules={{ required: true, minLength: 3 }}
          />
          <button 
            onClick={addNewTodo}
            disabled={!newTodoItem.trim()}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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

  // Enhanced Meeting Score Section
  const MeetingScoreSection = () => {
    const completeness = ValidationService.calculateCompleteness(meetingData);
    
    return (
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
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Meeting Completeness</h4>
            <div className="flex items-center justify-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all" 
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <span className="font-bold text-blue-600">{completeness}%</span>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              {completeness === 100 ? '✅ All sections complete!' : `${100 - completeness}% remaining`}
            </p>
          </div>
          
          <div className="text-sm text-gray-500 max-w-md mx-auto">
            Consider: How productive was the meeting? Did we accomplish our goals? How engaged was everyone?
          </div>
        </div>
      </div>
    );
  };

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

  // Show client selector if no client selected
  if (!selectedClientId) {
    return <ClientSelector onClientSelect={handleClientSelect} selectedClientId={selectedClientId} />;
  }

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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleStartOver}
                className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded p-1"
                aria-label="Change client and start new meeting"
              >
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Change Client</span>
                <span className="sm:hidden">Back</span>
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  <span className="text-blue-600">FIGMINTS</span> Client Meeting
                </h1>
                <p className="text-gray-600 text-sm">
                  {selectedClient?.name} • {currentMeeting?.meeting_date ? new Date(currentMeeting.meeting_date).toLocaleDateString() : 'Today'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4">
              {/* Keyboard shortcut hint */}
              <div className="hidden lg:flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                <kbd className="bg-white px-1 rounded shadow text-gray-700">Ctrl+S</kbd>
                <span className="ml-1">to save</span>
              </div>
              
              <SaveIndicator 
                status={saveStatus} 
                lastSaved={lastSaved} 
                className="hidden sm:inline-flex"
              />
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded px-2 py-1"
                aria-label="Export meeting data"
              >
                <ShareIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => saveAllData()}
                disabled={isLoading || !currentMeeting}
                className="flex items-center space-x-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                aria-label={isLoading ? "Saving meeting data" : "Save meeting data"}
              >
                {isLoading ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckIcon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>
          
          {/* Validation warnings */}
          {validation.warnings.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Consider completing these sections:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {validation.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Tab Navigation */}
          <div className="lg:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Navigate between meeting sections"
            >
              {tabs.map((tab) => {
                const hasContent = (() => {
                  switch(tab.id) {
                    case 'bigwins': return !!meetingData.bigWins;
                    case 'scorecard': return meetingData.scorecard.length > 0;
                    case 'todorecap': return meetingData.todoRecap.length > 0;
                    case 'campaigns': return meetingData.campaigns.length > 0;
                    case 'ids': return !!(meetingData.ids.identify || meetingData.ids.discuss || meetingData.ids.solve);
                    case 'headlines': return !!(meetingData.headlines.nextMeetingDate || meetingData.headlines.teamUpdates);
                    case 'newtodos': return meetingData.newTodos.length > 0;
                    case 'score': return meetingData.meetingScore > 0;
                    default: return false;
                  }
                })();
                
                return (
                  <option key={tab.id} value={tab.id}>
                    {hasContent ? '✓ ' : ''}{tab.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <nav className="space-y-1" role="tablist" aria-label="Meeting workflow sections">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const hasContent = (() => {
                  switch(tab.id) {
                    case 'bigwins': return !!meetingData.bigWins;
                    case 'scorecard': return meetingData.scorecard.length > 0;
                    case 'todorecap': return meetingData.todoRecap.length > 0;
                    case 'campaigns': return meetingData.campaigns.length > 0;
                    case 'ids': return !!(meetingData.ids.identify || meetingData.ids.discuss || meetingData.ids.solve);
                    case 'headlines': return !!(meetingData.headlines.nextMeetingDate || meetingData.headlines.teamUpdates);
                    case 'newtodos': return meetingData.newTodos.length > 0;
                    case 'score': return meetingData.meetingScore > 0;
                    default: return false;
                  }
                })();
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`panel-${tab.id}`}
                    id={`tab-${tab.id}`}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className={`mr-3 h-5 w-5 ${tab.color}`} />
                    <span className="flex-1 text-left">{tab.name}</span>
                    {hasContent && (
                      <CheckCircleIcon 
                        className="h-4 w-4 text-green-600" 
                        aria-label="Section completed"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
            
            {/* Progress indicator */}
            <div className="mt-6 p-4 bg-white rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Session Progress</h3>
              <div className="text-xs text-gray-500">
                Complete each section systematically during your client meeting.
              </div>
              {hasUnsavedChanges && (
                <div className="mt-2 text-xs text-orange-600 flex items-center">
                  <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                  Unsaved changes
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div 
              className="bg-white rounded-lg shadow-sm border p-6"
              role="tabpanel"
              id={`panel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
              tabIndex={0}
            >
              {isLoading ? (
                <div className="animate-pulse space-y-6">
                  <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              ) : (
                renderContent()
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        meetingData={meetingData}
        clientName={selectedClient?.name || 'Unknown Client'}
        meetingDate={currentMeeting?.meeting_date || new Date().toISOString().split('T')[0]}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default MeetingWorkflowApp;