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
import { EnhancedAuthProvider } from './contexts/EnhancedAuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
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
import Leaderboard from './pages/Leaderboard';
import AdminCommandCenter from './pages/admin/AdminCommandCenter';
import FeatureFlagsAdmin from './pages/admin/FeatureFlags';
import Careers from './pages/Careers';
import NotFound from './pages/NotFound';
import SegmentSelection from './pages/SegmentSelection';
import Onboarding from './pages/Onboarding';
import DashboardOverview from './pages/DashboardOverview';
import ReportsAnalytics from './pages/ReportsAnalytics';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Transactions from './pages/Transactions';
import About from './pages/About';
import CookiePolicy from './pages/CookiePolicy';
import Accessibility from './pages/Accessibility';
import MediaKit from './pages/MediaKit';
import APIDocumentation from './pages/APIDocumentation';
import DonorDashboard from './pages/DonorDashboard';
import FieldAgentDashboard from './pages/FieldAgentDashboard';
import AdministratorDashboard from './pages/AdministratorDashboard';
import CommunityDashboard from './pages/CommunityDashboard';
import EnterpriseDashboard from './pages/EnterpriseDashboard';
import GovernmentDashboard from './pages/GovernmentDashboard';
import DeFiDashboard from './pages/DeFiDashboard';
import NGODashboard from './pages/NGODashboard';
import BillingDashboard from './pages/enterprise/BillingDashboard';
import InvoicesManagement from './pages/enterprise/InvoicesManagement';
import PaymentMethods from './pages/enterprise/PaymentMethods';
import APIAnalyticsDashboard from './pages/enterprise/APIAnalyticsDashboard';
import APIKeyManagement from './pages/enterprise/APIKeyManagement';
import MFASetup from './pages/enterprise/MFASetup';
import Checkout from './pages/Checkout';
import CustomerPortal from './pages/CustomerPortal';
import SubscriptionPlans from './pages/SubscriptionPlans';
import DemoLogin from './pages/DemoLogin';
import {
  CarbonOffsetting,
  ImpactInvestment,
  RegulatoryCompliance,
  EnterpriseSolutions,
  SMBSolutions,
  AgricultureSolutions,
  RenewableEnergy,
  EducationHub,
  Certifications
} from './pages/InfrastructurePages';
import { OnboardingProvider } from './hooks/useOnboarding';

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
    <OnboardingProvider>
      <EnhancedAuthProvider>
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
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/architecture" element={<EngineeringArchitecture />} />
              <Route path="/dashboards" element={<Dashboard />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/admin" element={<AdminCommandCenter />} />
              <Route path="/admin/flags" element={<FeatureFlagsAdmin />} />
              <Route path="/segment-selection" element={<SegmentSelection />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard-overview" element={<DashboardOverview />} />
              <Route path="/reports-analytics" element={<ReportsAnalytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/my-transactions" element={<Transactions />} />
              <Route path="/about" element={<About />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/accessibility" element={<Accessibility />} />
              <Route path="/media-kit" element={<MediaKit />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/help/documentation" element={<APIDocumentation />} />
              <Route path="/dashboard/donor" element={
                <ProtectedRoute requiredDashboard="donor"><DonorDashboard /></ProtectedRoute>
              } />
              <Route path="/dashboard/field-agent" element={
                <ProtectedRoute requiredDashboard="field-agent"><FieldAgentDashboard /></ProtectedRoute>
              } />
              <Route path="/dashboard/administrator" element={
                <ProtectedRoute requiredDashboard="administrator"><AdministratorDashboard /></ProtectedRoute>
              } />
              <Route path="/dashboard/community" element={
                <ProtectedRoute requiredDashboard="community"><CommunityDashboard /></ProtectedRoute>
              } />
              <Route path="/dashboard/enterprise" element={
                <ProtectedRoute requiredDashboard="enterprise"><EnterpriseDashboard /></ProtectedRoute>
              } />
              <Route path="/dashboard/government" element={
                <ProtectedRoute requiredDashboard="government"><GovernmentDashboard /></ProtectedRoute>
              } />
              <Route path="/dashboard/defi" element={
                <ProtectedRoute requiredDashboard="defi"><DeFiDashboard /></ProtectedRoute>
              } />
              <Route path="/dashboard/ngo" element={
                <ProtectedRoute requiredDashboard="ngo"><NGODashboard /></ProtectedRoute>
              } />
              <Route path="/billing" element={
                <ProtectedRoute requiredRole="enterprise"><BillingDashboard /></ProtectedRoute>
              } />
              <Route path="/invoices" element={
                <ProtectedRoute requiredRole="enterprise"><InvoicesManagement /></ProtectedRoute>
              } />
              <Route path="/payment-methods" element={
                <ProtectedRoute requiredRole="enterprise"><PaymentMethods /></ProtectedRoute>
              } />
              <Route path="/api-analytics" element={
                <ProtectedRoute requiredRole="enterprise"><APIAnalyticsDashboard /></ProtectedRoute>
              } />
              <Route path="/api-keys" element={
                <ProtectedRoute requiredRole="enterprise"><APIKeyManagement /></ProtectedRoute>
              } />
              <Route path="/mfa-setup" element={
                <ProtectedRoute><MFASetup /></ProtectedRoute>
              } />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/customer-portal" element={<CustomerPortal />} />
              <Route path="/pricing" element={<SubscriptionPlans />} />
              <Route path="/carbon-offsetting" element={<CarbonOffsetting />} />
              <Route path="/impact-investment" element={<ImpactInvestment />} />
              <Route path="/regulatory-compliance" element={<RegulatoryCompliance />} />
              <Route path="/enterprise-solutions" element={<EnterpriseSolutions />} />
              <Route path="/smb-solutions" element={<SMBSolutions />} />
              <Route path="/agriculture-solutions" element={<AgricultureSolutions />} />
              <Route path="/renewable-energy" element={<RenewableEnergy />} />
              <Route path="/education-hub" element={<EducationHub />} />
              <Route path="/certifications" element={<Certifications />} />
              <Route path="/demo-login" element={<DemoLogin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
          <BackToTop />
        </BrowserRouter>
      </EnhancedAuthProvider>
    </OnboardingProvider>
  );
};

export default App;
