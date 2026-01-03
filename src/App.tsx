import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import ProjectDetail from "./pages/ProjectDetail";
import Portfolio from "./pages/Portfolio";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import Transactions from "./pages/Transactions";
import Measurements from "./pages/Measurements";
import Bioregions from "./pages/Bioregions";
import RegenerativeAgriculture from "./pages/RegenerativeAgriculture";
import Valuation from "./pages/Valuation";
import Governance from "./pages/Governance";
import Health from "./pages/Health";
import Outreach from "./pages/Outreach";
import Security from "./pages/Security";
import Adoption from "./pages/Adoption";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <ErrorBoundary>
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
              <Route path="/settings" element={<Settings />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="analytics" element={<AdminAnalytics />} />
              </Route>

              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
