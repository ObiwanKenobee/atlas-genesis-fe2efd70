import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ApiStatus from './components/ApiStatus';
import NewsletterBanner from './components/NewsletterBanner';
import Layout from './components/Layout';
import BackToTop from './components/BackToTop';
import Index from './pages/Index';
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
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Portfolio from './pages/Portfolio';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import ProjectDetail from './pages/ProjectDetail';
import TransactionHistory from './pages/TransactionHistory';
import Status from './pages/Status';
import Demo from './pages/Demo';
import Bioregions from './pages/Bioregions';
import Measurements from './pages/Measurements';
import Valuation from './pages/Valuation';
import Governance from './pages/Governance';
import RegenerativeAgriculture from './pages/RegenerativeAgriculture';
import Health from './pages/Health';
import Security from './pages/Security';
import Adoption from './pages/Adoption';
import Outreach from './pages/Outreach';
import HelpCenter from './pages/HelpCenter';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import Payment from './pages/Payment';
import RegenerativeFinance from './pages/RegenerativeFinance';
import DeFi from './pages/DeFi';
import Community from './pages/Community';
import Education from './pages/Education';
import CarbonCalculator from './pages/CarbonCalculator';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';

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

const App = () => {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/bioregions" element={<Bioregions />} />
          <Route path="/measurements" element={<Measurements />} />
          <Route path="/valuation" element={<Valuation />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/regenerative-agriculture" element={<RegenerativeAgriculture />} />
          <Route path="/health" element={<Health />} />
          <Route path="/security" element={<Security />} />
          <Route path="/adoption" element={<Adoption />} />
          <Route path="/outreach" element={<Outreach />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment/:reference" element={<Payment />} />
          <Route path="/regenerative-finance" element={<RegenerativeFinance />} />
          <Route path="/regenerative-finance/:id" element={<RegenerativeFinance />} />
          <Route path="/defi" element={<DeFi />} />
          <Route path="/defi/:id" element={<DeFi />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/:id" element={<Community />} />
          <Route path="/education" element={<Education />} />
          <Route path="/education/:id" element={<Education />} />
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
          <Route path="/calculator" element={<CarbonCalculator />} />
          <Route path="/architecture" element={<EngineeringArchitecture />} />
          <Route path="/dashboards" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      <BackToTop />
    </BrowserRouter>
  );
};

export default App;
