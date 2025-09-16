import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log('🚀 Starting React application...');
console.log('📍 Current URL:', window.location.href);
console.log('🔍 Document ready state:', document.readyState);

const container = document.getElementById('root');
console.log('🎯 Root container found:', container);

if (!container) {
  console.error('❌ Root element not found!');
  throw new Error('Root element not found');
}

console.log('⚛️ Creating React root...');
const root = createRoot(container);

console.log('🎨 Rendering App component...');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('✅ React app rendered successfully!');
