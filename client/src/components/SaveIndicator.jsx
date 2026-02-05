import React from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  CloudIcon
} from '@heroicons/react/24/outline';

const SaveIndicator = ({ status, lastSaved, autoSave = false, className = '' }) => {
  const getStatusDisplay = () => {
    switch (status) {
      case 'saving':
        return {
          icon: ArrowPathIcon,
          text: 'Saving...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      
      case 'saved':
        return {
          icon: CheckCircleIcon,
          text: 'Saved',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      
      case 'error':
        return {
          icon: ExclamationTriangleIcon,
          text: 'Save failed',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      
      case 'auto-saved':
        return {
          icon: CloudIcon,
          text: 'Auto-saved',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
      
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();
  if (!statusDisplay) return null;

  const IconComponent = statusDisplay.icon;

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const saved = new Date(timestamp);
    const diffMs = now - saved;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return saved.toLocaleDateString();
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border ${statusDisplay.bgColor} ${statusDisplay.borderColor} ${className}`}>
      <IconComponent 
        className={`h-4 w-4 ${statusDisplay.color} ${status === 'saving' ? 'animate-spin' : ''}`}
      />
      <span className={`ml-2 text-sm font-medium ${statusDisplay.color}`}>
        {statusDisplay.text}
      </span>
      {lastSaved && status !== 'saving' && (
        <span className="ml-2 text-xs text-gray-500">
          {formatTimeAgo(lastSaved)}
        </span>
      )}
    </div>
  );
};

export default SaveIndicator;