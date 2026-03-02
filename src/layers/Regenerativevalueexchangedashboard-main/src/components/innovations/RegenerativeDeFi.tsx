import { useState } from 'react';
import { Coins, TrendingUp, Lock, Zap, ArrowRightLeft, Droplet, Shield, AlertCircle } from 'lucide-react';

interface LiquidityPool {
  id: string;
  pair: string;
  token1: string;
  token2: string;
  tvl: number;
  apy: number;
  volume24h: number;
  impactCategory: string;
}

interface YieldFarm {
  id: string;
  name: string;
  token: string;
  apy: number;
  tvl: number;
  lockPeriod: string;
  impactProject: string;
  verified: boolean;
}

export function RegenerativeDeFi() {
  const [selectedTab, setSelectedTab] = useState<'pools' | 'farms' | 'bridge' | 'lending'>('pools');

  const liquidityPools: LiquidityPool[] = [
    { id: 'CARB-USDC', pair: 'CARB/USDC', token1: 'CARB', token2: 'USDC', tvl: 12400000, apy: 24.7, volume24h: 2100000, impactCategory: 'Carbon' },
    { id: 'FRST-ETH', pair: 'FRST/ETH', token1: 'FRST', token2: 'ETH', tvl: 8900000, apy: 31.2, volume24h: 1600000, impactCategory: 'Forests' },
    { id: 'WELL-DAI', pair: 'WELL/DAI', token1: 'WELL', token2: 'DAI', tvl: 6700000, apy: 18.9, volume24h: 980000, impactCategory: 'Health' },
    { id: 'LANG-USDC', pair: 'LANG/USDC', token1: 'LANG', token2: 'USDC', tvl: 4200000, apy: 42.3, volume24h: 650000, impactCategory: 'Culture' }
  ];

  const yieldFarms: YieldFarm[] = [
    { id: 'YF-001', name: 'Amazon Restoration Vault', token: 'CARB', apy: 36.5, tvl: 18700000, lockPeriod: '3 months', impactProject: 'Amazon Corridor', verified: true },
    { id: 'YF-002', name: 'Wetland Revival Pool', token: 'WETL', apy: 28.3, tvl: 9400000, lockPeriod: '6 months', impactProject: 'Coastal Wetlands', verified: true },
    { id: 'YF-003', name: 'Community Wellness Fund', token: 'WELL', apy: 22.1, tvl: 7600000, lockPeriod: '1 month', impactProject: 'Global Health', verified: true },
    { id: 'YF-004', name: 'Biodiversity Boost', token: 'BIO', apy: 45.8, tvl: 5200000, lockPeriod: '12 months', impactProject: 'Species Protection', verified: true }
  ];

  const crossChainAssets = [
    { chain: 'Ethereum', icon: '⟠', assets: 89, volume: '$847M', color: 'blue' },
    { chain: 'Polygon', icon: '⬡', assets: 67, volume: '$423M', color: 'purple' },
    { chain: 'Arbitrum', icon: '◈', assets: 45, volume: '$289M', color: 'cyan' },
    { chain: 'Optimism', icon: '◉', assets: 34, volume: '$156M', color: 'red' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white">Regenerative DeFi Protocol</h2>
            <p className="text-emerald-300/80">Decentralized finance where yields fund ecological restoration</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="text-emerald-300/70 text-sm mb-2">Total Value Locked</div>
          <div className="text-white mb-1">$124.8M</div>
          <div className="flex items-center gap-1 text-emerald-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+18.7%</span>
          </div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="text-emerald-300/70 text-sm mb-2">24h Volume</div>
          <div className="text-white mb-1">$5.4M</div>
          <div className="flex items-center gap-1 text-emerald-400 text-sm">
            <Zap className="w-4 h-4" />
            <span>Real-time</span>
          </div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="text-emerald-300/70 text-sm mb-2">Impact Funding</div>
          <div className="text-white mb-1">$12.4M</div>
          <div className="text-emerald-400 text-sm">Generated monthly</div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="text-emerald-300/70 text-sm mb-2">Active Users</div>
          <div className="text-white mb-1">23,847</div>
          <div className="text-emerald-400 text-sm">Across 4 chains</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-2">
        {[
          { id: 'pools' as const, label: 'Liquidity Pools', icon: Droplet },
          { id: 'farms' as const, label: 'Yield Farms', icon: Coins },
          { id: 'bridge' as const, label: 'Cross-Chain', icon: ArrowRightLeft },
          { id: 'lending' as const, label: 'Lending', icon: Lock }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                selectedTab === tab.id
                  ? 'bg-emerald-500 text-white'
                  : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Liquidity Pools */}
      {selectedTab === 'pools' && (
        <div className="space-y-6">
          <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-white mb-6">Active Liquidity Pools</h3>
            <div className="space-y-4">
              {liquidityPools.map((pool) => (
                <div key={pool.id} className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-5 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white">
                          {pool.token1.substring(0, 2)}
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white -ml-3">
                          {pool.token2.substring(0, 2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-white mb-1">{pool.pair}</div>
                        <div className="text-emerald-300/70 text-sm">{pool.impactCategory} Impact</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 mb-1">{pool.apy}% APY</div>
                      <div className="text-emerald-300/70 text-sm">Annual Yield</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-emerald-300/70 text-xs mb-1">Total Liquidity</div>
                      <div className="text-white">${(pool.tvl / 1000000).toFixed(2)}M</div>
                    </div>
                    <div>
                      <div className="text-emerald-300/70 text-xs mb-1">24h Volume</div>
                      <div className="text-white">${(pool.volume24h / 1000000).toFixed(2)}M</div>
                    </div>
                    <div>
                      <div className="text-emerald-300/70 text-xs mb-1">Your Share</div>
                      <div className="text-white">0.00%</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm transition-all">
                      Add Liquidity
                    </button>
                    <button className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-sm transition-all border border-emerald-500/30">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
            <h4 className="text-white mb-4">How Regenerative Liquidity Works</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-white text-sm mb-2">1. Provide Liquidity</div>
                <div className="text-emerald-300/70 text-sm">
                  Add pairs of tokens to liquidity pools and receive LP tokens representing your share
                </div>
              </div>
              <div>
                <div className="text-white text-sm mb-2">2. Earn Trading Fees</div>
                <div className="text-emerald-300/70 text-sm">
                  Collect fees from traders using the pool (0.3% per swap)
                </div>
              </div>
              <div>
                <div className="text-white text-sm mb-2">3. Fund Impact</div>
                <div className="text-emerald-300/70 text-sm">
                  10% of protocol fees automatically fund verified regenerative projects
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yield Farms */}
      {selectedTab === 'farms' && (
        <div className="space-y-6">
          <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white">Regenerative Yield Farms</h3>
              <div className="text-emerald-300/70 text-sm">Stake tokens to fund restoration projects</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {yieldFarms.map((farm) => (
                <div key={farm.id} className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-6 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-white">{farm.name}</h4>
                        {farm.verified && (
                          <Shield className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="text-emerald-300/70 text-sm">{farm.token} • {farm.lockPeriod}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 mb-1">{farm.apy}%</div>
                      <div className="text-emerald-300/70 text-xs">APY</div>
                    </div>
                  </div>

                  <div className="bg-emerald-900/20 rounded-lg p-4 mb-4">
                    <div className="text-emerald-300/70 text-xs mb-1">Funds Support</div>
                    <div className="text-emerald-400 text-sm">{farm.impactProject}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-emerald-300/70 text-xs mb-1">TVL</div>
                      <div className="text-white">${(farm.tvl / 1000000).toFixed(2)}M</div>
                    </div>
                    <div>
                      <div className="text-emerald-300/70 text-xs mb-1">Your Stake</div>
                      <div className="text-white">$0.00</div>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all">
                    Stake Tokens
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Distribution */}
          <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-white mb-4">Monthly Impact Distribution</h3>
            <div className="space-y-3">
              {[
                { project: 'Amazon Corridor Restoration', allocated: 3800000, percentage: 31 },
                { project: 'Coastal Wetland Revival', allocated: 2400000, percentage: 19 },
                { project: 'Community Health Programs', allocated: 2100000, percentage: 17 },
                { project: 'Biodiversity Conservation', allocated: 1900000, percentage: 15 },
                { project: 'Cultural Preservation', allocated: 1600000, percentage: 13 },
                { project: 'Reserve Fund', allocated: 600000, percentage: 5 }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-white text-sm mb-1">{item.project}</div>
                    <div className="h-2 bg-emerald-900/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-6 text-right">
                    <div className="text-emerald-400">{item.percentage}%</div>
                    <div className="text-emerald-300/70 text-xs">${(item.allocated / 1000000).toFixed(2)}M</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cross-Chain Bridge */}
      {selectedTab === 'bridge' && (
        <div className="space-y-6">
          <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-white mb-6">Cross-Chain Asset Bridge</h3>
            
            {/* Bridge Interface */}
            <div className="bg-emerald-900/10 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div>
                  <label className="text-emerald-300/70 text-sm mb-2 block">From Chain</label>
                  <select className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/40">
                    <option>Ethereum</option>
                    <option>Polygon</option>
                    <option>Arbitrum</option>
                    <option>Optimism</option>
                  </select>
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRightLeft className="w-8 h-8 text-emerald-400" />
                </div>

                <div>
                  <label className="text-emerald-300/70 text-sm mb-2 block">To Chain</label>
                  <select className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/40">
                    <option>Polygon</option>
                    <option>Ethereum</option>
                    <option>Arbitrum</option>
                    <option>Optimism</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="text-emerald-300/70 text-sm mb-2 block">Asset to Bridge</label>
                <select className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/40 mb-4">
                  <option>CARB - Carbon Credits</option>
                  <option>FRST - Forest Tokens</option>
                  <option>WELL - Wellness Bonds</option>
                  <option>LANG - Language Units</option>
                </select>

                <label className="text-emerald-300/70 text-sm mb-2 block">Amount</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40 mb-4"
                />

                <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-amber-400 text-sm mb-1">Estimated Bridge Time: 5-10 minutes</div>
                      <div className="text-emerald-300/70 text-sm">Bridge Fee: 0.1% • Gas Fee: ~$2.50</div>
                    </div>
                  </div>
                </div>

                <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all">
                  Bridge Assets
                </button>
              </div>
            </div>

            {/* Supported Chains */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {crossChainAssets.map((chain) => (
                <div key={chain.chain} className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-4">
                  <div className="text-3xl mb-2">{chain.icon}</div>
                  <div className="text-white mb-1">{chain.chain}</div>
                  <div className="text-emerald-300/70 text-sm mb-2">{chain.assets} assets</div>
                  <div className="text-emerald-400 text-sm">{chain.volume} volume</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lending */}
      {selectedTab === 'lending' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supply */}
            <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
              <h3 className="text-white mb-6">Supply Assets</h3>
              <div className="space-y-4">
                {[
                  { asset: 'CARB', apy: 5.2, supplied: 8900000 },
                  { asset: 'FRST', apy: 4.8, supplied: 6700000 },
                  { asset: 'WELL', apy: 6.1, supplied: 5400000 }
                ].map((item) => (
                  <div key={item.asset} className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-white">{item.asset}</div>
                      <div className="text-emerald-400">{item.apy}% APY</div>
                    </div>
                    <div className="text-emerald-300/70 text-sm mb-3">
                      Total Supplied: ${(item.supplied / 1000000).toFixed(2)}M
                    </div>
                    <button className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm transition-all">
                      Supply {item.asset}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Borrow */}
            <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
              <h3 className="text-white mb-6">Borrow Assets</h3>
              <div className="space-y-4">
                {[
                  { asset: 'USDC', apr: 8.7, borrowed: 12400000 },
                  { asset: 'DAI', apr: 8.2, borrowed: 9800000 },
                  { asset: 'ETH', apr: 6.5, borrowed: 7600000 }
                ].map((item) => (
                  <div key={item.asset} className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-white">{item.asset}</div>
                      <div className="text-amber-400">{item.apr}% APR</div>
                    </div>
                    <div className="text-emerald-300/70 text-sm mb-3">
                      Total Borrowed: ${(item.borrowed / 1000000).toFixed(2)}M
                    </div>
                    <button className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm transition-all">
                      Borrow {item.asset}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lending Info */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
            <h4 className="text-white mb-4">Regenerative Lending Protocol</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="text-purple-400 mb-2">How It Works</div>
                <div className="text-emerald-300/70">
                  Supply regenerative assets as collateral to borrow stablecoins or major cryptocurrencies. 
                  Interest paid on loans helps fund new conservation projects, creating a virtuous cycle of 
                  capital efficiency and environmental impact.
                </div>
              </div>
              <div>
                <div className="text-purple-400 mb-2">Loan-to-Value Ratios</div>
                <div className="text-emerald-300/70">
                  • Verified assets: Up to 75% LTV<br />
                  • High-impact assets: Up to 80% LTV<br />
                  • Multiple collateral types supported<br />
                  • No liquidation for verified custodians
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
