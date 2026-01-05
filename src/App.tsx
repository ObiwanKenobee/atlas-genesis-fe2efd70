import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Measurements from './pages/Measurements';
import Bioregions from './pages/Bioregions';
import RegenerativeAgriculture from './pages/RegenerativeAgriculture';
import Valuation from './pages/Valuation';
import Governance from './pages/Governance';
import Marketplace from './pages/Marketplace';
import Health from './pages/Health';
import Outreach from './pages/Outreach';
import Security from './pages/Security';
import Adoption from './pages/Adoption';
import Innovation from './pages/Innovation';
import AtlasSanctumDashboard from './components/sanctum/AtlasSanctumDashboard';
import ExtendedAtlasSanctumDashboard from './components/sanctum/ExtendedAtlasSanctumDashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-background">
            <Navigation />
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
            <Toaster />
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;