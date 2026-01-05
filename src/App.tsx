import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import Preloader from './components/Preloader';

// Lazy load all pages
const Home = React.lazy(() => import('./pages/Home'));
const Measurements = React.lazy(() => import('./pages/Measurements'));
const Bioregions = React.lazy(() => import('./pages/Bioregions'));
const RegenerativeAgriculture = React.lazy(() => import('./pages/RegenerativeAgriculture'));
const Valuation = React.lazy(() => import('./pages/Valuation'));
const Governance = React.lazy(() => import('./pages/Governance'));
const Marketplace = React.lazy(() => import('./pages/Marketplace'));
const Health = React.lazy(() => import('./pages/Health'));
const Outreach = React.lazy(() => import('./pages/Outreach'));
const Security = React.lazy(() => import('./pages/Security'));
const Adoption = React.lazy(() => import('./pages/Adoption'));
const Innovation = React.lazy(() => import('./pages/Innovation'));
const AtlasSanctumDashboard = React.lazy(() => import('./components/sanctum/AtlasSanctumDashboard'));
const ExtendedAtlasSanctumDashboard = React.lazy(() => import('./components/sanctum/ExtendedAtlasSanctumDashboard'));

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-background">
            <Navigation />
            <Suspense fallback={<Preloader message="Loading page..." />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/measurements" element={<Measurements />} />
                <Route path="/bioregions" element={<Bioregions />} />
                <Route path="/regenerative-agriculture" element={<RegenerativeAgriculture />} />
                <Route path="/valuation" element={<Valuation />} />
                <Route path="/governance" element={<Governance />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/health" element={<Health />} />
                <Route path="/outreach" element={<Outreach />} />
                <Route path="/security" element={<Security />} />
                <Route path="/adoption" element={<Adoption />} />
                <Route path="/innovation" element={<Innovation />} />
                <Route path="/sanctum" element={<AtlasSanctumDashboard />} />
                <Route path="/sanctum/extended" element={<ExtendedAtlasSanctumDashboard />} />
              </Routes>
            </Suspense>
            <Toaster />
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;