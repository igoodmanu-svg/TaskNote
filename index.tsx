import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// import './src/index.css'; // Commented out to fix preview. Styles are now handled via CDN in index.html for simplicity.

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}