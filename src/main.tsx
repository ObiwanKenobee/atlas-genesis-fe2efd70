import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { SupabaseAuthProvider } from './hooks/useSupabaseAuth';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SupabaseAuthProvider>
          <App />
          <Toaster 
            position="bottom-right" 
            expand={false}
            richColors
            closeButton
            theme="system"
          />
        </SupabaseAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);