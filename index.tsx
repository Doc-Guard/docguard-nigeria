import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
// import './index.css';
import './src/tailwind.css';
import { Secrets } from './src/config/secrets';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

async function init() {
  // Initialize secrets before starting the app
  await Secrets.initialize();
  
  const root = ReactDOM.createRoot(rootElement!);
  root.render(
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>
  );
}

init().catch(console.error);
