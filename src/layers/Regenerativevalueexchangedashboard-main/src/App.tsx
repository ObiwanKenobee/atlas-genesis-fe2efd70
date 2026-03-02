import { useState, useEffect } from 'react';
import { Overview } from './components/Overview';
import { AssetClasses } from './components/AssetClasses';
import { VerificationLayer } from './components/VerificationLayer';
import { Governance } from './components/Governance';
import { TradingInterface } from './components/TradingInterface';
import { ImpactMetrics } from './components/ImpactMetrics';
import { CustodianNetwork } from './components/CustodianNetwork';
import { APIExplorer } from './components/APIExplorer';
import { OracleNetwork } from './components/OracleNetwork';
import { TokenEconomics } from './components/TokenEconomics';
import { ComplianceAudits } from './components/ComplianceAudits';
import { AlertSystem } from './components/AlertSystem';
import { AdvancedVisualizations } from './components/AdvancedVisualizations';
import { CriticalOperations } from './components/CriticalOperations';
import { CriticalInnovations } from './components/CriticalInnovations';
import { CrossChainSwaps } from './components/CrossChainSwaps';
import { ZKRollupIntegration } from './components/ZKRollupIntegration';
import { DecentralizedIdentity } from './components/DecentralizedIdentity';
import { AlgorithmicStablecoins } from './components/AlgorithmicStablecoins';
import { GlobalExpansion } from './components/GlobalExpansion';
import { InstitutionalPartnerships } from './components/InstitutionalPartnerships';
import { ImpactDerivatives } from './components/ImpactDerivatives';
import { CarbonCreditRegistry } from './components/CarbonCreditRegistry';
import { rveDashboardAPI, type RVEDashboardSummary } from './services/api/endpoints';
import { Leaf, TrendingUp, Shield, Users, Globe, Activity, BookOpen, Code, Satellite, Coins, FileCheck, Bell, BarChart3, Zap, Sparkles, ArrowRightLeft, Lock, User, DollarSign, Globe2, Building2, LineChart, Cloud } from 'lucide-react';

type TabType = 'overview' | 'assets' | 'verification' | 'governance' | 'trading' | 'impact' | 'custodians' | 'api' | 'oracle' | 'tokenomics' | 'compliance' | 'alerts' | 'visualizations' | 'operations' | 'innovations' | 'cross-chain' | 'zk-rollup' | 'did' | 'stablecoins' | 'global' | 'institutional' | 'derivatives' | 'carbon-registry';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dashboardData, setDashboardData] = useState<RVEDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Activity },
    { id: 'operations' as TabType, label: 'Operations', icon: Zap },
    { id: 'innovations' as TabType, label: 'Innovations', icon: Sparkles },
    { id: 'assets' as TabType, label: 'Asset Classes', icon: Leaf },
    { id: 'verification' as TabType, label: 'Verification', icon: Shield },
    { id: 'governance' as TabType, label: 'Governance', icon: Users },
    { id: 'trading' as TabType, label: 'Trading', icon: TrendingUp },
    { id: 'impact' as TabType, label: 'Impact', icon: Globe },
    { id: 'custodians' as TabType, label: 'Custodians', icon: BookOpen },
    { id: 'visualizations' as TabType, label: 'Visualizations', icon: BarChart3 },
    { id: 'api' as TabType, label: 'API & Architecture', icon: Code },
    { id: 'oracle' as TabType, label: 'Oracle Network', icon: Satellite },
    { id: 'tokenomics' as TabType, label: 'Token Economics', icon: Coins },
    { id: 'compliance' as TabType, label: 'Compliance Audits', icon: FileCheck },
    { id: 'alerts' as TabType, label: 'Alert System', icon: Bell },
    // Q3 2025 Features
    { id: 'cross-chain' as TabType, label: 'Cross-Chain Swaps', icon: ArrowRightLeft },
    { id: 'zk-rollup' as TabType, label: 'ZK-Rollups', icon: Lock },
    { id: 'did' as TabType, label: 'Decentralized ID', icon: User },
    { id: 'stablecoins' as TabType, label: 'Stablecoins', icon: DollarSign },
    // Q4 2025 Features
    { id: 'global' as TabType, label: 'Global Expansion', icon: Globe2 },
    { id: 'institutional' as TabType, label: 'Institutional', icon: Building2 },
    { id: 'derivatives' as TabType, label: 'Derivatives', icon: LineChart },
    { id: 'carbon-registry' as TabType, label: 'Carbon Registry', icon: Cloud },
  ];

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const result = await rveDashboardAPI.getSummary();
        if (result.success && result.data) {
          setDashboardData(result.data);
          setError(null);
        } else {
          // Set mock data for development if API fails
          console.log('Using mock data - API not available');
          setError(null);
        }
      } catch (err) {
        console.log('API not available, using mock data');
        setError(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-300">Loading Regenerative Value Exchange Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-white">Regenerative Value Exchange</h1>
                <p className="text-emerald-300/70 text-sm">Healing Ecosystems, Cultures & Communities</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-emerald-300/70 text-sm">Total RVE Market Cap</div>
                <div className="text-white text-xl font-bold">
                  ${dashboardData?.tokenEconomics?.market_cap?.toLocaleString() || '847.3B'}
                </div>
              </div>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 transition-all border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-emerald-400 text-emerald-400 bg-emerald-400/10'
                      : 'border-transparent text-emerald-300/50 hover:text-emerald-300 hover:bg-emerald-400/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <Overview data={dashboardData} />}
        {activeTab === 'operations' && <CriticalOperations />}
        {activeTab === 'innovations' && <CriticalInnovations />}
        {activeTab === 'assets' && <AssetClasses data={dashboardData?.assetClasses} />}
        {activeTab === 'verification' && <VerificationLayer />}
        {activeTab === 'governance' && <Governance proposals={dashboardData?.recentProposals} />}
        {activeTab === 'trading' && <TradingInterface />}
        {activeTab === 'impact' && <ImpactMetrics metrics={dashboardData?.impactMetrics} />}
        {activeTab === 'custodians' && <CustodianNetwork count={dashboardData?.custodiansCount} />}
        {activeTab === 'visualizations' && <AdvancedVisualizations />}
        {activeTab === 'api' && <APIExplorer />}
        {activeTab === 'oracle' && <OracleNetwork count={dashboardData?.oracleNetworksCount} />}
        {activeTab === 'tokenomics' && <TokenEconomics data={dashboardData?.tokenEconomics} />}
        {activeTab === 'compliance' && <ComplianceAudits />}
        {activeTab === 'alerts' && <AlertSystem alerts={dashboardData?.alerts} activeCount={dashboardData?.activeAlerts} />}
        {/* Q3 2025 Features */}
        {activeTab === 'cross-chain' && <CrossChainSwaps />}
        {activeTab === 'zk-rollup' && <ZKRollupIntegration />}
        {activeTab === 'did' && <DecentralizedIdentity />}
        {activeTab === 'stablecoins' && <AlgorithmicStablecoins />}
        {/* Q4 2025 Features */}
        {activeTab === 'global' && <GlobalExpansion />}
        {activeTab === 'institutional' && <InstitutionalPartnerships />}
        {activeTab === 'derivatives' && <ImpactDerivatives />}
        {activeTab === 'carbon-registry' && <CarbonCreditRegistry />}
      </main>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md border-t border-emerald-500/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-emerald-300/50 text-sm">
            <p>Where ancient wisdom and advanced technology converge to redefine value</p>
            <p className="mt-2">From Extraction to Regeneration • From Depletion to Abundance</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
