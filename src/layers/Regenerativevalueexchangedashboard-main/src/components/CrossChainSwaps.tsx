import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowRightLeft, CheckCircle2, Clock, AlertCircle, Zap, Lock, Shield, Network, TrendingUp, Coins } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function CrossChainSwaps() {
  const [selectedFromChain, setSelectedFromChain] = useState('ethereum');
  const [selectedToChain, setSelectedToChain] = useState('polygon');
  const [swapAmount, setSwapAmount] = useState('100');

  // Supported chains
  const chains = [
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', color: '#627EEA', tvl: '$2.4B', fee: '0.3%' },
    { id: 'polygon', name: 'Polygon', symbol: 'MATIC', color: '#8247E5', tvl: '$856M', fee: '0.1%' },
    { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB', color: '#28A0F0', tvl: '$1.2B', fee: '0.15%' },
    { id: 'optimism', name: 'Optimism', symbol: 'OP', color: '#FF0420', tvl: '$945M', fee: '0.12%' },
    { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', color: '#E84142', tvl: '$678M', fee: '0.2%' },
    { id: 'bsc', name: 'BSC', symbol: 'BNB', color: '#F3BA2F', tvl: '$534M', fee: '0.18%' },
  ];

  // Atomic swap protocols
  const protocols = [
    { 
      name: 'HTLC (Hash Time-Locked Contracts)', 
      status: 'Active', 
      swaps24h: 1247, 
      successRate: 99.8,
      avgTime: '45s',
      description: 'Time-locked contracts ensuring atomic execution'
    },
    { 
      name: 'IBC (Inter-Blockchain Communication)', 
      status: 'Active', 
      swaps24h: 893, 
      successRate: 99.5,
      avgTime: '38s',
      description: 'Cross-chain communication protocol'
    },
    { 
      name: 'LayerZero Omnichain', 
      status: 'Active', 
      swaps24h: 2156, 
      successRate: 99.9,
      avgTime: '22s',
      description: 'Ultralight on-chain endpoints'
    },
    { 
      name: 'Wormhole Bridge', 
      status: 'Active', 
      swaps24h: 1534, 
      successRate: 99.6,
      avgTime: '52s',
      description: 'Generic message passing protocol'
    },
  ];

  // Recent swap activity
  const recentSwaps = [
    { from: 'ETH', to: 'MATIC', amount: 250, status: 'completed', time: '2m ago', protocol: 'LayerZero' },
    { from: 'ARB', to: 'OP', amount: 500, status: 'pending', time: '5m ago', protocol: 'HTLC' },
    { from: 'AVAX', to: 'ETH', amount: 1200, status: 'completed', time: '12m ago', protocol: 'IBC' },
    { from: 'BNB', to: 'MATIC', amount: 350, status: 'completed', time: '18m ago', protocol: 'Wormhole' },
    { from: 'ETH', to: 'ARB', amount: 750, status: 'completed', time: '24m ago', protocol: 'LayerZero' },
    { from: 'OP', to: 'AVAX', amount: 420, status: 'pending', time: '31m ago', protocol: 'HTLC' },
  ];

  // Volume data
  const volumeData = [
    { date: 'Jan', volume: 12500000, swaps: 4200 },
    { date: 'Feb', volume: 15800000, swaps: 5100 },
    { date: 'Mar', volume: 18400000, swaps: 6300 },
    { date: 'Apr', volume: 22100000, swaps: 7800 },
    { date: 'May', volume: 27300000, swaps: 9200 },
    { date: 'Jun', volume: 31800000, swaps: 10500 },
  ];

  // Chain distribution
  const chainDistribution = [
    { name: 'Ethereum', value: 35, color: '#627EEA' },
    { name: 'Polygon', value: 22, color: '#8247E5' },
    { name: 'Arbitrum', value: 18, color: '#28A0F0' },
    { name: 'Optimism', value: 12, color: '#FF0420' },
    { name: 'Others', value: 13, color: '#64748B' },
  ];

  // Security features
  const securityFeatures = [
    { icon: Lock, title: 'Atomic Execution', description: 'All-or-nothing swap guarantee', status: 'active' },
    { icon: Shield, title: 'Multi-Sig Validation', description: '3-of-5 validator consensus', status: 'active' },
    { icon: Zap, title: 'Flash Loan Protection', description: 'MEV and sandwich attack prevention', status: 'active' },
    { icon: Network, title: 'Decentralized Relayers', description: 'No single point of failure', status: 'active' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const calculateEstimatedFee = () => {
    const fromChain = chains.find(c => c.id === selectedFromChain);
    const toChain = chains.find(c => c.id === selectedToChain);
    const avgFee = ((parseFloat(fromChain?.fee || '0') + parseFloat(toChain?.fee || '0')) / 2).toFixed(2);
    return (parseFloat(swapAmount || '0') * parseFloat(avgFee) / 100).toFixed(4);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white mb-2">Cross-Chain Atomic Swaps</h2>
        <p className="text-emerald-300/70">Trustless cross-chain asset exchanges with guaranteed atomicity</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">24h Volume</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">$31.8M</div>
          <div className="text-emerald-400 text-sm">+18.4% from yesterday</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Total Swaps</span>
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">10,547</div>
          <div className="text-emerald-400 text-sm">+12.3% from yesterday</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">99.8%</div>
          <div className="text-emerald-400 text-sm">15,892 of 15,924 swaps</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Avg Time</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">39s</div>
          <div className="text-emerald-400 text-sm">-8s from last week</div>
        </Card>
      </div>

      {/* Swap Interface */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Initiate Cross-Chain Swap</h3>
        
        <div className="space-y-4">
          {/* From Chain */}
          <div>
            <label className="text-emerald-300/70 text-sm mb-2 block">From Chain</label>
            <div className="grid grid-cols-3 gap-2">
              {chains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => setSelectedFromChain(chain.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedFromChain === chain.id
                      ? 'border-emerald-400 bg-emerald-400/10'
                      : 'border-emerald-500/20 bg-slate-900/50 hover:border-emerald-400/50'
                  }`}
                >
                  <div className="text-white text-sm font-medium">{chain.name}</div>
                  <div className="text-emerald-300/70 text-xs mt-1">{chain.symbol}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Swap Direction Indicator */}
          <div className="flex justify-center">
            <div className="bg-emerald-500/20 p-3 rounded-full">
              <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* To Chain */}
          <div>
            <label className="text-emerald-300/70 text-sm mb-2 block">To Chain</label>
            <div className="grid grid-cols-3 gap-2">
              {chains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => setSelectedToChain(chain.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedToChain === chain.id
                      ? 'border-emerald-400 bg-emerald-400/10'
                      : 'border-emerald-500/20 bg-slate-900/50 hover:border-emerald-400/50'
                  }`}
                >
                  <div className="text-white text-sm font-medium">{chain.name}</div>
                  <div className="text-emerald-300/70 text-xs mt-1">{chain.symbol}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-emerald-300/70 text-sm mb-2 block">Amount (RVE)</label>
            <input
              type="number"
              value={swapAmount}
              onChange={(e) => setSwapAmount(e.target.value)}
              className="w-full bg-slate-900/50 border border-emerald-500/20 rounded-lg px-4 py-3 text-white"
              placeholder="Enter amount"
            />
          </div>

          {/* Swap Details */}
          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-emerald-300/70">Estimated Fee</span>
              <span className="text-white">{calculateEstimatedFee()} RVE</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-emerald-300/70">Estimated Time</span>
              <span className="text-white">~30-60 seconds</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-emerald-300/70">Protocol</span>
              <span className="text-white">LayerZero (Auto-selected)</span>
            </div>
          </div>

          <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
            Execute Atomic Swap
          </Button>
        </div>
      </Card>

      {/* Supported Protocols */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Atomic Swap Protocols</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {protocols.map((protocol, index) => (
            <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{protocol.name}</h4>
                  <p className="text-emerald-300/70 text-sm mt-1">{protocol.description}</p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  {protocol.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div>
                  <div className="text-emerald-300/70 text-xs">24h Swaps</div>
                  <div className="text-white font-medium">{protocol.swaps24h.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Success Rate</div>
                  <div className="text-white font-medium">{protocol.successRate}%</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Avg Time</div>
                  <div className="text-white font-medium">{protocol.avgTime}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Volume Chart and Chain Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Over Time */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">Swap Volume Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={volumeData}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" stroke="#6ee7b7" />
              <YAxis stroke="#6ee7b7" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b98150' }}
                labelStyle={{ color: '#6ee7b7' }}
              />
              <Area type="monotone" dataKey="volume" stroke="#10b981" fill="url(#volumeGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Chain Distribution */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">Cross-Chain Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chainDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chainDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b98150' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Security Features */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Security Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-500/20 p-2 rounded-lg">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    {feature.status}
                  </Badge>
                </div>
                <h4 className="text-white font-medium mb-1">{feature.title}</h4>
                <p className="text-emerald-300/70 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Swap Activity */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Recent Swap Activity</h3>
        
        <div className="space-y-2">
          {recentSwaps.map((swap, index) => (
            <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(swap.status)}
                <div>
                  <div className="text-white font-medium">
                    {swap.amount} RVE: {swap.from} → {swap.to}
                  </div>
                  <div className="text-emerald-300/70 text-sm">
                    via {swap.protocol} • {swap.time}
                  </div>
                </div>
              </div>
              <Badge 
                className={
                  swap.status === 'completed' 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : swap.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }
              >
                {swap.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Supported Chains Details */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Supported Chains</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chains.map((chain) => (
            <div key={chain.id} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{chain.name}</h4>
                  <div className="text-emerald-300/70 text-sm">{chain.symbol}</div>
                </div>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: chain.color + '30' }}
                >
                  <Coins className="w-5 h-5" style={{ color: chain.color }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-emerald-300/70 text-xs">TVL</div>
                  <div className="text-white font-medium">{chain.tvl}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Fee</div>
                  <div className="text-white font-medium">{chain.fee}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
