import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { UsersIcon, CalendarIcon, CheckCircleIcon, ClockIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

// Modal Component for New Client
const ClientModal = ({ isOpen, onClose }) => {
  const { apiCall } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    address: '',
    client_name: '',
    client_contact: '',
    preferred_contact: '',
    account_manager: '',
    am_email: '',
    strategist: '',
    strat_email: '',
    regular_meeting_date: '',
    important_links: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await apiCall('/api/clients', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      // Refresh the clients list
      queryClient.invalidateQueries(['clients']);
      
      // Reset form and close modal
      setFormData({
        name: '',
        url: '',
        address: '',
        client_name: '',
        client_contact: '',
        preferred_contact: '',
        account_manager: '',
        am_email: '',
        strategist: '',
        strat_email: '',
        regular_meeting_date: '',
        important_links: ''
      });
      onClose();
      alert('Client created successfully!');
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.account_manager.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Client
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Website URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client Contact Name
              </label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client Email
              </label>
              <input
                type="email"
                value={formData.client_contact}
                onChange={(e) => setFormData({...formData, client_contact: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Manager *
              </label>
              <input
                type="text"
                value={formData.account_manager}
                onChange={(e) => setFormData({...formData, account_manager: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                AM Email
              </label>
              <input
                type="email"
                value={formData.am_email}
                onChange={(e) => setFormData({...formData, am_email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Strategist
              </label>
              <input
                type="text"
                value={formData.strategist}
                onChange={(e) => setFormData({...formData, strategist: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Strategist Email
              </label>
              <input
                type="email"
                value={formData.strat_email}
                onChange={(e) => setFormData({...formData, strat_email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Regular Meeting Schedule
            </label>
            <input
              type="text"
              placeholder="e.g., First Monday of each month at 2pm"
              value={formData.regular_meeting_date}
              onChange={(e) => setFormData({...formData, regular_meeting_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex-1 py-2 px-4 bg-figmints-primary text-white rounded-lg hover:bg-figmints-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Component for New Meeting
const MeetingModal = ({ isOpen, onClose, preselectedClient = null }) => {
  const { apiCall } = useAuth();
  const queryClient = useQueryClient();
  
  // Get clients for the dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiCall('/api/clients'),
    enabled: isOpen,
  });

  const [formData, setFormData] = useState({
    clientId: preselectedClient?.id || '',
    title: preselectedClient ? `Meeting with ${preselectedClient.name}` : '',
    date: '',
    time: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset and initialize form when modal opens/closes or preselected client changes
  useEffect(() => {
    if (isOpen) {
      if (preselectedClient) {
        setFormData({
          clientId: preselectedClient.id,
          title: `Meeting with ${preselectedClient.name}`,
          date: '',
          time: '',
          notes: ''
        });
      } else {
        setFormData({
          clientId: '',
          title: '',
          date: '',
          time: '',
          notes: ''
        });
      }
      setIsSubmitting(false);
    }
  }, [isOpen, preselectedClient]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !isFormValid) return;

    setIsSubmitting(true);
    try {
      // Combine date and time into meeting_date
      const meetingDateTime = `${formData.date}T${formData.time}:00`;
      
      await apiCall(`/api/clients/${formData.clientId}/meetings`, {
        method: 'POST',
        body: JSON.stringify({
          meeting_date: meetingDateTime,
          notes: formData.notes,
          status: 'draft'
        })
      });
      
      // Reset form and close modal
      setFormData({
        clientId: preselectedClient?.id || '',
        title: preselectedClient ? `Meeting with ${preselectedClient.name}` : '',
        date: '',
        time: '',
        notes: ''
      });
      onClose();
      alert('Meeting created successfully!');
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to create meeting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.clientId && formData.date && formData.time;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {preselectedClient ? `Schedule Meeting with ${preselectedClient.name}` : 'New Meeting'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!preselectedClient && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client *
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => {
                  const selectedClient = clients.find(c => c.id == e.target.value);
                  setFormData({
                    ...formData, 
                    clientId: e.target.value,
                    title: selectedClient ? `Meeting with ${selectedClient.name}` : ''
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select a client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meeting Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter meeting title..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows="3"
              placeholder="Add any meeting notes or agenda items..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex-1 py-2 px-4 bg-figmints-primary text-white rounded-lg hover:bg-figmints-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Client Detail Modal
const ClientDetailModal = ({ client, isOpen, onClose }) => {
  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {client.name} Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Company Information
              </h3>
              <div className="space-y-2">
                <p className="text-gray-900 dark:text-white"><strong>Name:</strong> {client.name}</p>
                {client.url && <p className="text-gray-900 dark:text-white"><strong>Website:</strong> {client.url}</p>}
                {client.address && <p className="text-gray-900 dark:text-white"><strong>Address:</strong> {client.address}</p>}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Contact Information
              </h3>
              <div className="space-y-2">
                {client.client_name && <p className="text-gray-900 dark:text-white"><strong>Client Contact:</strong> {client.client_name}</p>}
                {client.client_contact && <p className="text-gray-900 dark:text-white"><strong>Email:</strong> {client.client_contact}</p>}
                {client.preferred_contact && <p className="text-gray-900 dark:text-white"><strong>Preferred Contact:</strong> {client.preferred_contact}</p>}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Account Team
              </h3>
              <div className="space-y-2">
                {client.account_manager && <p className="text-gray-900 dark:text-white"><strong>Account Manager:</strong> {client.account_manager}</p>}
                {client.am_email && <p className="text-gray-900 dark:text-white"><strong>AM Email:</strong> {client.am_email}</p>}
                {client.strategist && <p className="text-gray-900 dark:text-white"><strong>Strategist:</strong> {client.strategist}</p>}
                {client.strat_email && <p className="text-gray-900 dark:text-white"><strong>Strat Email:</strong> {client.strat_email}</p>}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Meeting Information
              </h3>
              <div className="space-y-2">
                {client.regular_meeting_date && (
                  <p className="text-gray-900 dark:text-white">
                    <strong>Regular Meeting:</strong> {client.regular_meeting_date}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {client.important_links && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Important Links
              </h3>
              <p className="text-gray-900 dark:text-white">{client.important_links}</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { apiCall, user, isAdmin } = useAuth();
  
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiCall('/api/clients'),
  });
  
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isClientDetailModalOpen, setIsClientDetailModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [preselectedMeetingClient, setPreselectedMeetingClient] = useState(null);

  const handleNewMeetingClick = () => {
    setPreselectedMeetingClient(null);
    setIsMeetingModalOpen(true);
  };

  const handleClientClick = (client) => {
    setSelectedClient(client);
    setIsClientDetailModalOpen(true);
  };

  const handleScheduleMeetingForClient = (client) => {
    setPreselectedMeetingClient(client);
    setIsMeetingModalOpen(true);
  };

  const handleNewClientClick = () => {
    setIsClientModalOpen(true);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', onClick = null }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      coral: 'bg-figmints-primary'
    };

    return (
      <div 
        className={`card p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition-all duration-200' : ''}`}
        onClick={onClick}
      >
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.first_name}! 
            {user?.role === 'client' ? ' View your client data below.' : ' Manage all client data from here.'}
          </p>
        </div>
        <div className="flex space-x-3">
          {isAdmin() && (
            <button 
              onClick={handleNewClientClick}
              className="btn-secondary flex items-center hover:bg-gray-600 transition-colors"
              title="Add a new client"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Client
            </button>
          )}
          <button 
            onClick={handleNewMeetingClick}
            className="btn-primary flex items-center hover:bg-figmints-primary/90 transition-colors"
            title="Create a new meeting"
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            New Meeting
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients"
          value={clients.length}
          subtitle={isAdmin() ? "All accounts" : "Your account"}
          icon={UsersIcon}
          color="coral"
        />
        <StatCard
          title="Pending Todos"
          value={8}
          subtitle="2 overdue"
          icon={ClockIcon}
          color="yellow"
        />
        <StatCard
          title="Completed Todos"
          value={23}
          subtitle="This month"
          icon={CheckCircleIcon}
          color="green"
        />
        <StatCard
          title="Upcoming Meetings"
          value={4}
          subtitle="Next 30 days"
          icon={CalendarIcon}
          color="blue"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Meeting completed with Acme Corp</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <CalendarIcon className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">New meeting scheduled</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Green Leaf Co - Tomorrow 2pm</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isAdmin() ? 'All Clients' : 'Your Client'}
            </h2>
          </div>
          <div className="p-6">
            {isLoading ? (
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
                  <div
                    key={client.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="h-8 w-8 bg-figmints-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {client.name.charAt(0)}
                      </span>
                    </div>
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleClientClick(client)}
                      title={`Click to view ${client.name} details`}
                    >
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {client.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {client.account_manager}
                      </p>
                    </div>
                    <button
                      onClick={() => handleScheduleMeetingForClient(client)}
                      className="px-3 py-1 text-xs bg-figmints-primary text-white rounded-md hover:bg-figmints-primary/90 transition-colors"
                      title={`Schedule meeting with ${client.name}`}
                    >
                      Schedule
                    </button>
                  </div>
                ))}
                {clients.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No clients found
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="card p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <div className="flex items-center">
          <CheckCircleIcon className="h-8 w-8 text-green-500 mr-4" />
          <div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">
              ✅ FIGMINTS CMO App with Authentication!
            </h3>
            <p className="text-green-700 dark:text-green-300">
              {isAdmin() 
                ? "Welcome, admin! You have full access to all client data and can manage users in the Admin Panel."
                : `Welcome, ${user?.first_name}! You can view and manage your client data. Access is restricted to your assigned client only.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <MeetingModal 
        isOpen={isMeetingModalOpen} 
        onClose={() => {
          setIsMeetingModalOpen(false);
          setPreselectedMeetingClient(null);
        }}
        preselectedClient={preselectedMeetingClient}
      />

      <ClientModal 
        isOpen={isClientModalOpen} 
        onClose={() => setIsClientModalOpen(false)}
      />
      
      <ClientDetailModal 
        client={selectedClient}
        isOpen={isClientDetailModalOpen} 
        onClose={() => setIsClientDetailModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;