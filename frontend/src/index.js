// src/index.js
import App from './App';
import React from 'react';
import ReactDOM from 'react-dom/client'; // Import the createRoot method
import './styles/index.css';
import './fonts/fonts1.css';
import './fonts/fonts2.css';



// Create a root for React 18
const root = ReactDOM.createRoot(document.getElementById('butterfly-habits'));

// Render the App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
