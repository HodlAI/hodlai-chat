import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { ErrorBoundary } from './components/ErrorBoundary';

// Safe global shim for check process.env (common in Web3)
if (typeof window !== 'undefined') {
  if (!window.process) {
    (window as any).process = { env: {} };
  } else if (!window.process.env) {
    (window as any).process.env = {};
  }
}

console.log('HodlAI Chat initializing...');

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);