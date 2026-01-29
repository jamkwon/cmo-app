import db from './database.js';

const seedData = () => {
  console.log('Seeding database...');

  // Clear existing data
  db.exec('DELETE FROM clients');
  db.exec('DELETE FROM meetings');
  db.exec('DELETE FROM big_wins');
  db.exec('DELETE FROM scorecard_items');
  db.exec('DELETE FROM todos');
  db.exec('DELETE FROM campaign_updates');
  db.exec('DELETE FROM big_ideas');
  db.exec('DELETE FROM timeline_items');

  // Reset auto-increment
  db.exec('DELETE FROM sqlite_sequence');

  // Sample clients
  const clients = [
    {
      name: 'Acme Corp',
      url: 'https://acmecorp.com',
      address: '123 Tech Street, Silicon Valley, CA 94101',
      client_name: 'Sarah Johnson',
      client_contact: 'sarah@acmecorp.com',
      preferred_contact: 'email',
      account_manager: 'Alex Rivera',
      am_email: 'alex@figmints.com',
      strategist: 'Morgan Chen',
      strat_email: 'morgan@figmints.com',
      regular_meeting_date: 'First Monday of each month',
      passwords_access: JSON.stringify({
        email: { platform: 'Gmail', username: 'sarah@acmecorp.com', password: 'stored_securely' },
        social: { platform: 'LinkedIn', username: 'acmecorp', password: 'stored_securely' },
        crm: { platform: 'HubSpot', username: 'sarah@acmecorp.com', password: 'stored_securely' }
      }),
      important_links: JSON.stringify([
        { name: 'Analytics Dashboard', url: 'https://analytics.acmecorp.com' },
        { name: 'Brand Guidelines', url: 'https://brand.acmecorp.com' },
        { name: 'Content Calendar', url: 'https://calendar.acmecorp.com' }
      ])
    },
    {
      name: 'Green Leaf Co',
      url: 'https://greenleafco.com',
      address: '456 Eco Way, Portland, OR 97201',
      client_name: 'David Martinez',
      client_contact: 'david@greenleafco.com',
      preferred_contact: 'phone',
      account_manager: 'Jamie Park',
      am_email: 'jamie@figmints.com',
      strategist: 'Taylor Kim',
      strat_email: 'taylor@figmints.com',
      regular_meeting_date: 'Second Wednesday of each month',
      passwords_access: JSON.stringify({
        email: { platform: 'Gmail', username: 'david@greenleafco.com', password: 'stored_securely' },
        social: { platform: 'Instagram', username: 'greenleafco', password: 'stored_securely' },
        cms: { platform: 'WordPress', username: 'admin', password: 'stored_securely' }
      }),
      important_links: JSON.stringify([
        { name: 'E-commerce Store', url: 'https://shop.greenleafco.com' },
        { name: 'Sustainability Report', url: 'https://greenleafco.com/sustainability' }
      ])
    },
    {
      name: 'Urban Fitness',
      url: 'https://urbanfitness.com',
      address: '789 Gym Street, Austin, TX 73301',
      client_name: 'Lisa Thompson',
      client_contact: 'lisa@urbanfitness.com',
      preferred_contact: 'slack',
      account_manager: 'Sam Rodriguez',
      am_email: 'sam@figmints.com',
      strategist: 'Casey Liu',
      strat_email: 'casey@figmints.com',
      regular_meeting_date: 'Last Friday of each month',
      passwords_access: JSON.stringify({
        email: { platform: 'Outlook', username: 'lisa@urbanfitness.com', password: 'stored_securely' },
        social: { platform: 'TikTok', username: 'urbanfitness', password: 'stored_securely' },
        booking: { platform: 'ClassPass', username: 'urbanfitness', password: 'stored_securely' }
      }),
      important_links: JSON.stringify([
        { name: 'Class Schedule', url: 'https://urbanfitness.com/schedule' },
        { name: 'Member Portal', url: 'https://members.urbanfitness.com' },
        { name: 'Trainer Resources', url: 'https://trainers.urbanfitness.com' }
      ])
    }
  ];

  const clientStmt = db.prepare(`
    INSERT INTO clients (
      name, url, address, client_name, client_contact, preferred_contact,
      account_manager, am_email, strategist, strat_email, regular_meeting_date,
      passwords_access, important_links
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const clientIds = [];
  clients.forEach(client => {
    const result = clientStmt.run(
      client.name, client.url, client.address, client.client_name, client.client_contact,
      client.preferred_contact, client.account_manager, client.am_email, client.strategist,
      client.strat_email, client.regular_meeting_date, client.passwords_access, client.important_links
    );
    clientIds.push(result.lastInsertRowid);
  });

  // Sample scorecard items
  const scorecardItems = [
    // Acme Corp scorecard
    { client_id: clientIds[0], name: 'Website Traffic', goal_min: 10000, goal_max: 15000, current_value: 12500 },
    { client_id: clientIds[0], name: 'Lead Generation', goal_min: 50, goal_max: 100, current_value: 75 },
    { client_id: clientIds[0], name: 'Conversion Rate (%)', goal_min: 2.0, goal_max: 4.0, current_value: 3.2 },
    { client_id: clientIds[0], name: 'Social Media Followers', goal_min: 5000, goal_max: 10000, current_value: 7800 },
    
    // Green Leaf Co scorecard
    { client_id: clientIds[1], name: 'E-commerce Sales', goal_min: 25000, goal_max: 40000, current_value: 32000 },
    { client_id: clientIds[1], name: 'Email Subscribers', goal_min: 2000, goal_max: 5000, current_value: 3400 },
    { client_id: clientIds[1], name: 'Instagram Engagement (%)', goal_min: 3.0, goal_max: 6.0, current_value: 4.5 },
    { client_id: clientIds[1], name: 'Product Reviews', goal_min: 20, goal_max: 50, current_value: 35 },
    
    // Urban Fitness scorecard
    { client_id: clientIds[2], name: 'Class Bookings', goal_min: 200, goal_max: 350, current_value: 280 },
    { client_id: clientIds[2], name: 'Member Retention (%)', goal_min: 80, goal_max: 95, current_value: 87 },
    { client_id: clientIds[2], name: 'Social Media Reach', goal_min: 15000, goal_max: 30000, current_value: 22000 },
    { client_id: clientIds[2], name: 'New Member Sign-ups', goal_min: 15, goal_max: 30, current_value: 18 }
  ];

  const scorecardStmt = db.prepare(`
    INSERT INTO scorecard_items (client_id, name, goal_min, goal_max, current_value)
    VALUES (?, ?, ?, ?, ?)
  `);

  scorecardItems.forEach(item => {
    scorecardStmt.run(item.client_id, item.name, item.goal_min, item.goal_max, item.current_value);
  });

  // Sample meetings
  const meetings = [
    { client_id: clientIds[0], meeting_date: '2024-01-08', status: 'completed', meeting_score_avg: 8.5 },
    { client_id: clientIds[1], meeting_date: '2024-01-10', status: 'completed', meeting_score_avg: 9.0 },
    { client_id: clientIds[2], meeting_date: '2024-01-26', status: 'completed', meeting_score_avg: 7.5 },
    { client_id: clientIds[0], meeting_date: '2024-02-05', status: 'in_progress', meeting_score_avg: null }
  ];

  const meetingStmt = db.prepare(`
    INSERT INTO meetings (client_id, meeting_date, status, meeting_score_avg)
    VALUES (?, ?, ?, ?)
  `);

  const meetingIds = [];
  meetings.forEach(meeting => {
    const result = meetingStmt.run(meeting.client_id, meeting.meeting_date, meeting.status, meeting.meeting_score_avg);
    meetingIds.push(result.lastInsertRowid);
  });

  // Sample big wins
  const bigWins = [
    { meeting_id: meetingIds[0], title: 'Q4 Revenue Target Exceeded', description: 'Achieved 112% of quarterly revenue goal through optimized ad campaigns' },
    { meeting_id: meetingIds[0], title: 'New Partnership Signed', description: 'Secured strategic partnership with TechFlow Solutions' },
    { meeting_id: meetingIds[1], title: 'Sustainability Certification', description: 'Received B-Corp certification, great for brand positioning' },
    { meeting_id: meetingIds[1], title: 'Viral Social Post', description: 'Earth Day post reached 100K+ impressions organically' },
    { meeting_id: meetingIds[2], title: 'New Location Launch', description: 'Successfully opened second location with 50+ founding members' }
  ];

  const winsStmt = db.prepare(`
    INSERT INTO big_wins (meeting_id, title, description) VALUES (?, ?, ?)
  `);

  bigWins.forEach(win => {
    winsStmt.run(win.meeting_id, win.title, win.description);
  });

  // Sample todos
  const todos = [
    { client_id: clientIds[0], title: 'Update website homepage copy', assigned_to: 'us', status: 'in_progress', due_date: '2024-02-15' },
    { client_id: clientIds[0], title: 'Provide Q1 budget allocation', assigned_to: 'client', status: 'pending', due_date: '2024-02-10' },
    { client_id: clientIds[1], title: 'Launch spring product campaign', assigned_to: 'us', status: 'pending', due_date: '2024-03-01' },
    { client_id: clientIds[1], title: 'Review and approve social content calendar', assigned_to: 'client', status: 'complete', due_date: '2024-01-20' },
    { client_id: clientIds[2], title: 'Set up Google Analytics 4', assigned_to: 'us', status: 'complete', due_date: '2024-01-30' },
    { client_id: clientIds[2], title: 'Hire fitness influencer for partnership', assigned_to: 'client', status: 'pending', due_date: '2024-02-20' }
  ];

  const todoStmt = db.prepare(`
    INSERT INTO todos (client_id, title, assigned_to, status, due_date, completed_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  todos.forEach(todo => {
    const completed_at = todo.status === 'complete' ? '2024-01-25T10:00:00Z' : null;
    todoStmt.run(todo.client_id, todo.title, todo.assigned_to, todo.status, todo.due_date, completed_at);
  });

  // Sample campaign updates
  const campaigns = [
    { client_id: clientIds[0], name: 'Q1 Product Launch', phase: 'Awareness', progress_percent: 65 },
    { client_id: clientIds[0], name: 'Brand Refresh Campaign', phase: 'Strategy', progress_percent: 25 },
    { client_id: clientIds[1], name: 'Spring Collection Promo', phase: 'Creative Development', progress_percent: 80 },
    { client_id: clientIds[2], name: 'New Year Fitness Challenge', phase: 'Optimization', progress_percent: 90 }
  ];

  const campaignStmt = db.prepare(`
    INSERT INTO campaign_updates (client_id, name, phase, progress_percent) VALUES (?, ?, ?, ?)
  `);

  campaigns.forEach(campaign => {
    campaignStmt.run(campaign.client_id, campaign.name, campaign.phase, campaign.progress_percent);
  });

  // Sample big ideas
  const bigIdeas = [
    { client_id: clientIds[0], title: 'AI Chatbot Integration', description: 'Implement AI-powered customer service chatbot', priority: 1 },
    { client_id: clientIds[0], title: 'Mobile App Development', description: 'Create companion mobile app for better user experience', priority: 2 },
    { client_id: clientIds[1], title: 'Subscription Box Service', description: 'Launch monthly eco-friendly product subscription', priority: 1 },
    { client_id: clientIds[2], title: 'Virtual Fitness Platform', description: 'Develop online workout platform for remote users', priority: 1 }
  ];

  const ideasStmt = db.prepare(`
    INSERT INTO big_ideas (client_id, title, description, priority) VALUES (?, ?, ?, ?)
  `);

  bigIdeas.forEach(idea => {
    ideasStmt.run(idea.client_id, idea.title, idea.description, idea.priority);
  });

  console.log('Database seeded successfully!');
  console.log(`Created ${clientIds.length} clients`);
  console.log(`Created ${scorecardItems.length} scorecard items`);
  console.log(`Created ${meetingIds.length} meetings`);
  console.log(`Created ${bigWins.length} big wins`);
  console.log(`Created ${todos.length} todos`);
  console.log(`Created ${campaigns.length} campaigns`);
  console.log(`Created ${bigIdeas.length} big ideas`);
};

// Run the seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData();
}

export default seedData;