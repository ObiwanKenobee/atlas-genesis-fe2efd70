import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { DollarSign, TrendingUp, Shield, AlertTriangle, Target, Activity, BarChart3, Lock } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AlgorithmicStablecoins() {
  const [selectedMechanism, setSelectedMechanism] = useState('rebase');

  // Stablecoin mechanisms
  const mechanisms = [
    {
      id: 'rebase',
      name: 'Elastic Supply (Rebase)',
      description: 'Automatically adjusts token supply to maintain peg',
      risk: 'Medium',
      capital: 'Low',
      examples: 'Ampleforth, Yam',
      rveImplementation: 'Regenerative Rebase Token (RRT)'
    },
    {
      id: 'seigniorage',
      name: 'Seigniorage Shares',
      description: 'Two-token system with bonds and shares',
      risk: 'High',
      capital: 'Medium',
      examples: 'Basis Cash, Empty Set Dollar',
      rveImplementation: 'RVE Stability Shares (RSS)'
    },
    {
      id: 'overcollateralized',
      name: 'Crypto-Collateralized',
      description: 'Over-collateralized by crypto assets',
      risk: 'Low',
      capital: 'High',
      examples: 'DAI, LUSD',
      rveImplementation: 'Collateralized RVE Dollar (cRVD)'
    },
    {
      id: 'fractional',
      name: 'Fractional-Algorithmic',
      description: 'Hybrid of collateralized and algorithmic',
      risk: 'Medium',
      capital: 'Medium',
      examples: 'Frax, Neutrino',
      rveImplementation: 'Hybrid Stability Token (HST)'
    },
  ];

  // RVD (Regenerative Dollar) metrics
  const rvdMetrics = {
    price: 1.002,
    marketCap: 48300000,
    totalSupply: 48204191,
    circulatingSupply: 47856234,
    collateralRatio: 125,
    peggingAccuracy: 99.8,
    volume24h: 12400000,
    holders: 8934
  };

  // Price stability history
  const priceHistory = [
    { time: '00:00', price: 0.998, volume: 450000 },
    { time: '04:00', price: 1.001, volume: 320000 },
    { time: '08:00', price: 0.999, volume: 580000 },
    { time: '12:00', price: 1.003, volume: 890000 },
    { time: '16:00', price: 1.001, volume: 1200000 },
    { time: '20:00', price: 1.002, volume: 750000 },
  ];

  // Collateral composition
  const collateralComposition = [
    { date: 'Jan', rve: 40, usdc: 35, dai: 15, eth: 10 },
    { date: 'Feb', rve: 42, usdc: 33, dai: 15, eth: 10 },
    { date: 'Mar', rve: 45, usdc: 30, dai: 15, eth: 10 },
    { date: 'Apr', rve: 47, usdc: 28, dai: 15, eth: 10 },
    { date: 'May', rve: 50, usdc: 25, dai: 15, eth: 10 },
    { date: 'Jun', rve: 52, usdc: 23, dai: 15, eth: 10 },
  ];

  // Stability mechanisms
  const stabilityMechanisms = [
    {
      icon: Target,
      title: 'Redemption Arbitrage',
      description: 'Users can redeem RVD for $1 worth of collateral',
      status: 'Active',
      effectiveness: 98
    },
    {
      icon: Activity,
      title: 'Algorithmic Rebalancing',
      description: 'Smart contracts automatically adjust collateral ratios',
      status: 'Active',
      effectiveness: 95
    },
    {
      icon: Lock,
      title: 'Stability Pool',
      description: '$5.2M reserve pool for emergency stabilization',
      status: 'Active',
      effectiveness: 99
    },
    {
      icon: BarChart3,
      title: 'Dynamic Interest Rates',
      description: 'Rates adjust based on demand to maintain peg',
      status: 'Active',
      effectiveness: 92
    },
  ];

  // Risk metrics
  const riskMetrics = [
    { metric: 'Collateral Ratio', current: 125, target: 120, safe: 150, critical: 110 },
    { metric: 'Liquidity Coverage', current: 180, target: 150, safe: 200, critical: 100 },
    { metric: 'Volatility Index', current: 2.3, target: 3.0, safe: 5.0, critical: 1.0 },
  ];

  // Governance parameters
  const governanceParams = [
    { parameter: 'Minimum Collateral Ratio', current: '120%', proposedChange: null },
    { parameter: 'Stability Fee', current: '2.5%', proposedChange: '2.0%' },
    { parameter: 'Liquidation Penalty', current: '13%', proposedChange: null },
    { parameter: 'Debt Ceiling', current: '$100M', proposedChange: '$150M' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white mb-2">Algorithmic Stablecoins</h2>
        <p className="text-emerald-300/70">Decentralized stable-value tokens for the regenerative economy</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">RVD Price</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">${rvdMetrics.price.toFixed(3)}</div>
          <div className="text-emerald-400 text-sm">{rvdMetrics.peggingAccuracy}% peg accuracy</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Market Cap</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">${(rvdMetrics.marketCap / 1000000).toFixed(1)}M</div>
          <div className="text-emerald-400 text-sm">+12.4% from last month</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Collateral Ratio</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">{rvdMetrics.collateralRatio}%</div>
          <div className="text-emerald-400 text-sm">Above minimum 120%</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">24h Volume</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">${(rvdMetrics.volume24h / 1000000).toFixed(1)}M</div>
          <div className="text-emerald-400 text-sm">8,934 unique holders</div>
        </Card>
      </div>

      {/* Stability Mechanisms */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Algorithmic Mechanisms</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {mechanisms.map((mechanism) => (
            <div
              key={mechanism.id}
              className={`bg-slate-900/50 border rounded-lg p-4 cursor-pointer transition-all ${
                selectedMechanism === mechanism.id
                  ? 'border-emerald-400 bg-emerald-400/10'
                  : 'border-emerald-500/20 hover:border-emerald-400/50'
              }`}
              onClick={() => setSelectedMechanism(mechanism.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{mechanism.name}</h4>
                  <p className="text-emerald-300/70 text-sm mt-1">{mechanism.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <div className="text-emerald-300/70 text-xs">Risk</div>
                  <Badge 
                    className={
                      mechanism.risk === 'Low' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : mechanism.risk === 'Medium'
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }
                  >
                    {mechanism.risk}
                  </Badge>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Capital</div>
                  <div className="text-white text-sm">{mechanism.capital}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Examples</div>
                  <div className="text-white text-sm truncate">{mechanism.examples.split(',')[0]}</div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-2">
                <div className="text-emerald-300/70 text-xs">RVE Implementation</div>
                <div className="text-white text-sm font-medium">{mechanism.rveImplementation}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Price Stability Chart */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">RVD Price Stability (24h)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={priceHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="time" stroke="#6ee7b7" />
            <YAxis domain={[0.99, 1.01]} stroke="#6ee7b7" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b98150' }}
              labelStyle={{ color: '#6ee7b7' }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
            />
            {/* Target line at $1 */}
            <Line 
              type="monotone" 
              dataKey={() => 1.0} 
              stroke="#ef4444" 
              strokeDasharray="5 5"
              strokeWidth={1}
              dot={false}
              name="Target Peg"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Collateral Composition */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Collateral Composition Over Time (%)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={collateralComposition}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="date" stroke="#6ee7b7" />
            <YAxis stroke="#6ee7b7" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b98150' }}
              labelStyle={{ color: '#6ee7b7' }}
            />
            <Area type="monotone" dataKey="rve" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            <Area type="monotone" dataKey="usdc" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            <Area type="monotone" dataKey="dai" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
            <Area type="monotone" dataKey="eth" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Stability Mechanisms */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Active Stability Mechanisms</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stabilityMechanisms.map((mechanism, index) => {
            const Icon = mechanism.icon;
            return (
              <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-emerald-500/20 p-2 rounded-lg">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    {mechanism.status}
                  </Badge>
                </div>
                <h4 className="text-white font-medium mb-2">{mechanism.title}</h4>
                <p className="text-emerald-300/70 text-sm mb-3">{mechanism.description}</p>
                <div>
                  <div className="text-emerald-300/70 text-xs">Effectiveness</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-slate-900/50 rounded-full h-2">
                      <div 
                        className="bg-emerald-400 h-2 rounded-full"
                        style={{ width: `${mechanism.effectiveness}%` }}
                      />
                    </div>
                    <span className="text-white text-sm">{mechanism.effectiveness}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Risk Dashboard */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Risk Monitoring Dashboard</h3>
        
        <div className="space-y-4">
          {riskMetrics.map((metric, index) => (
            <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">{metric.metric}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-300/70 text-sm">Current:</span>
                  <span className="text-white font-medium">{metric.current}{metric.metric.includes('Ratio') ? '%' : ''}</span>
                </div>
              </div>
              
              <div className="relative">
                <div className="flex justify-between text-xs text-emerald-300/70 mb-1">
                  <span>Critical</span>
                  <span>Target</span>
                  <span>Safe</span>
                </div>
                <div className="h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 rounded-full relative">
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded"
                    style={{ 
                      left: `${((metric.current - metric.critical) / (metric.safe - metric.critical)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Governance Parameters */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Governance Parameters</h3>
        
        <div className="space-y-2">
          {governanceParams.map((param, index) => (
            <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-white font-medium">{param.parameter}</div>
                <div className="text-emerald-300/70 text-sm mt-1">Current: {param.current}</div>
              </div>
              {param.proposedChange ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-yellow-400 text-sm">Proposed Change</div>
                    <div className="text-white font-medium">{param.proposedChange}</div>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Voting
                  </Badge>
                </div>
              ) : (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Stable
                </Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Mint/Burn Interface */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Mint or Redeem RVD</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mint */}
          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
            <h4 className="text-white font-medium mb-4">Mint RVD</h4>
            <div className="space-y-4">
              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Collateral Amount</label>
                <input
                  type="number"
                  className="w-full bg-slate-900/50 border border-emerald-500/20 rounded-lg px-4 py-3 text-white"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Collateral Type</label>
                <select className="w-full bg-slate-900/50 border border-emerald-500/20 rounded-lg px-4 py-3 text-white">
                  <option>RVE</option>
                  <option>USDC</option>
                  <option>DAI</option>
                  <option>ETH</option>
                </select>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-300/70">You will receive</span>
                  <span className="text-white font-medium">~0 RVD</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-emerald-300/70">Collateral ratio</span>
                  <span className="text-white font-medium">125%</span>
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                Mint RVD
              </Button>
            </div>
          </div>

          {/* Redeem */}
          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
            <h4 className="text-white font-medium mb-4">Redeem RVD</h4>
            <div className="space-y-4">
              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">RVD Amount</label>
                <input
                  type="number"
                  className="w-full bg-slate-900/50 border border-emerald-500/20 rounded-lg px-4 py-3 text-white"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="text-emerald-300/70 text-sm mb-2 block">Receive Collateral As</label>
                <select className="w-full bg-slate-900/50 border border-emerald-500/20 rounded-lg px-4 py-3 text-white">
                  <option>RVE</option>
                  <option>USDC</option>
                  <option>DAI</option>
                  <option>ETH</option>
                </select>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-300/70">You will receive</span>
                  <span className="text-white font-medium">~$0</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-blue-300/70">Redemption fee</span>
                  <span className="text-white font-medium">0.5%</span>
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                Redeem RVD
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Warning Banner */}
      <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500/20 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-white font-medium mb-2">Important Risk Disclosure</h4>
            <p className="text-yellow-300/70 text-sm">
              Algorithmic stablecoins carry unique risks including depegging events, smart contract vulnerabilities, 
              and economic design flaws. RVD is experimental technology. Always conduct your own research and never 
              invest more than you can afford to lose. Past stability does not guarantee future performance.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
