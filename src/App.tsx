import React from 'react'; // v18
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/next"
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';
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
import { EnhancedAuthProvider } from './contexts/EnhancedAuthContext.tsx';
import { AuthProvider } from './hooks/useAuth';
import { SupabaseAuthProvider } from './hooks/useSupabaseAuth';
import AuthFallback from './components/AuthFallback';
import { SentryErrorBoundary } from './lib/errorReporting';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
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
import CardanoLayer from './pages/CardanoLayer';
import AdminCommandCenter from './pages/admin/AdminCommandCenter';
import FeatureFlagsAdmin from './pages/admin/FeatureFlags';
import NewsletterAttempts from './pages/admin/NewsletterAttempts';
import AdminProtectedRoute from './components/AdminProtectedRoute.tsx';
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
import ExploreVerifiedProjects from './pages/ExploreVerifiedProjects';
import DemoLogin from './pages/DemoLogin';
import AIInsights from './components/ai/AIInsights';
import CarbonCreditMarketplace from './components/defi/CarbonCreditMarketplace';
import GamificationHub from './components/gamification/GamificationHub';
import BlockchainVerification from './components/blockchain/BlockchainVerification';
import DecentralizedGovernanceDashboard from './layers/Decentralizedaigovernancedesign-main/src/app/App';
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
import Prototype from './pages/Prototype';
import DashboardHub from './pages/DashboardHub';
import MythicArchitect from './pages/MythicArchitect';
import { OnboardingProvider } from './hooks/useOnboarding.tsx';

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

/**
 * AnimatedRoutes — lives inside BrowserRouter so useLocation() is available.
 * AnimatePresence must receive a key that changes on navigation (pathname).
 * The key lives on PageTransition, which wraps every page's content.
 */
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {/* Key on the Routes element so AnimatePresence sees a new child on every route change */}
      <Routes location={location} key={location.pathname}>
        <Route path="/prototype" element={<PageTransition><Prototype /></PageTransition>} />
        <Route path="/hub" element={<PageTransition><DashboardHub /></PageTransition>} />
        <Route path="/mythic-architect" element={<PageTransition><MythicArchitect /></PageTransition>} />
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/auth" element={<PageTransition variant="scale"><Auth /></PageTransition>} />
        <Route path="/marketplace" element={<PageTransition><Marketplace /></PageTransition>} />
        <Route path="/explore-verified-projects" element={<PageTransition><ExploreVerifiedProjects /></PageTransition>} />
        <Route path="/portfolio" element={<PageTransition><Portfolio /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/bioregions" element={<PageTransition variant="slideRight"><Bioregions /></PageTransition>} />
        <Route path="/measurements" element={<PageTransition><Measurements /></PageTransition>} />
        <Route path="/valuation" element={<PageTransition variant="slideRight"><Valuation /></PageTransition>} />
        <Route path="/governance" element={<PageTransition><Governance /></PageTransition>} />
        <Route path="/regenerative-agriculture" element={<PageTransition variant="slideRight"><RegenerativeAgriculture /></PageTransition>} />
        <Route path="/health" element={<PageTransition><Health /></PageTransition>} />
        <Route path="/security" element={<PageTransition variant="fade"><Security /></PageTransition>} />
        <Route path="/adoption" element={<PageTransition variant="fade"><Adoption /></PageTransition>} />
        <Route path="/outreach" element={<PageTransition><Outreach /></PageTransition>} />
        <Route path="/help-center" element={<PageTransition><HelpCenter /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><SubscriptionPlans /></PageTransition>} />
        <Route path="/payment" element={<PageTransition><Payment /></PageTransition>} />
        <Route path="/payment/:reference" element={<PageTransition><Payment /></PageTransition>} />
        <Route path="/regenerative-finance" element={<PageTransition><RegenerativeFinance /></PageTransition>} />
        <Route path="/regenerative-finance/:id" element={<PageTransition><RegenerativeFinance /></PageTransition>} />
        <Route path="/defi" element={<PageTransition><DeFi /></PageTransition>} />
        <Route path="/defi/:id" element={<PageTransition><DeFi /></PageTransition>} />
        <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
        <Route path="/community/:id" element={<PageTransition><Community /></PageTransition>} />
        <Route path="/education" element={<PageTransition><Education /></PageTransition>} />
        <Route path="/education/:id" element={<PageTransition><Education /></PageTransition>} />
        <Route path="/business-model" element={<PageTransition><BusinessModel /></PageTransition>} />
        <Route path="/critical-innovations" element={<PageTransition><CriticalInnovations /></PageTransition>} />
        <Route path="/azure-strategy" element={<PageTransition><AzureProductionStrategy /></PageTransition>} />
        <Route path="/ethical-governance" element={<PageTransition><EthicalGovernance /></PageTransition>} />
        <Route path="/regenerative-value-exchange" element={<PageTransition><RegenerativeValueExchange /></PageTransition>} />
        <Route path="/data-metrics-engine" element={<PageTransition><DataMetricsEngine /></PageTransition>} />
        <Route path="/cultural-knowledge-impact" element={<PageTransition><CulturalKnowledgeImpact /></PageTransition>} />
        <Route path="/global-impact-economy" element={<PageTransition><GlobalImpactEconomy /></PageTransition>} />
        <Route path="/end-to-end-experience" element={<PageTransition><EndToEndExperience /></PageTransition>} />
        <Route path="/engineering-architecture" element={<PageTransition><EngineeringArchitecture /></PageTransition>} />
        <Route path="/rvx-innovations" element={<PageTransition><RVXInnovations /></PageTransition>} />
        <Route path="/dashboard-with-sidebar" element={<PageTransition><DashboardWithSidebar /></PageTransition>} />
        <Route path="/status" element={<PageTransition><Status /></PageTransition>} />
        <Route path="/demo" element={<PageTransition><Demo /></PageTransition>} />
        <Route path="/project/:id" element={<PageTransition variant="slideRight"><ProjectDetail /></PageTransition>} />
        <Route path="/transactions" element={<PageTransition><TransactionHistory /></PageTransition>} />
        <Route path="/calculator" element={<PageTransition><CarbonCalculator /></PageTransition>} />
        <Route path="/leaderboard" element={<PageTransition><Leaderboard /></PageTransition>} />
        <Route path="/cardano-layer" element={<PageTransition><CardanoLayer /></PageTransition>} />
        <Route path="/architecture" element={<PageTransition><EngineeringArchitecture /></PageTransition>} />
        <Route path="/dashboards" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/careers" element={<PageTransition><Careers /></PageTransition>} />
        <Route path="/admin" element={<AdminProtectedRoute><PageTransition variant="fade"><AdminCommandCenter /></PageTransition></AdminProtectedRoute>} />
        <Route path="/admin/flags" element={<AdminProtectedRoute><PageTransition variant="fade"><FeatureFlagsAdmin /></PageTransition></AdminProtectedRoute>} />
        <Route path="/admin/newsletter" element={<AdminProtectedRoute><PageTransition variant="fade"><NewsletterAttempts /></PageTransition></AdminProtectedRoute>} />
        <Route path="/segment-selection" element={<PageTransition variant="scale"><SegmentSelection /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition variant="scale"><Onboarding /></PageTransition>} />
        <Route path="/dashboard-overview" element={<PageTransition><DashboardOverview /></PageTransition>} />
        <Route path="/reports-analytics" element={<PageTransition><ReportsAnalytics /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
        <Route path="/privacy-policy" element={<PageTransition variant="fade"><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms-of-service" element={<PageTransition variant="fade"><TermsOfService /></PageTransition>} />
        <Route path="/my-transactions" element={<PageTransition><Transactions /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/cookie-policy" element={<PageTransition variant="fade"><CookiePolicy /></PageTransition>} />
        <Route path="/accessibility" element={<PageTransition variant="fade"><Accessibility /></PageTransition>} />
        <Route path="/media-kit" element={<PageTransition><MediaKit /></PageTransition>} />
        <Route path="/help" element={<PageTransition><HelpCenter /></PageTransition>} />
        <Route path="/help/documentation" element={<PageTransition><APIDocumentation /></PageTransition>} />
        <Route path="/dashboard/donor" element={<ProtectedRoute requiredDashboard="donor"><PageTransition><DonorDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/field-agent" element={<ProtectedRoute requiredDashboard="field-agent"><PageTransition><FieldAgentDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/administrator" element={<ProtectedRoute requiredDashboard="administrator"><PageTransition><AdministratorDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/community" element={<ProtectedRoute requiredDashboard="community"><PageTransition><CommunityDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/enterprise" element={<ProtectedRoute requiredDashboard="enterprise"><PageTransition><EnterpriseDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/government" element={<ProtectedRoute requiredDashboard="government"><PageTransition><GovernmentDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/defi" element={<ProtectedRoute requiredDashboard="defi"><PageTransition><DeFiDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/ngo" element={<ProtectedRoute requiredDashboard="ngo"><PageTransition><NGODashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute requiredRole="enterprise"><PageTransition><BillingDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute requiredRole="enterprise"><PageTransition><InvoicesManagement /></PageTransition></ProtectedRoute>} />
        <Route path="/payment-methods" element={<ProtectedRoute requiredRole="enterprise"><PageTransition><PaymentMethods /></PageTransition></ProtectedRoute>} />
        <Route path="/api-analytics" element={<ProtectedRoute requiredRole="enterprise"><PageTransition><APIAnalyticsDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/api-keys" element={<ProtectedRoute requiredRole="enterprise"><PageTransition><APIKeyManagement /></PageTransition></ProtectedRoute>} />
        <Route path="/mfa-setup" element={<ProtectedRoute><PageTransition variant="scale"><MFASetup /></PageTransition></ProtectedRoute>} />
        <Route path="/checkout" element={<PageTransition variant="scale"><Checkout /></PageTransition>} />
        <Route path="/customer-portal" element={<PageTransition><CustomerPortal /></PageTransition>} />
        <Route path="/carbon-offsetting" element={<PageTransition variant="slideRight"><CarbonOffsetting /></PageTransition>} />
        <Route path="/impact-investment" element={<PageTransition variant="slideRight"><ImpactInvestment /></PageTransition>} />
        <Route path="/regulatory-compliance" element={<PageTransition variant="slideRight"><RegulatoryCompliance /></PageTransition>} />
        <Route path="/enterprise-solutions" element={<PageTransition variant="slideRight"><EnterpriseSolutions /></PageTransition>} />
        <Route path="/smb-solutions" element={<PageTransition variant="slideRight"><SMBSolutions /></PageTransition>} />
        <Route path="/agriculture-solutions" element={<PageTransition variant="slideRight"><AgricultureSolutions /></PageTransition>} />
        <Route path="/renewable-energy" element={<PageTransition variant="slideRight"><RenewableEnergy /></PageTransition>} />
        <Route path="/education-hub" element={<PageTransition><EducationHub /></PageTransition>} />
        <Route path="/certifications" element={<PageTransition><Certifications /></PageTransition>} />
        <Route path="/demo-login" element={<PageTransition variant="scale"><DemoLogin /></PageTransition>} />
        <Route path="/ai-insights" element={<PageTransition><AIInsights /></PageTransition>} />
        <Route path="/carbon-marketplace" element={<PageTransition><CarbonCreditMarketplace /></PageTransition>} />
        <Route path="/impact-challenges" element={<PageTransition><GamificationHub /></PageTransition>} />
        <Route path="/blockchain-verification" element={<PageTransition><BlockchainVerification /></PageTransition>} />
        <Route path="/decentralized-governance" element={<PageTransition><DecentralizedGovernanceDashboard /></PageTransition>} />
        <Route path="*" element={<PageTransition variant="fade"><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <OnboardingProvider>
      <EnhancedAuthProvider>
        <AuthProvider>
          <SupabaseAuthProvider>
            <SentryErrorBoundary fallback={<AuthFallback />}>
              <BrowserRouter>
                <RouteErrorBoundary>
                  <AnimatedRoutes />
                  <BackToTop />
                </RouteErrorBoundary>
              </BrowserRouter>
            </SentryErrorBoundary>
          </SupabaseAuthProvider>
        </AuthProvider>
      </EnhancedAuthProvider>
    </OnboardingProvider>
  );
};

export default App;
