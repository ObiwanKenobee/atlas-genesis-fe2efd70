import React, { Suspense, lazy, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingFallback from "@/components/LoadingFallback";
import CivilizationalHeader from "@/components/CivilizationalHeader";
import CivilizationalFooter from "@/components/CivilizationalFooter";
import { initGA } from "@/lib/analytics";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";

// Lazy-loaded page components
const Index = lazy(() => import('./pages/Index'));
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Onboarding = lazy(() => import('./pages/BasicPages').then(m => ({ default: m.Onboarding })));
const Marketplace = lazy(() => import('./pages/BasicPages').then(m => ({ default: m.Marketplace })));
const ProjectDetail = lazy(() => import('./pages/BasicPages').then(m => ({ default: m.ProjectDetail })));
const Portfolio = lazy(() => import('./pages/BasicPages').then(m => ({ default: m.Portfolio })));
const Pricing = lazy(() => import('./pages/BasicPages').then(m => ({ default: m.Pricing })));
const NotFound = lazy(() => import('./pages/BasicPages').then(m => ({ default: m.NotFound })));
const Transactions = lazy(() => import('./pages/FeaturePages').then(m => ({ default: m.Transactions })));
const Measurements = lazy(() => import('./pages/FeaturePages').then(m => ({ default: m.Measurements })));
const Bioregions = lazy(() => import('./pages/FeaturePages').then(m => ({ default: m.Bioregions })));
const RegenerativeAgriculture = lazy(() => import('./pages/FeaturePages').then(m => ({ default: m.RegenerativeAgriculture })));
const Valuation = lazy(() => import('./pages/FeaturePages').then(m => ({ default: m.Valuation })));
const Governance = lazy(() => import('./pages/FeaturePages').then(m => ({ default: m.Governance })));
const Health = lazy(() => import('./pages/FeaturePages').then(m => ({ default: m.Health })));
const Outreach = lazy(() => import('./pages/FeaturePages').then(m => ({ default: m.Outreach })));
const Security = lazy(() => import('./pages/FeaturePages').then(m => ({ default: m.Security })));
const Adoption = lazy(() => import('./pages/FeaturePages').then(m => ({ default: m.Adoption })));
const EndToEndExperience = lazy(() => import('./pages/EndToEndExperience'));
const BusinessModelPage = lazy(() => import('./pages/BusinessModel'));
const CriticalSystems = lazy(() => import('./pages/CriticalSystems'));
const CivilizationalArchitectureDashboard = lazy(() => import('./components/SimpleComponents').then(m => ({ default: m.CivilizationalArchitectureDashboard })));
const RoleSpecificDashboards = lazy(() => import('./components/SimpleComponents').then(m => ({ default: m.RoleSpecificDashboards })));

// Infrastructure Pages
const CarbonOffsetting = lazy(() => import('./pages/InfrastructurePages').then(m => ({ default: m.CarbonOffsetting })));
const ImpactInvestment = lazy(() => import('./pages/InfrastructurePages').then(m => ({ default: m.ImpactInvestment })));
const RegulatoryCompliance = lazy(() => import('./pages/InfrastructurePages').then(m => ({ default: m.RegulatoryCompliance })));
const EnterpriseSolutions = lazy(() => import('./pages/InfrastructurePages').then(m => ({ default: m.EnterpriseSolutions })));
const SMBSolutions = lazy(() => import('./pages/InfrastructurePages').then(m => ({ default: m.SMBSolutions })));
const AgricultureSolutions = lazy(() => import('./pages/InfrastructurePages').then(m => ({ default: m.AgricultureSolutions })));
const RenewableEnergy = lazy(() => import('./pages/InfrastructurePages').then(m => ({ default: m.RenewableEnergy })));
const EducationHub = lazy(() => import('./pages/InfrastructurePages').then(m => ({ default: m.EducationHub })));
const Certifications = lazy(() => import('./pages/InfrastructurePages').then(m => ({ default: m.Certifications })));
const Settings = lazy(() => import('./pages/UtilityPages').then(m => ({ default: m.Settings })));
const Profile = lazy(() => import('./pages/UtilityPages').then(m => ({ default: m.Profile })));
const HelpCenter = lazy(() => import('./pages/UtilityPages').then(m => ({ default: m.HelpCenter })));
const Contact = lazy(() => import('./pages/UtilityPages').then(m => ({ default: m.Contact })));
const ReportsAnalytics = lazy(() => import('./pages/UtilityPages').then(m => ({ default: m.ReportsAnalytics })));
const DashboardOverview = lazy(() => import('./pages/UtilityPages').then(m => ({ default: m.DashboardOverview })));
const PrivacyPolicy = lazy(() => import('./pages/UtilityPages').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/UtilityPages').then(m => ({ default: m.TermsOfService })));

// Admin routes grouped for better chunking
const AdminLayout = lazy(() => import('./pages/AdminPages').then(m => ({ default: m.AdminLayout })));
const AdminOverview = lazy(() => import('./pages/AdminPages').then(m => ({ default: m.AdminOverview })));
const AdminProjects = lazy(() => import('./pages/AdminPages').then(m => ({ default: m.AdminProjects })));
const AdminTransactions = lazy(() => import('./pages/AdminPages').then(m => ({ default: m.AdminTransactions })));
const AdminAnalytics = lazy(() => import('./pages/AdminPages').then(m => ({ default: m.AdminAnalytics })));
const UserManagement = lazy(() => import('./pages/AdminPages').then(m => ({ default: m.UserManagement })));

const queryClient = new QueryClient();

// Performance monitoring wrapper component
const PerformanceWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize performance monitoring
  usePerformanceMonitoring();

  // Initialize Google Analytics on mount
  useEffect(() => {
    initGA();
  }, []);

  return <>{children}</>;
};

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <PerformanceWrapper>
                  <ErrorBoundary>
                    <CivilizationalHeader />
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/onboarding" element={<Onboarding />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/marketplace" element={<Marketplace />} />
                      <Route path="/marketplace/:id" element={<ProjectDetail />} />
                      <Route path="/portfolio" element={<Portfolio />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/transactions" element={<Transactions />} />

                      {/* Feature Routes */}
                      <Route path="/measurements" element={<Measurements />} />
                      <Route path="/bioregions" element={<Bioregions />} />
                      <Route path="/regenerative-agriculture" element={<RegenerativeAgriculture />} />
                      <Route path="/valuation" element={<Valuation />} />
                      <Route path="/governance" element={<Governance />} />
                      <Route path="/health" element={<Health />} />
                      <Route path="/outreach" element={<Outreach />} />
                      <Route path="/security" element={<Security />} />
                      <Route path="/adoption" element={<Adoption />} />
                      <Route path="/architecture" element={<CivilizationalArchitectureDashboard />} />
                      <Route path="/systems" element={<CriticalSystems />} />
                      <Route path="/business-model" element={<BusinessModelPage />} />
                      <Route path="/experience" element={<EndToEndExperience />} />
                      <Route path="/dashboards" element={<RoleSpecificDashboards />} />
                      
                      {/* Infrastructure Pages */}
                      <Route path="/offsetting" element={<CarbonOffsetting />} />
                      <Route path="/investment" element={<ImpactInvestment />} />
                      <Route path="/compliance" element={<RegulatoryCompliance />} />
                      <Route path="/enterprise" element={<EnterpriseSolutions />} />
                      <Route path="/smb" element={<SMBSolutions />} />
                      <Route path="/agriculture" element={<AgricultureSolutions />} />
                      <Route path="/renewable-energy" element={<RenewableEnergy />} />
                      <Route path="/education" element={<EducationHub />} />
                      <Route path="/certifications" element={<Certifications />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/help" element={<HelpCenter />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/reports" element={<ReportsAnalytics />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-of-service" element={<TermsOfService />} />

                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminOverview />} />
                        <Route path="projects" element={<AdminProjects />} />
                        <Route path="transactions" element={<AdminTransactions />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="users" element={<UserManagement />} />
                      </Route>

                      {/* Catch-all Route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <CivilizationalFooter />
                </ErrorBoundary>
              </PerformanceWrapper>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
</ErrorBoundary>
);

export default App;
