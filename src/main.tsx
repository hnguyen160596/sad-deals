import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Simple mounting
const root = document.getElementById('root');

if (root) {
  const reactRoot = ReactDOM.createRoot(root);
  reactRoot.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

// Hide loader once mounted
setTimeout(() => {
  const loader = document.getElementById('loading-fallback');
  if (loader) loader.style.display = 'none';
}, 1000);
