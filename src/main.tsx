import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './hooks/useAuth.tsx';
import { SupabaseAuthProvider } from './hooks/useSupabaseAuth.tsx';
import { AdminProvider } from './contexts/AdminContext.tsx';
import App from './App.tsx';
import './index.css';
import './App.css';
import featureFlags from './lib/featureFlags';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Bootstrap feature flags from backend at runtime before rendering
async function bootstrap() {
  try {
    const res = await fetch('/api/flags');
    if (res.ok) {
      const flags = await res.json();
      featureFlags.initFeatureFlags(flags);
    }
  } catch (e) {
    // ignore failure; app will use defaults
  }

  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
              <SupabaseAuthProvider>
                <AdminProvider>
                  <App />
                  <Toaster 
                    position="bottom-right" 
                    expand={false}
                    richColors
                    closeButton
                    theme="system"
                  />
                </AdminProvider>
              </SupabaseAuthProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
}

bootstrap();