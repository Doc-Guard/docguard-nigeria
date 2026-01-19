import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, BrowserRouter } from 'react-router-dom';
import App from './App';
// import './index.css';
import '@/tailwind.css';
import { Secrets } from '@/config/secrets';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Detect if running in Electron
// Typical check involves looking for window.process.type, navigator.userAgent containing 'Electron', or specific IPC bridges
const isElectron = navigator.userAgent.toLowerCase().includes('electron');

async function init() {
  // Initialize secrets before starting the app
  await Secrets.initialize();

  const root = ReactDOM.createRoot(rootElement!);

  // Use HashRouter for Electron (file protocols) and BrowserRouter for Web
  const Router = isElectron ? HashRouter : BrowserRouter;

  root.render(
    <React.StrictMode>
      <Router>
        <App />
      </Router>
    </React.StrictMode>
  );
}

init().catch(console.error);
