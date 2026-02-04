import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon } from '@heroicons/react/24/outline';
import TodoItem from '../shared/TodoItem';
import Modal from '../shared/Modal';
import { API_BASE_URL } from '../../config/api';

const fetchClientTodos = async (clientId) => {
  const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}/todos`);
  if (!response.ok) throw new Error('Failed to fetch todos');
  return response.json();
};

const createTodo = async (todo) => {
  const response = await fetch(`${API_BASE_URL}/api/clients/${todo.clientId}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo),
  });
  if (!response.ok) throw new Error('Failed to create todo');
  return response.json();
};

const TodoForm = ({ clientId, meetingId, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: 'us',
    due_date: '',
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries(['client-todos', clientId]);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      mutation.mutate({
        ...formData,
        clientId,
        meeting_id: meetingId,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Todo Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input"
          placeholder="What needs to be done?"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input resize-none"
          rows={3}
          placeholder="Additional details..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Assigned To
          </label>
          <select
            value={formData.assigned_to}
            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
            className="input"
          >
            <option value="us">FIGMINTS</option>
            <option value="client">Client</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Due Date
          </label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="input"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="btn-primary"
        >
          {mutation.isPending ? 'Creating...' : 'Create Todo'}
        </button>
      </div>

      {mutation.isError && (
        <div className="text-red-600 text-sm">
          Error creating todo. Please try again.
        </div>
      )}
    </form>
  );
};

const TodoManager = ({ clientId, meetingId, title = "Todos", showPrevious = false }) => {
  const [showForm, setShowForm] = useState(false);

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['client-todos', clientId],
    queryFn: () => fetchClientTodos(clientId),
    enabled: !!clientId,
  });

  const meetingTodos = todos.filter(todo => 
    showPrevious ? 
      (todo.meeting_id && todo.meeting_id !== meetingId) :
      (!todo.meeting_id || todo.meeting_id === meetingId)
  );

  const pendingTodos = meetingTodos.filter(todo => todo.status === 'pending');
  const completedTodos = meetingTodos.filter(todo => todo.status === 'complete');
  const inProgressTodos = meetingTodos.filter(todo => todo.status === 'in_progress');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-figmints-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {!showPrevious && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Todo
          </button>
        )}
      </div>

      {/* Todo Lists */}
      {inProgressTodos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3">
            In Progress ({inProgressTodos.length})
          </h4>
          <div className="space-y-3">
            {inProgressTodos.map(todo => (
              <TodoItem key={todo.id} todo={todo} compact />
            ))}
          </div>
        </div>
      )}

      {pendingTodos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Pending ({pendingTodos.length})
          </h4>
          <div className="space-y-3">
            {pendingTodos.map(todo => (
              <TodoItem key={todo.id} todo={todo} compact />
            ))}
          </div>
        </div>
      )}

      {completedTodos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-3">
            Completed ({completedTodos.length})
          </h4>
          <div className="space-y-3">
            {completedTodos.map(todo => (
              <TodoItem key={todo.id} todo={todo} compact />
            ))}
          </div>
        </div>
      )}

      {meetingTodos.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>{showPrevious ? 'No previous todos to review' : 'No todos created yet'}</p>
          {!showPrevious && (
            <button
              onClick={() => setShowForm(true)}
              className="text-figmints-primary hover:text-figmints-primary-dark font-medium mt-2"
            >
              Create your first todo
            </button>
          )}
        </div>
      )}

      {/* Add Todo Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Create New Todo"
        size="md"
      >
        <TodoForm
          clientId={clientId}
          meetingId={meetingId}
          onClose={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
};

export default TodoManager;