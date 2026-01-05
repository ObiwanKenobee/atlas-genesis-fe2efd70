import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Navigation from './components/Navigation';

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
const Profile = React.lazy(() => import('./pages/Profile'));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Navigation />
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-slate-900"><div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div></div>}>
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
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Suspense>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;