import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { TrendingUp, TrendingDown, Activity, DollarSign, Shield, AlertTriangle, BarChart3, Target } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ImpactDerivatives() {
  const [selectedContract, setSelectedContract] = useState('carbon-futures');

  // Derivative products
  const derivativeProducts = [
    {
      id: 'carbon-futures',
      name: 'Carbon Credit Futures',
      symbol: 'CCF',
      type: 'Futures',
      underlying: 'Verified Carbon Credits',
      spotPrice: 42.50,
      contractSize: 1000,
      expiry: '2026-12',
      openInterest: 2347,
      volume24h: 45600000,
      status: 'active'
    },
    {
      id: 'biodiversity-options',
      name: 'Biodiversity Index Options',
      symbol: 'BIO',
      type: 'Options',
      underlying: 'RVE Biodiversity Index',
      spotPrice: 128.75,
      contractSize: 100,
      expiry: '2026-06',
      openInterest: 1893,
      volume24h: 23400000,
      status: 'active'
    },
    {
      id: 'forest-swaps',
      name: 'Forest Restoration Swaps',
      symbol: 'FRS',
      type: 'Swaps',
      underlying: 'Forest Cover Increase',
      spotPrice: 85.30,
      contractSize: 500,
      expiry: 'Perpetual',
      openInterest: 3421,
      volume24h: 67800000,
      status: 'active'
    },
    {
      id: 'ocean-perpetuals',
      name: 'Ocean Health Perpetuals',
      symbol: 'OHP',
      type: 'Perpetual',
      underlying: 'Marine Biodiversity Score',
      spotPrice: 54.20,
      contractSize: 200,
      expiry: 'N/A',
      openInterest: 2156,
      volume24h: 34200000,
      status: 'active'
    },
  ];

  // Price history for selected contract
  const priceHistory = [
    { time: '00:00', price: 41.20, volume: 1200000 },
    { time: '04:00', price: 41.85, volume: 980000 },
    { time: '08:00', price: 42.10, volume: 1450000 },
    { time: '12:00', price: 42.75, volume: 2340000 },
    { time: '16:00', price: 42.35, volume: 1890000 },
    { time: '20:00', price: 42.50, volume: 1560000 },
  ];

  // Open interest by expiry
  const openInterestByExpiry = [
    { expiry: 'Jun 2026', calls: 1234, puts: 987 },
    { expiry: 'Sep 2026', calls: 2156, puts: 1876 },
    { expiry: 'Dec 2026', calls: 3421, puts: 2987 },
    { expiry: 'Mar 2027', calls: 2876, puts: 2345 },
    { expiry: 'Jun 2027', calls: 1987, puts: 1654 },
  ];

  // Trading volume by product
  const volumeByProduct = [
    { month: 'Jan', 'Carbon Futures': 28, 'Bio Options': 15, 'Forest Swaps': 42, 'Ocean Perpetuals': 22 },
    { month: 'Feb', 'Carbon Futures': 32, 'Bio Options': 18, 'Forest Swaps': 48, 'Ocean Perpetuals': 25 },
    { month: 'Mar', 'Carbon Futures': 38, 'Bio Options': 21, 'Forest Swaps': 54, 'Ocean Perpetuals': 28 },
    { month: 'Apr', 'Carbon Futures': 42, 'Bio Options': 24, 'Forest Swaps': 61, 'Ocean Perpetuals': 32 },
    { month: 'May', 'Carbon Futures': 45, 'Bio Options': 27, 'Forest Swaps': 67, 'Ocean Perpetuals': 34 },
    { month: 'Jun', 'Carbon Futures': 46, 'Bio Options': 23, 'Forest Swaps': 68, 'Ocean Perpetuals': 34 },
  ];

  // Risk metrics
  const riskMetrics = [
    { metric: 'Value at Risk (95%)', value: '$2.4M', change: -8.3, status: 'good' },
    { metric: 'Expected Shortfall', value: '$3.8M', change: -5.2, status: 'good' },
    { metric: 'Max Drawdown', value: '12.4%', change: 2.1, status: 'warning' },
    { metric: 'Sharpe Ratio', value: '1.87', change: 0.14, status: 'good' },
  ];

  // Market makers
  const marketMakers = [
    { name: 'Regenerative Capital MM', volume: 23400000, spread: '0.05%', uptime: 99.9 },
    { name: 'Green Finance Markets', volume: 18900000, spread: '0.08%', uptime: 99.7 },
    { name: 'Impact Trading Group', volume: 12300000, spread: '0.12%', uptime: 99.5 },
  ];

  // Trading strategies
  const strategies = [
    {
      icon: Target,
      name: 'Impact Hedging',
      description: 'Hedge against carbon price volatility while maintaining ESG exposure',
      aum: 45000000,
      returns: 8.4
    },
    {
      icon: TrendingUp,
      name: 'Long Biodiversity',
      description: 'Bullish position on increasing biodiversity valuations',
      aum: 32000000,
      returns: 12.7
    },
    {
      icon: Activity,
      name: 'Basis Trading',
      description: 'Arbitrage between spot and futures markets',
      aum: 28000000,
      returns: 6.2
    },
    {
      icon: BarChart3,
      name: 'Volatility Capture',
      description: 'Options strategies to profit from market volatility',
      aum: 19000000,
      returns: 15.3
    },
  ];

  // Settlement mechanisms
  const settlements = [
    {
      type: 'Physical Delivery',
      description: 'Actual transfer of verified impact credits',
      volume: 45,
      examples: ['Carbon credits', 'Biodiversity certificates']
    },
    {
      type: 'Cash Settlement',
      description: 'Financial settlement based on index price',
      volume: 55,
      examples: ['Index options', 'Perpetual contracts']
    },
  ];

  const selectedProduct = derivativeProducts.find(p => p.id === selectedContract);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white mb-2">Impact Derivatives Market</h2>
        <p className="text-emerald-300/70">Advanced financial instruments for hedging and speculation on regenerative outcomes</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Total Volume (24h)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">$171M</div>
          <div className="text-emerald-400 text-sm">+18.4% from yesterday</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Open Interest</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">9,817</div>
          <div className="text-emerald-400 text-sm">Active contracts</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Products</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">{derivativeProducts.length}</div>
          <div className="text-emerald-400 text-sm">Derivative instruments</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Liquidity</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">$54M</div>
          <div className="text-emerald-400 text-sm">Market maker pools</div>
        </Card>
      </div>

      {/* Derivative Products */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Available Derivative Products</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {derivativeProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-slate-900/50 border rounded-lg p-4 cursor-pointer transition-all ${
                selectedContract === product.id
                  ? 'border-emerald-400 bg-emerald-400/10'
                  : 'border-emerald-500/20 hover:border-emerald-400/50'
              }`}
              onClick={() => setSelectedContract(product.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{product.name}</h4>
                  <div className="text-emerald-300/70 text-sm mt-1">{product.symbol} • {product.type}</div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  {product.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-emerald-300/70 text-xs">Spot Price</div>
                  <div className="text-white font-medium">${product.spotPrice}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Contract Size</div>
                  <div className="text-white font-medium">{product.contractSize}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Open Interest</div>
                  <div className="text-white font-medium">{product.openInterest.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">24h Volume</div>
                  <div className="text-white font-medium">${(product.volume24h / 1000000).toFixed(1)}M</div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-2">
                <div className="text-emerald-300/70 text-xs">Underlying</div>
                <div className="text-white text-sm">{product.underlying}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Price Chart */}
      {selectedProduct && (
        <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white">{selectedProduct.name} - 24h Chart</h3>
            <div className="text-right">
              <div className="text-emerald-300/70 text-sm">Current Price</div>
              <div className="text-white text-2xl">${selectedProduct.spotPrice}</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={priceHistory}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="time" stroke="#6ee7b7" />
              <YAxis stroke="#6ee7b7" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b98150' }}
                labelStyle={{ color: '#6ee7b7' }}
              />
              <Area type="monotone" dataKey="price" stroke="#10b981" fill="url(#priceGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Open Interest */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Open Interest by Expiry</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={openInterestByExpiry}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="expiry" stroke="#6ee7b7" />
            <YAxis stroke="#6ee7b7" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b98150' }}
              labelStyle={{ color: '#6ee7b7' }}
            />
            <Bar dataKey="calls" fill="#10b981" name="Calls" />
            <Bar dataKey="puts" fill="#ef4444" name="Puts" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Volume Trends */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Trading Volume Trends ($M)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={volumeByProduct}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="month" stroke="#6ee7b7" />
            <YAxis stroke="#6ee7b7" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b98150' }}
              labelStyle={{ color: '#6ee7b7' }}
            />
            <Line type="monotone" dataKey="Forest Swaps" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="Carbon Futures" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="Ocean Perpetuals" stroke="#f59e0b" strokeWidth={2} />
            <Line type="monotone" dataKey="Bio Options" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Risk Metrics */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Portfolio Risk Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {riskMetrics.map((metric, index) => (
            <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
              <div className="text-emerald-300/70 text-sm mb-2">{metric.metric}</div>
              <div className="text-white text-2xl font-medium mb-2">{metric.value}</div>
              <div className="flex items-center gap-2">
                {metric.change > 0 ? (
                  <TrendingUp className={`w-4 h-4 ${metric.status === 'warning' ? 'text-yellow-400' : 'text-red-400'}`} />
                ) : (
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                )}
                <span className={
                  metric.status === 'good' ? 'text-emerald-400' : 
                  metric.status === 'warning' ? 'text-yellow-400' : 
                  'text-red-400'
                }>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Market Makers */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Market Makers & Liquidity Providers</h3>
        
        <div className="space-y-3">
          {marketMakers.map((mm, index) => (
            <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">{mm.name}</h4>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Active
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-emerald-300/70 text-xs">24h Volume</div>
                  <div className="text-white font-medium">${(mm.volume / 1000000).toFixed(1)}M</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Avg Spread</div>
                  <div className="text-white font-medium">{mm.spread}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Uptime</div>
                  <div className="text-emerald-400 font-medium">{mm.uptime}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Trading Strategies */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Popular Trading Strategies</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {strategies.map((strategy, index) => {
            const Icon = strategy.icon;
            return (
              <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
                <div className="bg-emerald-500/20 p-3 rounded-lg w-fit mb-3">
                  <Icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-white font-medium mb-2">{strategy.name}</h4>
                <p className="text-emerald-300/70 text-sm mb-4">{strategy.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-emerald-300/70 text-xs">AUM</div>
                    <div className="text-white font-medium">${(strategy.aum / 1000000).toFixed(0)}M</div>
                  </div>
                  <div>
                    <div className="text-emerald-300/70 text-xs">Returns</div>
                    <div className="text-emerald-400 font-medium">+{strategy.returns}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Settlement Methods */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Settlement Mechanisms</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settlements.map((settlement, index) => (
            <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">{settlement.type}</h4>
              <p className="text-emerald-300/70 text-sm mb-4">{settlement.description}</p>
              <div className="mb-3">
                <div className="text-emerald-300/70 text-xs mb-2">Market Share</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-900/50 rounded-full h-2">
                    <div 
                      className="bg-emerald-400 h-2 rounded-full"
                      style={{ width: `${settlement.volume}%` }}
                    />
                  </div>
                  <span className="text-white font-medium">{settlement.volume}%</span>
                </div>
              </div>
              <div>
                <div className="text-emerald-300/70 text-xs mb-1">Used for</div>
                <div className="flex gap-2">
                  {settlement.examples.map((example, eIndex) => (
                    <Badge key={eIndex} className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Risk Warning */}
      <Card className="bg-gradient-to-br from-red-900/40 to-orange-900/40 border-red-500/20 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-white font-medium mb-2">High Risk Trading Instruments</h4>
            <p className="text-red-300/70 text-sm">
              Derivatives trading involves substantial risk of loss and is not suitable for all investors. 
              Impact derivatives may experience high volatility due to environmental, regulatory, and market factors. 
              Only trade with capital you can afford to lose. Past performance is not indicative of future results.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
