import db from './database.js';
import { createUser } from './auth.js';

const seedAuthData = async () => {
  try {
    console.log('🌱 Seeding authentication data...');

    // Check if we already have users
    const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (existingUsers.count > 0) {
      console.log('✅ Users already exist, skipping seed');
      return;
    }

    // Get some clients to assign to client users
    const clients = db.prepare('SELECT * FROM clients LIMIT 3').all();
    
    if (clients.length === 0) {
      console.log('⚠️  No clients found. Please run the main seed script first.');
      return;
    }

    // Create admin user
    console.log('Creating admin user...');
    await createUser({
      email: 'admin@figmints.com',
      password: 'admin123',
      role: 'admin',
      first_name: 'Admin',
      last_name: 'User'
    });

    // Create client users
    console.log('Creating client users...');
    for (let i = 0; i < Math.min(clients.length, 3); i++) {
      const client = clients[i];
      await createUser({
        email: `client${i + 1}@example.com`,
        password: 'client123',
        role: 'client',
        client_id: client.id,
        first_name: `Client${i + 1}`,
        last_name: 'User'
      });
    }

    // Create a demo client user with a specific email
    if (clients.length > 0) {
      await createUser({
        email: 'client@example.com',
        password: 'client123',
        role: 'client',
        client_id: clients[0].id,
        first_name: 'Demo',
        last_name: 'Client'
      });
    }

    console.log('✅ Authentication seed data created successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('Admin: admin@figmints.com / admin123');
    console.log('Client: client@example.com / client123');

  } catch (error) {
    console.error('❌ Error seeding authentication data:', error);
  }
};

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAuthData().then(() => {
    process.exit(0);
  });
}

export default seedAuthData;