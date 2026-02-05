import React, { useState } from 'react';
import './App.css';

// Simple debug component to test interactivity
const DebugApp = () => {
  const [clickCount, setClickCount] = useState(0);
  const [message, setMessage] = useState('App loaded successfully');

  const handleButtonClick = () => {
    console.log('Button clicked!');
    setClickCount(prev => prev + 1);
    setMessage(`Button clicked ${clickCount + 1} times`);
  };

  const handleInputChange = (e) => {
    console.log('Input changed:', e.target.value);
    setMessage(`Input value: ${e.target.value}`);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>CMO App Debug Page</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>Status:</strong> {message}
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={handleButtonClick}
          style={{
            padding: '10px 20px',
            backgroundColor: '#e55d4d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          Test Button (Clicked: {clickCount})
        </button>
        
        <button 
          onClick={() => alert('Alert button works!')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Alert Test
        </button>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Type here to test input..."
          onChange={handleInputChange}
          style={{
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '300px'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <h3>JavaScript Environment Check:</h3>
        <ul>
          <li>React Version: {React.version}</li>
          <li>User Agent: {navigator.userAgent}</li>
          <li>Console Available: {typeof console !== 'undefined' ? 'Yes' : 'No'}</li>
          <li>Local Storage: {typeof localStorage !== 'undefined' ? 'Yes' : 'No'}</li>
          <li>Fetch Available: {typeof fetch !== 'undefined' ? 'Yes' : 'No'}</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}>
        <h4>Test Results:</h4>
        <p>If you can see this page and the buttons respond to clicks, then JavaScript and React event handling are working correctly.</p>
        <p>Open browser console (F12) to see additional debug logs.</p>
      </div>
    </div>
  );
};

export default DebugApp;