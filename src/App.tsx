import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ApiStatus from './components/ApiStatus';
import NewsletterBanner from './components/NewsletterBanner';
import Layout from './components/Layout';
import BackToTop from './components/BackToTop';
import HeroSection from './components/HeroSection';
import PlatformArchitecture from './components/PlatformArchitecture';
import RealTimeImpact from './components/RealTimeImpact';
import TechnologyStack from './components/TechnologyStack';
import JoinRevolution from './components/JoinRevolution';
import Footer from './components/Footer';
import BusinessModel from './pages/BusinessModel';
import CriticalInnovations from './pages/CriticalInnovations';
import AzureProductionStrategy from './pages/AzureProductionStrategy';
import EthicalGovernance from './pages/EthicalGovernance';
import RegenerativeValueExchange from './pages/RegenerativeValueExchange';
import DataMetricsEngine from './pages/DataMetricsEngine';
import CulturalKnowledgeImpact from './pages/CulturalKnowledgeImpact';
import GlobalImpactEconomy from './pages/GlobalImpactEconomy';
import EndToEndExperience from './pages/EndToEndExperience';
import EngineeringArchitecture from './pages/EngineeringArchitecture';
import RVXInnovations from './pages/RVXInnovations';
import DashboardWithSidebar from './pages/DashboardWithSidebar';
import SupabaseAuth from './pages/SupabaseAuth';
import Portfolio from './pages/Portfolio';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import ProjectDetail from './pages/ProjectDetail';
import TransactionHistory from './pages/TransactionHistory';
import Status from './pages/Status';
import Demo from './pages/Demo';

const SimplePage = ({ title, description }: { title: string; description: string }) => (
  <Layout>
    <div className="py-8 px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">{title}</h1>
        <p className="text-xl text-slate-400 mb-8">{description}</p>
        <div className="glass p-8 rounded-2xl">
          <p className="text-slate-400">Feature coming soon...</p>
        </div>
      </div>
    </div>
  </Layout>
);

const Index = () => (
  <div className="font-display bg-slate-900 text-white">
    <Layout showFooter={false}>
      <HeroSection />
      <PlatformArchitecture />
      <RealTimeImpact />
      <TechnologyStack />
      <JoinRevolution />
    </Layout>
    <Footer />
    <NewsletterBanner />
  </div>
);

const Dashboard = () => (
  <Layout>
    <div className="py-8 px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">🌱 Regenerative Dashboard</h1>
        <p className="text-xl text-slate-400 mb-8">Track your impact, manage investments, and scale regeneration.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="glass p-8 rounded-2xl hover-lift">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl">🎯</div>
              <h3 className="text-2xl font-bold text-emerald-500">Your Impact</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Carbon Offset</span>
                <span className="text-emerald-500 font-bold">2.4 tons CO₂</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Projects Funded</span>
                <span className="text-emerald-500 font-bold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ecosystem Health</span>
                <span className="text-emerald-500 font-bold">87%</span>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-2xl hover-lift">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl">📈</div>
              <h3 className="text-2xl font-bold text-blue-500">Impact Growth</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Monthly Impact</span>
                <span className="text-blue-500 font-bold">+18%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Community Reach</span>
                <span className="text-blue-500 font-bold">+34%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Funding Raised</span>
                <span className="text-blue-500 font-bold">$2.1M</span>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-2xl hover-lift">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl">💎</div>
              <h3 className="text-2xl font-bold text-purple-500">Regenerative Assets</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Carbon Credits</span>
                <span className="text-purple-500 font-bold">1,200 RIU</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ecosystem Tokens</span>
                <span className="text-purple-500 font-bold">5,800</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Market Value</span>
                <span className="text-purple-500 font-bold">$45,200</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

const App = () => {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth" element={<SupabaseAuth />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/business-model" element={<BusinessModel />} />
          <Route path="/critical-innovations" element={<CriticalInnovations />} />
          <Route path="/azure-strategy" element={<AzureProductionStrategy />} />
          <Route path="/ethical-governance" element={<EthicalGovernance />} />
          <Route path="/regenerative-value-exchange" element={<RegenerativeValueExchange />} />
          <Route path="/data-metrics-engine" element={<DataMetricsEngine />} />
          <Route path="/cultural-knowledge-impact" element={<CulturalKnowledgeImpact />} />
          <Route path="/global-impact-economy" element={<GlobalImpactEconomy />} />
          <Route path="/end-to-end-experience" element={<EndToEndExperience />} />
          <Route path="/engineering-architecture" element={<EngineeringArchitecture />} />
          <Route path="/rvx-innovations" element={<RVXInnovations />} />
          <Route path="/dashboard-with-sidebar" element={<DashboardWithSidebar />} />
          <Route path="/status" element={<Status />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/transactions" element={<TransactionHistory />} />
        </Routes>
      </AnimatePresence>
      <BackToTop />
    </BrowserRouter>
  );
};

export default App;
