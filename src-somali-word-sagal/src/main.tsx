
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

// Create a client for React Query
const queryClient = new QueryClient();

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter basename="/somali-word-sagal/">
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
