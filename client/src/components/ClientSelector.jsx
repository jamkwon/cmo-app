import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  BuildingOfficeIcon, 
  CalendarDaysIcon,
  ChevronRightIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { DataService } from '../utils/dataService';
import ValidationService from '../utils/validation';

const ClientSelector = ({ onClientSelect, selectedClientId }) => {
  const [clients, setClients] = useState([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', industry: '', contact: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const [recentSessions, setRecentSessions] = useState([]);

  useEffect(() => {
    loadClients();
    loadRecentSessions();
  }, []);

  const loadClients = () => {
    const clientList = DataService.clients.getAll();
    setClients(clientList);
  };

  const loadRecentSessions = () => {
    const sessions = DataService.sessions.getList();
    setRecentSessions(sessions.slice(0, 5)); // Show last 5 sessions
  };

  const handleAddClient = () => {
    const validation = ValidationService.validateClient(newClient);
    
    if (validation.isValid) {
      const addedClient = DataService.clients.add(newClient);
      setClients([...clients, addedClient]);
      setNewClient({ name: '', industry: '', contact: '' });
      setShowAddClient(false);
      setValidationErrors({});
      onClientSelect(addedClient.id);
    } else {
      setValidationErrors(validation.errors);
    }
  };

  const getClientLastMeeting = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (!client?.lastMeeting) return 'No previous meetings';
    
    const lastMeetingDate = new Date(client.lastMeeting);
    const daysDiff = Math.floor((new Date() - lastMeetingDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Yesterday';
    if (daysDiff < 7) return `${daysDiff} days ago`;
    if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`;
    return lastMeetingDate.toLocaleDateString();
  };

  const handleResumeSession = (session) => {
    onClientSelect(session.clientId, session.meetingId);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="text-blue-600">FIGMINTS</span> Client Meeting
          </h1>
          <p className="text-gray-600">Select a client to start your meeting workflow</p>
        </div>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
              Resume Recent Session
            </h2>
            <div className="space-y-2">
              {recentSessions.map((session) => (
                <button
                  key={session.key}
                  onClick={() => handleResumeSession(session)}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                >
                  <div>
                    <div className="font-medium text-gray-900">{session.clientName}</div>
                    <div className="text-sm text-gray-500">
                      Meeting: {new Date(session.meetingDate).toLocaleDateString()} • 
                      Saved: {new Date(session.lastSaved).toLocaleString()}
                    </div>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Client Selection */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
                Select Client
              </h2>
              <button
                onClick={() => setShowAddClient(!showAddClient)}
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Add New Client
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Add New Client Form */}
            {showAddClient && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium text-blue-900 mb-4">Add New Client</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Acme Corp"
                    />
                    {validationErrors.name && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry *
                    </label>
                    <input
                      type="text"
                      value={newClient.industry}
                      onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
                      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.industry ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Technology"
                    />
                    {validationErrors.industry && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.industry}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={newClient.contact}
                      onChange={(e) => setNewClient({ ...newClient, contact: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={handleAddClient}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add Client
                  </button>
                  <button
                    onClick={() => {
                      setShowAddClient(false);
                      setNewClient({ name: '', industry: '', contact: '' });
                      setValidationErrors({});
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Client List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => onClientSelect(client.id)}
                  className={`p-4 border rounded-lg text-left transition-all hover:shadow-md ${
                    selectedClientId === client.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {client.name}
                      </h3>
                      <p className="text-sm text-gray-500">{client.industry}</p>
                      {client.contact && (
                        <p className="text-sm text-gray-500">{client.contact}</p>
                      )}
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                        Last meeting: {getClientLastMeeting(client.id)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {clients.length === 0 && !showAddClient && (
              <div className="text-center py-12">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
                <p className="text-gray-500 mb-4">Add your first client to get started</p>
                <button
                  onClick={() => setShowAddClient(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Add First Client
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSelector;