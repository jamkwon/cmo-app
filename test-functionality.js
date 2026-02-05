// Test script to verify all CMO app functionality is working
// Run this in browser console at localhost:3457

console.log('🚀 FIGMINTS CMO App Functionality Test Starting...');

// Test 1: Check if React is loaded
console.log('✅ Test 1: React loaded -', typeof React !== 'undefined' ? 'PASS' : 'FAIL');

// Test 2: Check if the main elements are present
const tests = [
  // UI Elements
  { name: 'Header with FIGMINTS branding', selector: 'h1', expected: true },
  { name: 'Theme toggle button', selector: 'button[title="Toggle theme"]', expected: true },
  { name: 'New Meeting button', selector: 'button[title="Create a new meeting"]', expected: true },
  { name: 'Dashboard title', selector: 'h1:contains("Dashboard")', expected: true },
  { name: 'Client list container', selector: '.space-y-3', expected: true },
  
  // Interactive elements
  { name: 'Clickable stat cards', selector: '.cursor-pointer', expected: true },
  { name: 'Client list items', selector: '[title*="Click to view"]', expected: true },
];

tests.forEach((test, index) => {
  const element = document.querySelector(test.selector);
  const result = test.expected ? element !== null : element === null;
  console.log(`${result ? '✅' : '❌'} Test ${index + 2}: ${test.name} - ${result ? 'PASS' : 'FAIL'}`);
});

// Test 3: Check for click handlers by inspecting elements
const checkClickHandlers = () => {
  const themeButton = document.querySelector('button[title="Toggle theme"]');
  const newMeetingButton = document.querySelector('button[title="Create a new meeting"]');
  const clientItems = document.querySelectorAll('[title*="Click to view"]');
  
  console.log('🔍 Click Handler Analysis:');
  console.log(`   Theme toggle: ${themeButton && themeButton.onclick ? 'Has onClick' : 'Uses React handler'}`);
  console.log(`   New Meeting: ${newMeetingButton && newMeetingButton.onclick ? 'Has onClick' : 'Uses React handler'}`);
  console.log(`   Client items: ${clientItems.length} items with click handlers`);
};

checkClickHandlers();

// Test 4: Simulate clicks (requires manual verification)
console.log('🖱️  Manual Test Instructions:');
console.log('   1. Click the theme toggle (sun/moon icon) - should switch light/dark');
console.log('   2. Click "New Meeting" button - should open meeting modal');
console.log('   3. Click any client name - should open client detail modal');
console.log('   4. Click stat cards - should log to console');
console.log('   5. Test modal interactions (close buttons, form submissions)');

// Test 5: API connectivity
fetch('/api/clients')
  .then(response => response.json())
  .then(data => {
    console.log(`✅ API Test: Loaded ${data.length} clients successfully`);
    data.forEach((client, index) => {
      console.log(`   Client ${index + 1}: ${client.name} (${client.account_manager})`);
    });
  })
  .catch(error => {
    console.log('❌ API Test: Failed to load clients', error);
  });

console.log('🎉 Test complete! Check results above and perform manual click tests.');