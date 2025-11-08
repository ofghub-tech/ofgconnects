// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { NotificationProvider } from './context/NotificationContext'; // <-- DELETE THIS LINE

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* <NotificationProvider> // <-- DELETE THIS LINE */}
          <App />
        {/* </NotificationProvider> // <-- DELETE THIS LINE */}
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);