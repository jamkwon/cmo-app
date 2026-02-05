import db from './database.js';

// Clear existing data
db.exec('DELETE FROM clients');

// Sample client data
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

// Insert client data
const insertClient = db.prepare(`
  INSERT INTO clients (
    name, url, address, client_name, client_contact, preferred_contact,
    account_manager, am_email, strategist, strat_email, regular_meeting_date,
    passwords_access, important_links
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

clients.forEach(client => {
  insertClient.run(
    client.name, client.url, client.address, client.client_name,
    client.client_contact, client.preferred_contact, client.account_manager,
    client.am_email, client.strategist, client.strat_email,
    client.regular_meeting_date, client.passwords_access, client.important_links
  );
});

console.log(`Seeded ${clients.length} clients successfully!`);