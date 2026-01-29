import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChartBarIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon } from '@heroicons/react/24/outline';

const fetchScorecardItems = async (clientId) => {
  const response = await fetch(`http://localhost:3456/api/clients/${clientId}/scorecard-items`);
  if (!response.ok) throw new Error('Failed to fetch scorecard items');
  return response.json();
};

const ScorecardMetric = ({ item, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(item.current_value || '');

  const getStatus = () => {
    if (!item.current_value || !item.goal_min || !item.goal_max) return 'neutral';
    if (item.current_value >= item.goal_min && item.current_value <= item.goal_max) return 'good';
    if (item.current_value < item.goal_min) return 'below';
    return 'above';
  };

  const getTrend = () => {
    if (!item.current_value || !item.previous_value) return 'neutral';
    if (item.current_value > item.previous_value) return 'up';
    if (item.current_value < item.previous_value) return 'down';
    return 'neutral';
  };

  const status = getStatus();
  const trend = getTrend();

  const statusColors = {
    good: 'bg-green-500',
    below: 'bg-red-500',
    above: 'bg-blue-500',
    neutral: 'bg-gray-400'
  };

  const statusLabels = {
    good: 'On Target',
    below: 'Below Goal',
    above: 'Above Goal',
    neutral: 'No Target'
  };

  const TrendIcon = trend === 'up' ? TrendingUpIcon : trend === 'down' ? TrendingDownIcon : MinusIcon;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400';

  const handleSave = () => {
    const newValue = parseFloat(currentValue);
    if (!isNaN(newValue) && onUpdate) {
      onUpdate(item.id, newValue);
    }
    setIsEditing(false);
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">{item.name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Goal: {item.goal_min} - {item.goal_max}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <TrendIcon className={`h-5 w-5 ${trendColor}`} />
          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>
      </div>

      {/* Current Value Display/Edit */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Value
          </label>
          {isEditing ? (
            <div className="flex space-x-2">
              <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="input flex-1"
                placeholder="Enter current value"
                step="0.01"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
              />
              <button onClick={handleSave} className="btn-primary">Save</button>
              <button 
                onClick={() => setIsEditing(false)} 
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {item.current_value || 'Not Set'}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-figmints-primary hover:text-figmints-primary-dark text-sm font-medium"
              >
                Update
              </button>
            </div>
          )}
        </div>

        {/* Previous Value */}
        {item.previous_value && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Previous Value
            </label>
            <span className="text-lg text-gray-600 dark:text-gray-400">
              {item.previous_value}
            </span>
          </div>
        )}

        {/* Progress Bar */}
        {item.goal_min && item.goal_max && item.current_value && (
          <div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>{item.goal_min}</span>
              <span>{item.goal_max}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${statusColors[status]}`}
                style={{
                  width: `${Math.min(100, Math.max(0, ((item.current_value - item.goal_min) / (item.goal_max - item.goal_min)) * 100))}%`
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Min Goal</span>
              <span>Max Goal</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ScorecardManager = ({ clientId }) => {
  const { data: scorecardItems = [], isLoading } = useQuery({
    queryKey: ['scorecard-items', clientId],
    queryFn: () => fetchScorecardItems(clientId),
    enabled: !!clientId,
  });

  const handleUpdateValue = (itemId, newValue) => {
    // TODO: Implement API call to update scorecard value
    console.log('Updating scorecard item:', itemId, 'with value:', newValue);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-figmints-primary"></div>
      </div>
    );
  }

  if (scorecardItems.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <ChartBarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No Scorecard Metrics</p>
        <p className="text-sm">Set up scorecard metrics in client settings to track performance.</p>
        <button className="mt-4 text-figmints-primary hover:text-figmints-primary-dark font-medium">
          Configure Scorecard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scorecardItems.map((item) => (
          <ScorecardMetric 
            key={item.id} 
            item={item} 
            onUpdate={handleUpdateValue}
          />
        ))}
      </div>
      
      {/* Summary Stats */}
      <div className="card p-6 bg-gray-50 dark:bg-gray-800/50">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Summary</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {scorecardItems.filter(item => {
                const val = item.current_value;
                return val && item.goal_min && item.goal_max && val >= item.goal_min && val <= item.goal_max;
              }).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">On Target</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {scorecardItems.filter(item => {
                const val = item.current_value;
                return val && item.goal_min && val < item.goal_min;
              }).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Below Goal</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {scorecardItems.filter(item => {
                const val = item.current_value;
                return val && item.goal_max && val > item.goal_max;
              }).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Above Goal</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScorecardManager;