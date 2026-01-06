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
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

// Lazy-loaded page components
const Index = lazy(() => import('./pages/Index'));
const Auth = lazy(() => import('./pages/Auth'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Pricing = lazy(() => import('./pages/Pricing'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Measurements = lazy(() => import('./pages/Measurements'));
const Bioregions = lazy(() => import('./pages/Bioregions'));
const RegenerativeAgriculture = lazy(() => import('./pages/RegenerativeAgriculture'));
const Valuation = lazy(() => import('./pages/Valuation'));
const Governance = lazy(() => import('./pages/Governance'));
const Health = lazy(() => import('./pages/Health'));
const Outreach = lazy(() => import('./pages/Outreach'));
const Security = lazy(() => import('./pages/Security'));
const Adoption = lazy(() => import('./pages/Adoption'));
const CriticalSystems = lazy(() => import('./pages/CriticalSystems'));
const CivilizationalArchitectureDashboard = lazy(() => import('./components/CivilizationalArchitectureDashboard'));
const RoleSpecificDashboards = lazy(() => import('./components/RoleSpecificDashboards'));

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
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const Contact = lazy(() => import('./pages/Contact'));
const ReportsAnalytics = lazy(() => import('./pages/ReportsAnalytics'));
const DashboardOverview = lazy(() => import('./pages/DashboardOverview'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

// Admin routes grouped for better chunking
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));

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
