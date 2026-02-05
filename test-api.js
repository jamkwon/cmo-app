// Using built-in fetch (Node.js 18+)

const API_BASE = 'http://localhost:3458';

async function testAPI() {
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await fetch(`${API_BASE}/health`);
    console.log('Health:', await health.json());

    // Test login
    console.log('\n2. Testing admin login...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@figmints.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData.user.email);
    const token = loginData.token;

    // Test getting clients
    console.log('\n3. Testing get clients...');
    const clientsResponse = await fetch(`${API_BASE}/api/clients`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const clients = await clientsResponse.json();
    console.log('Clients:', clients.map(c => ({ id: c.id, name: c.name })));

    // Test creating a meeting
    console.log('\n4. Testing create meeting...');
    const firstClient = clients[0];
    const meetingResponse = await fetch(`${API_BASE}/api/clients/${firstClient.id}/meetings`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        meeting_date: '2026-02-10T14:00:00',
        notes: 'Test meeting from API',
        status: 'draft'
      })
    });
    
    if (meetingResponse.ok) {
      const meeting = await meetingResponse.json();
      console.log('Meeting created successfully:', { id: meeting.id, date: meeting.meeting_date });
    } else {
      const error = await meetingResponse.json();
      console.error('Meeting creation failed:', error);
    }

    // Test creating a client (admin only)
    console.log('\n5. Testing create client...');
    const newClientResponse = await fetch(`${API_BASE}/api/clients`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Client Co',
        account_manager: 'Test Manager',
        client_name: 'Test Contact',
        client_contact: 'test@testclient.com'
      })
    });
    
    if (newClientResponse.ok) {
      const newClient = await newClientResponse.json();
      console.log('Client created successfully:', { id: newClient.id, name: newClient.name });
    } else {
      const error = await newClientResponse.json();
      console.error('Client creation failed:', error);
    }

    console.log('\n✅ All API tests completed!');

  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testAPI();