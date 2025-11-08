// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BibleProvider } from './context/BibleContext'; // <-- 1. IMPORT
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BibleProvider> {/* <-- 2. WRAP APP */}
          <App />
        </BibleProvider> {/* <-- 3. WRAP APP */}
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);