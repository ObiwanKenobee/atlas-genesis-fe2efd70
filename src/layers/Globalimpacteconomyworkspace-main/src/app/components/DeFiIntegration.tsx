import React from 'react';
import { Zap, Wallet, ArrowUpRight, Lock, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';

const POOLS = [
  {
    id: 1,
    pair: 'USDC / NATURE',
    apr: '12.4%',
    tvl: '$4.2M',
    reward: 'NATURE',
    risk: 'Low',
    icon1: '💵',
    icon2: '🌿'
  },
  {
    id: 2,
    pair: 'ETH / REGEN',
    apr: '24.8%',
    tvl: '$1.8M',
    reward: 'REGEN',
    risk: 'Medium',
    icon1: 'Ξ',
    icon2: '♻️'
  },
  {
    id: 3,
    pair: 'CARBON / SOL',
    apr: '18.2%',
    tvl: '$850K',
    reward: 'CARBON',
    risk: 'High',
    icon1: '⚫',
    icon2: '◎'
  }
];

export function DeFiIntegration() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">DeFi Integration</h2>
          <p className="text-slate-500">Stake assets, provide liquidity, and earn yield on regenerative tokens.</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Connect Wallet
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Staking Rewards
            </span>
            <div className="mt-4">
              <span className="text-3xl font-bold">1,240.50</span>
              <span className="text-sm text-slate-400 ml-2">NATURE</span>
            </div>
            <div className="mt-1 text-sm text-emerald-400">
              ≈ $420.15 USD
            </div>
            <Button className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 text-white border-0">
              Claim Rewards
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" /> Active Liquidity Pools
          </h3>
          <div className="space-y-4">
            {POOLS.map((pool) => (
              <motion.div 
                key={pool.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-200 transition-colors"
              >
                <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm border border-slate-100 z-10">{pool.icon1}</div>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm border border-slate-100">{pool.icon2}</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{pool.pair}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">{pool.risk} Risk</span>
                      <span>TVL: {pool.tvl}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto gap-8">
                  <div className="text-center">
                    <div className="text-xs text-slate-500">APR</div>
                    <div className="font-bold text-emerald-600 text-lg">{pool.apr}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500">Earn</div>
                    <div className="font-bold text-slate-900">{pool.reward}</div>
                  </div>
                  <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    Deposit
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Tokenized Real-World Assets</h3>
        <p className="text-slate-500 max-w-xl mx-auto mb-6">
          Invest in fractionalized ownership of regenerative land, carbon credits, and renewable energy infrastructure recorded on-chain.
        </p>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white">
          Explore Asset Marketplace <ArrowUpRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
