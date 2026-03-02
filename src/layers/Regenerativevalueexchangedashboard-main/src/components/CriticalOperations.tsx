import { useState } from 'react';
import { AssetIssuance } from './critical/AssetIssuance';
import { CustodianOnboarding } from './critical/CustodianOnboarding';
import { ImpactReporting } from './critical/ImpactReporting';
import { GovernanceParticipation } from './critical/GovernanceParticipation';
import { Plus, Users, BarChart3, Vote, Zap, Shield, FileCheck, TrendingUp } from 'lucide-react';

type OperationType = 'overview' | 'asset-issuance' | 'custodian-onboarding' | 'impact-reporting' | 'governance';

export function CriticalOperations() {
  const [activeOperation, setActiveOperation] = useState<OperationType>('overview');

  const operations = [
    {
      id: 'asset-issuance' as OperationType,
      title: 'Issue Assets',
      description: 'Create new regenerative assets',
      icon: Plus,
      color: 'from-emerald-500 to-teal-500',
      stats: { value: '142', label: 'Active Assets' }
    },
    {
      id: 'custodian-onboarding' as OperationType,
      title: 'Become Custodian',
      description: 'Join verified steward network',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      stats: { value: '3,421', label: 'Verified Custodians' }
    },
    {
      id: 'impact-reporting' as OperationType,
      title: 'Report Impact',
      description: 'Submit verification data',
      icon: BarChart3,
      color: 'from-amber-500 to-orange-500',
      stats: { value: '12,847', label: 'Projects Reporting' }
    },
    {
      id: 'governance' as OperationType,
      title: 'Governance',
      description: 'Vote on proposals',
      icon: Vote,
      color: 'from-purple-500 to-pink-500',
      stats: { value: '24', label: 'Active Proposals' }
    }
  ];

  const quickStats = [
    { label: 'Total Value Locked', value: '$847.3B', change: '+12.3%', icon: TrendingUp, color: 'emerald' },
    { label: 'Pending Verifications', value: '234', change: '+8', icon: Shield, color: 'blue' },
    { label: 'Monthly Reports', value: '1,567', change: '+156', icon: FileCheck, color: 'amber' },
    { label: 'Governance Participation', value: '67%', change: '+5%', icon: Zap, color: 'purple' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white">Critical Operations Hub</h2>
            <p className="text-emerald-300/80">Core RVE platform functionality and workflows</p>
          </div>
        </div>
      </div>

      {activeOperation === 'overview' && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-emerald-400 text-sm">{stat.change}</div>
                  </div>
                  <div className="text-emerald-300/70 text-sm mb-1">{stat.label}</div>
                  <div className="text-white">{stat.value}</div>
                </div>
              );
            })}
          </div>

          {/* Operation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {operations.map((operation) => {
              const Icon = operation.icon;
              return (
                <button
                  key={operation.id}
                  onClick={() => setActiveOperation(operation.id)}
                  className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-8 hover:border-emerald-500/40 transition-all text-left group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${operation.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white mb-2">{operation.title}</h3>
                      <p className="text-emerald-300/70 text-sm">{operation.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-emerald-500/20">
                    <div>
                      <div className="text-emerald-300/70 text-sm">{operation.stats.label}</div>
                      <div className="text-white">{operation.stats.value}</div>
                    </div>
                    <div className="text-emerald-400 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {[
                {
                  action: 'Asset Issued',
                  description: 'Himalayan Watershed Protection Bonds',
                  time: '2 hours ago',
                  icon: Plus,
                  color: 'emerald'
                },
                {
                  action: 'Impact Report Verified',
                  description: 'Amazon Corridor Project Q1 2025',
                  time: '5 hours ago',
                  icon: FileCheck,
                  color: 'blue'
                },
                {
                  action: 'Custodian Approved',
                  description: 'Pacific Island Heritage Foundation',
                  time: '1 day ago',
                  icon: Users,
                  color: 'amber'
                },
                {
                  action: 'Governance Vote Passed',
                  description: 'ISO Soil Carbon Measurement Standards',
                  time: '2 days ago',
                  icon: Vote,
                  color: 'purple'
                }
              ].map((activity, idx) => {
                const Icon = activity.icon;
                return (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-emerald-900/10 border border-emerald-500/10 rounded-lg">
                    <div className={`w-10 h-10 bg-gradient-to-br from-${activity.color}-500 to-${activity.color}-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white mb-1">{activity.action}</div>
                      <div className="text-emerald-300/70 text-sm">{activity.description}</div>
                    </div>
                    <div className="text-emerald-300/50 text-sm">{activity.time}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Platform Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-white">System Status</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-300/70">Oracle Network</span>
                  <span className="text-emerald-400">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-300/70">Trading Engine</span>
                  <span className="text-emerald-400">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-300/70">Verification Layer</span>
                  <span className="text-emerald-400">Operational</span>
                </div>
              </div>
            </div>

            <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
              <div className="text-emerald-300/70 text-sm mb-2">Network Uptime</div>
              <div className="text-white mb-4">99.97%</div>
              <div className="h-2 bg-emerald-900/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 w-[99.97%]"></div>
              </div>
            </div>

            <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
              <div className="text-emerald-300/70 text-sm mb-2">24h Transaction Volume</div>
              <div className="text-white mb-2">$2.48B</div>
              <div className="text-emerald-400 text-sm">↑ 12.5% from yesterday</div>
            </div>
          </div>
        </>
      )}

      {/* Operation Views */}
      {activeOperation === 'asset-issuance' && (
        <div>
          <button
            onClick={() => setActiveOperation('overview')}
            className="mb-6 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2"
          >
            ← Back to Operations Hub
          </button>
          <AssetIssuance />
        </div>
      )}

      {activeOperation === 'custodian-onboarding' && (
        <div>
          <button
            onClick={() => setActiveOperation('overview')}
            className="mb-6 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2"
          >
            ← Back to Operations Hub
          </button>
          <CustodianOnboarding />
        </div>
      )}

      {activeOperation === 'impact-reporting' && (
        <div>
          <button
            onClick={() => setActiveOperation('overview')}
            className="mb-6 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2"
          >
            ← Back to Operations Hub
          </button>
          <ImpactReporting />
        </div>
      )}

      {activeOperation === 'governance' && (
        <div>
          <button
            onClick={() => setActiveOperation('overview')}
            className="mb-6 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2"
          >
            ← Back to Operations Hub
          </button>
          <GovernanceParticipation />
        </div>
      )}
    </div>
  );
}
