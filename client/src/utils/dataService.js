// Data Service - Handles localStorage backup and session management

export const DataService = {
  // Client Management
  clients: {
    getAll: () => {
      const clients = localStorage.getItem('cmo-clients');
      return clients ? JSON.parse(clients) : [
        { id: 1, name: 'Acme Corp', industry: 'Technology', lastMeeting: '2024-01-15' },
        { id: 2, name: 'Blue Ocean LLC', industry: 'Marketing', lastMeeting: '2024-01-12' },
        { id: 3, name: 'Creative Solutions', industry: 'Design', lastMeeting: '2024-01-08' }
      ];
    },
    
    save: (clients) => {
      localStorage.setItem('cmo-clients', JSON.stringify(clients));
    },
    
    add: (client) => {
      const clients = DataService.clients.getAll();
      const newClient = { 
        ...client, 
        id: Math.max(...clients.map(c => c.id), 0) + 1,
        lastMeeting: new Date().toISOString().split('T')[0]
      };
      clients.push(newClient);
      DataService.clients.save(clients);
      return newClient;
    }
  },

  // Session Management
  sessions: {
    save: (sessionData, clientId, meetingId) => {
      const sessionKey = `cmo-session-${clientId}-${meetingId}`;
      const sessionInfo = {
        ...sessionData,
        lastSaved: new Date().toISOString(),
        clientId,
        meetingId
      };
      localStorage.setItem(sessionKey, JSON.stringify(sessionInfo));
      
      // Update session list
      const sessionList = DataService.sessions.getList();
      const existingIndex = sessionList.findIndex(s => s.key === sessionKey);
      const sessionListItem = {
        key: sessionKey,
        clientId,
        meetingId,
        clientName: DataService.clients.getAll().find(c => c.id === clientId)?.name || 'Unknown',
        lastSaved: sessionInfo.lastSaved,
        meetingDate: sessionData.meetingDate || new Date().toISOString().split('T')[0]
      };
      
      if (existingIndex >= 0) {
        sessionList[existingIndex] = sessionListItem;
      } else {
        sessionList.unshift(sessionListItem);
      }
      
      localStorage.setItem('cmo-session-list', JSON.stringify(sessionList));
    },

    load: (clientId, meetingId) => {
      const sessionKey = `cmo-session-${clientId}-${meetingId}`;
      const session = localStorage.getItem(sessionKey);
      return session ? JSON.parse(session) : null;
    },

    getList: () => {
      const list = localStorage.getItem('cmo-session-list');
      return list ? JSON.parse(list) : [];
    },

    delete: (clientId, meetingId) => {
      const sessionKey = `cmo-session-${clientId}-${meetingId}`;
      localStorage.removeItem(sessionKey);
      
      const sessionList = DataService.sessions.getList();
      const updatedList = sessionList.filter(s => s.key !== sessionKey);
      localStorage.setItem('cmo-session-list', JSON.stringify(updatedList));
    }
  },

  // Meeting Data Backup (localStorage fallback)
  meetingData: {
    save: (data, clientId, meetingDate) => {
      const key = `cmo-meeting-${clientId}-${meetingDate}`;
      const backup = {
        ...data,
        backupTimestamp: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(backup));
    },

    load: (clientId, meetingDate) => {
      const key = `cmo-meeting-${clientId}-${meetingDate}`;
      const backup = localStorage.getItem(key);
      return backup ? JSON.parse(backup) : null;
    },

    getAutoSaveKey: () => {
      return 'cmo-meeting-autosave';
    },

    autoSave: (data) => {
      localStorage.setItem(DataService.meetingData.getAutoSaveKey(), JSON.stringify({
        ...data,
        autoSavedAt: new Date().toISOString()
      }));
    },

    loadAutoSave: () => {
      const autoSave = localStorage.getItem(DataService.meetingData.getAutoSaveKey());
      return autoSave ? JSON.parse(autoSave) : null;
    },

    clearAutoSave: () => {
      localStorage.removeItem(DataService.meetingData.getAutoSaveKey());
    }
  },

  // Export functionality
  export: {
    generateSummary: (meetingData, clientName, meetingDate) => {
      let summary = `# CMO Meeting Summary\n\n`;
      summary += `**Client:** ${clientName}\n`;
      summary += `**Date:** ${meetingDate}\n`;
      summary += `**Meeting Score:** ${meetingData.meetingScore || 'Not scored'}/10\n\n`;

      if (meetingData.bigWins) {
        summary += `## 🌟 Big Wins\n${meetingData.bigWins}\n\n`;
      }

      if (meetingData.scorecard?.length > 0) {
        summary += `## 📊 Scorecard\n`;
        meetingData.scorecard.forEach(metric => {
          const progress = metric.goal > 0 ? ((metric.current / metric.goal) * 100).toFixed(1) : 0;
          summary += `- **${metric.name}**: ${metric.current}/${metric.goal} (${progress}%)\n`;
        });
        summary += '\n';
      }

      if (meetingData.todoRecap?.length > 0) {
        summary += `## ✅ To-do Recap\n`;
        meetingData.todoRecap.forEach(todo => {
          summary += `- [${todo.status}] ${todo.item}\n`;
          if (todo.notes) summary += `  - ${todo.notes}\n`;
        });
        summary += '\n';
      }

      if (meetingData.campaigns?.length > 0) {
        summary += `## 🚀 Campaign Progress\n`;
        meetingData.campaigns.forEach(campaign => {
          summary += `- **${campaign.name}** (${campaign.status}): ${campaign.progress}\n`;
        });
        summary += '\n';
      }

      if (meetingData.ids?.identify || meetingData.ids?.discuss || meetingData.ids?.solve) {
        summary += `## 🔍 IDS (Identify, Discuss, Solve)\n`;
        if (meetingData.ids.identify) summary += `**Identify:** ${meetingData.ids.identify}\n\n`;
        if (meetingData.ids.discuss) summary += `**Discuss:** ${meetingData.ids.discuss}\n\n`;
        if (meetingData.ids.solve) summary += `**Solve:** ${meetingData.ids.solve}\n\n`;
      }

      if (meetingData.headlines?.nextMeetingDate || meetingData.headlines?.teamUpdates) {
        summary += `## 📝 Headlines & Admin\n`;
        if (meetingData.headlines.nextMeetingDate) {
          const nextMeeting = new Date(meetingData.headlines.nextMeetingDate);
          summary += `**Next Meeting:** ${nextMeeting.toLocaleDateString()} at ${nextMeeting.toLocaleTimeString()}\n`;
        }
        if (meetingData.headlines.teamUpdates) {
          summary += `**Team Updates:** ${meetingData.headlines.teamUpdates}\n`;
        }
        summary += '\n';
      }

      if (meetingData.newTodos?.length > 0) {
        summary += `## 📋 New To-dos\n`;
        meetingData.newTodos.forEach(todo => {
          summary += `- [ ] ${todo.item}\n`;
        });
        summary += '\n';
      }

      summary += `---\n*Generated on ${new Date().toLocaleString()} by FIGMINTS CMO Workflow*`;
      return summary;
    },

    downloadAsText: (content, filename) => {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },

    downloadAsJson: (data, filename) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
};

export default DataService;