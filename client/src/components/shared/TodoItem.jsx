import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  UserIcon, 
  CalendarIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { API_BASE_URL } from '../../config/api';

const updateTodo = async (todoId, updates) => {
  const response = await fetch(`${API_BASE_URL}/api/todos/${todoId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update todo');
  return response.json();
};

const TodoItem = ({ todo, showClient = false, compact = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ todoId, updates }) => updateTodo(todoId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['todos']);
      queryClient.invalidateQueries(['client-todos']);
      setIsEditing(false);
    },
  });

  const toggleComplete = () => {
    const newStatus = todo.status === 'complete' ? 'pending' : 'complete';
    mutation.mutate({
      todoId: todo.id,
      updates: { ...todo, status: newStatus }
    });
  };

  const saveEdit = () => {
    if (editTitle.trim() !== todo.title) {
      mutation.mutate({
        todoId: todo.id,
        updates: { ...todo, title: editTitle.trim() }
      });
    } else {
      setIsEditing(false);
    }
  };

  const getStatusColor = () => {
    switch (todo.status) {
      case 'complete': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'carried_over': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && todo.status !== 'complete';

  if (compact) {
    return (
      <div className={`flex items-center space-x-3 p-3 rounded-lg border ${
        todo.status === 'complete' ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20' :
        isOverdue ? 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20' :
        'border-gray-200 dark:border-gray-700'
      }`}>
        <button
          onClick={toggleComplete}
          className={`flex-shrink-0 transition-colors ${getStatusColor()}`}
          disabled={mutation.isPending}
        >
          {todo.status === 'complete' ? (
            <CheckCircleIconSolid className="h-5 w-5" />
          ) : (
            <CheckCircleIcon className="h-5 w-5" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate ${
            todo.status === 'complete' ? 'text-green-700 dark:text-green-300 line-through' : 'text-gray-900 dark:text-white'
          }`}>
            {todo.title}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              todo.assigned_to === 'us' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
              'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
            }`}>
              {todo.assigned_to === 'us' ? 'FIGMINTS' : 'Client'}
            </span>
            {todo.due_date && (
              <span className={`text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                {new Date(todo.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card p-4 ${
      todo.status === 'complete' ? 'bg-green-50 dark:bg-green-900/20' :
      isOverdue ? 'bg-red-50 dark:bg-red-900/20' : ''
    }`}>
      <div className="flex items-start space-x-3">
        <button
          onClick={toggleComplete}
          className={`flex-shrink-0 mt-1 transition-colors ${getStatusColor()}`}
          disabled={mutation.isPending}
        >
          {todo.status === 'complete' ? (
            <CheckCircleIconSolid className="h-5 w-5" />
          ) : (
            <CheckCircleIcon className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                autoFocus
              />
              <div className="flex space-x-2">
                <button onClick={saveEdit} className="btn-primary text-sm">Save</button>
                <button onClick={() => setIsEditing(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <h4 className={`font-medium ${
                  todo.status === 'complete' ? 'text-green-700 dark:text-green-300 line-through' : 'text-gray-900 dark:text-white'
                }`}>
                  {todo.title}
                </h4>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>

              {todo.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{todo.description}</p>
              )}

              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-1 text-sm">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    todo.assigned_to === 'us' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                    'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
                  }`}>
                    {todo.assigned_to === 'us' ? 'FIGMINTS' : 'Client'}
                  </span>
                </div>

                {todo.due_date && (
                  <div className="flex items-center space-x-1 text-sm">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className={isOverdue ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}>
                      {new Date(todo.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-1 text-sm">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    todo.status === 'complete' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                    todo.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                  }`}>
                    {todo.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {showClient && todo.clientName && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Client: {todo.clientName}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoItem;