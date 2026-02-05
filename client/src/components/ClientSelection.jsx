import React, { useState } from 'react';
import { ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';

const ClientSelection = ({ onClientSelected }) => {
  const [clients] = useState([
    { id: 1, name: 'Acme Corp', contact: 'Alex Rivera', lastMeeting: '2024-01-15' },
    { id: 2, name: 'Green Leaf Co', contact: 'Jamie Park', lastMeeting: '2024-01-20' },
    { id: 3, name: 'Test Client Co', contact: 'Test Manager', lastMeeting: '2024-01-25' },
    { id: 4, name: 'Urban Fitness', contact: 'Sam Rodriguez', lastMeeting: '2024-01-30' },
  ]);

  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', contact: '', email: '' });

  const selectClient = (client) => {
    onClientSelected(client);
  };

  const addNewClient = () => {
    if (newClient.name && newClient.contact) {
      const client = {
        id: Date.now(),
        name: newClient.name,
        contact: newClient.contact,
        email: newClient.email,
        lastMeeting: null
      };
      selectClient(client);
      setNewClient({ name: '', contact: '', email: '' });
      setShowNewClientForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="text-blue-600">FIGMINTS</span> Client Meeting
          </h1>
          <p className="text-gray-600 mt-2">Select a client to begin the meeting workflow</p>
        </div>

        <div className="space-y-4">
          {clients.map((client) => (
            <button
              key={client.id}
              onClick={() => selectClient(client)}
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">{client.name}</h3>
                <p className="text-sm text-gray-600">{client.contact}</p>
                {client.lastMeeting && (
                  <p className="text-xs text-gray-500">Last meeting: {new Date(client.lastMeeting).toLocaleDateString()}</p>
                )}
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6">
          {!showNewClientForm ? (
            <button
              onClick={() => setShowNewClientForm(true)}
              className="w-full flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <PlusIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600">Add New Client</span>
            </button>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Add New Client</h3>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder="Company name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Contact person"
                  value={newClient.contact}
                  onChange={(e) => setNewClient({...newClient, contact: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={addNewClient}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Meeting
                </button>
                <button
                  onClick={() => setShowNewClientForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientSelection;