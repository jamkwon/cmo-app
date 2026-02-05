import React, { useState } from 'react';
import { CheckCircleIcon, ClockIcon, ChartBarIcon, LightBulbIcon, SpeakerphoneIcon, ClipboardListIcon, StarIcon } from '@heroicons/react/24/outline';

const MeetingWorkflow = () => {
  const [activeSection, setActiveSection] = useState('big-wins');
  const [meetingData, setMeetingData] = useState({
    bigWins: '',
    scorecard: [],
    todos: [],
    campaigns: [],
    ids: '',
    headlines: '',
    newTodos: [],
    meetingScore: null
  });

  const sections = [
    { id: 'big-wins', name: 'Big Wins', icon: CheckCircleIcon, color: 'bg-green-500' },
    { id: 'scorecard', name: 'Scorecard', icon: ChartBarIcon, color: 'bg-blue-500' },
    { id: 'todo-recap', name: 'To-do Recap', icon: ClockIcon, color: 'bg-yellow-500' },
    { id: 'campaigns', name: 'Campaign Progress', icon: SpeakerphoneIcon, color: 'bg-purple-500' },
    { id: 'ids', name: 'IDS', icon: LightBulbIcon, color: 'bg-orange-500' },
    { id: 'headlines', name: 'Headlines', icon: ClipboardListIcon, color: 'bg-indigo-500' },
    { id: 'new-todos', name: 'New To-dos', icon: ClipboardListIcon, color: 'bg-red-500' },
    { id: 'scoring', name: 'Meeting Score', icon: StarIcon, color: 'bg-yellow-400' }
  ];

  const BigWinsSection = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">🎉 Client Big Wins</h2>
      <p className="text-gray-600">Start the meeting by capturing the client's recent accomplishments and victories.</p>
      
      <textarea
        className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        placeholder="What big wins has the client achieved since our last meeting?

Examples:
• Increased website conversions by 15%
• Closed a major deal worth $50k
• Launched new product line successfully
• Received positive customer feedback"
        value={meetingData.bigWins}
        onChange={(e) => setMeetingData(prev => ({ ...prev, bigWins: e.target.value }))}
      />
    </div>
  );

  const ScorecardSection = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">📊 Scorecard Review</h2>
      <p className="text-gray-600">Review key metrics against goals and track progress.</p>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-5 gap-4 mb-4 font-semibold text-gray-700">
          <div>Metric</div>
          <div>Goal</div>
          <div>Current</div>
          <div>Previous</div>
          <div>Trend</div>
        </div>
        
        {/* Sample scorecard items - this would be dynamic */}
        {[
          { metric: 'Website Traffic', goal: '10,000', current: '8,500', previous: '7,200', trend: 'up' },
          { metric: 'Conversion Rate', goal: '3.5%', current: '3.1%', previous: '2.8%', trend: 'up' },
          { metric: 'Monthly Revenue', goal: '$50,000', current: '$42,000', previous: '$38,000', trend: 'up' }
        ].map((item, index) => (
          <div key={index} className="grid grid-cols-5 gap-4 py-2 border-t">
            <div className="font-medium">{item.metric}</div>
            <div>{item.goal}</div>
            <div className="font-semibold">{item.current}</div>
            <div className="text-gray-500">{item.previous}</div>
            <div>
              {item.trend === 'up' ? (
                <span className="text-green-500">↗️ Trending up</span>
              ) : (
                <span className="text-red-500">↘️ Trending down</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TodoRecapSection = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">✅ To-do Recap</h2>
      <p className="text-gray-600">Review previous action items and update their status.</p>
      
      <div className="space-y-3">
        {/* Sample previous todos */}
        {[
          { task: 'Update website copy on homepage', status: 'completed', assignee: 'Client' },
          { task: 'Set up Google Analytics tracking', status: 'in-progress', assignee: 'Figmints' },
          { task: 'Prepare Q4 marketing budget', status: 'on-hold', assignee: 'Client' }
        ].map((todo, index) => (
          <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium">{todo.task}</div>
              <div className="text-sm text-gray-500">Assigned to: {todo.assignee}</div>
            </div>
            <select className="border border-gray-300 rounded px-3 py-1">
              <option value="completed" selected={todo.status === 'completed'}>✅ Completed</option>
              <option value="in-progress" selected={todo.status === 'in-progress'}>🔄 In Progress</option>
              <option value="on-hold" selected={todo.status === 'on-hold'}>⏸️ On Hold</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );

  const CampaignsSection = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">🚀 Campaign Progress</h2>
      <p className="text-gray-600">Review ongoing marketing campaigns and their current status.</p>
      
      <div className="grid gap-4">
        {[
          { name: 'Q4 Email Marketing Campaign', status: 'Active', progress: 75, metrics: 'Open rate: 24% | CTR: 3.2%' },
          { name: 'Google Ads - Holiday Promotion', status: 'Active', progress: 50, metrics: 'CPC: $1.25 | Conv. Rate: 2.8%' },
          { name: 'Social Media Content Series', status: 'Planning', progress: 25, metrics: 'Posts planned: 12 | Scheduled: 3' }
        ].map((campaign, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{campaign.name}</h3>
                <div className="text-sm text-gray-500">{campaign.metrics}</div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                campaign.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {campaign.status}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full" 
                style={{ width: `${campaign.progress}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500 mt-1">{campaign.progress}% complete</div>
          </div>
        ))}
      </div>
    </div>
  );

  const IDSSection = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">🎯 IDS: Identify, Discuss, Solve</h2>
      <p className="text-gray-600">Address issues, workshop strategy, and solve problems together.</p>
      
      <textarea
        className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        placeholder="Issues to identify, discuss, and solve:

• What challenges are we facing?
• Strategy questions that need workshopping
• Roadblocks that need solutions
• Opportunities to explore

Notes and solutions:"
        value={meetingData.ids}
        onChange={(e) => setMeetingData(prev => ({ ...prev, ids: e.target.value }))}
      />
    </div>
  );

  const HeadlinesSection = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">📰 Headlines & Admin</h2>
      <p className="text-gray-600">Administrative items, next meeting dates, and Figmints team updates.</p>
      
      <textarea
        className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="Headlines and administrative items:

• Next meeting date: [Date/Time]
• Figmints team updates
• Important announcements
• Administrative reminders
• Schedule changes"
        value={meetingData.headlines}
        onChange={(e) => setMeetingData(prev => ({ ...prev, headlines: e.target.value }))}
      />
    </div>
  );

  const NewTodosSection = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">📋 New To-dos</h2>
      <p className="text-gray-600">Action items created during this meeting that carry forward to next session.</p>
      
      <div className="space-y-3">
        <div className="flex space-x-2">
          <input 
            type="text" 
            placeholder="Enter new action item..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <select className="border border-gray-300 rounded-lg px-3">
            <option>Figmints</option>
            <option>Client</option>
            <option>Both</option>
          </select>
          <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
            Add
          </button>
        </div>
        
        {/* Sample new todos */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
            <div className="flex-1">Review and approve new ad creative designs</div>
            <div className="text-sm text-gray-500">Assigned: Client</div>
            <button className="text-red-500 hover:text-red-700">Remove</button>
          </div>
        </div>
      </div>
    </div>
  );

  const ScoringSection = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">⭐ Meeting Score</h2>
      <p className="text-gray-600">Rate this meeting out of 10 to track session quality.</p>
      
      <div className="flex space-x-2 justify-center">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
          <button
            key={score}
            onClick={() => setMeetingData(prev => ({ ...prev, meetingScore: score }))}
            className={`w-12 h-12 rounded-full border-2 font-bold ${
              meetingData.meetingScore === score 
                ? 'bg-yellow-400 border-yellow-500 text-white' 
                : 'border-gray-300 hover:border-yellow-400'
            }`}
          >
            {score}
          </button>
        ))}
      </div>
      
      {meetingData.meetingScore && (
        <div className="text-center text-lg font-semibold">
          Meeting scored: {meetingData.meetingScore}/10
        </div>
      )}
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'big-wins': return <BigWinsSection />;
      case 'scorecard': return <ScorecardSection />;
      case 'todo-recap': return <TodoRecapSection />;
      case 'campaigns': return <CampaignsSection />;
      case 'ids': return <IDSSection />;
      case 'headlines': return <HeadlinesSection />;
      case 'new-todos': return <NewTodosSection />;
      case 'scoring': return <ScoringSection />;
      default: return <BigWinsSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="text-red-500">FIGMINTS</span> CMO
              </h1>
              <p className="text-gray-600">Client Meeting Workflow</p>
            </div>
            <div className="text-sm text-gray-500">
              Client: Acme Corp • Date: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? `${section.color} text-white`
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingWorkflow;