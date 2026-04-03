import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ToastProvider } from './context/ToastContext';
import { ToastStack } from './components/ToastStack';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <ToastStack />
      <App />
    </ToastProvider>
  </React.StrictMode>
);
