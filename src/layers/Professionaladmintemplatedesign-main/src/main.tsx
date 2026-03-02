/**
 * Admin Main Entry Point
 * 
 * Entry point for the admin dashboard with authentication.
 */

import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminProvider } from './context/AdminContext';
import './styles/index.css';

// Lazy load the main app
const App = lazy(() => import('./app/App'));

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400">Loading admin dashboard...</p>
      </div>
    </div>
  );
}

// Error boundary fallback
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="max-w-md p-6 bg-red-500/10 border border-red-500/50 rounded-xl text-center">
        <h2 className="text-xl font-bold text-red-400 mb-2">Application Error</h2>
        <p className="text-slate-400 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AdminProvider>
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    </AdminProvider>
  </React.StrictMode>
);
