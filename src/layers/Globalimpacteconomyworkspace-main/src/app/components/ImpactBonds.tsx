import React from 'react';
import { ShieldCheck, TrendingUp, FileText, AlertCircle, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const YIELD_DATA = [
  { year: '2020', yield: 3.2 },
  { year: '2021', yield: 3.8 },
  { year: '2022', yield: 4.5 },
  { year: '2023', yield: 5.2 },
  { year: '2024', yield: 5.8 },
  { year: '2025', yield: 6.1 },
];

const BONDS = [
  {
    id: 1,
    title: 'Global Green Bond Series A',
    issuer: 'World Bank',
    yield: '4.5%',
    maturity: '2030',
    minInvest: '$5,000',
    rating: 'AAA',
    type: 'Green'
  },
  {
    id: 2,
    title: 'Ocean Conservation Note',
    issuer: 'Blue Finance Alliance',
    yield: '6.2%',
    maturity: '2028',
    minInvest: '$1,000',
    rating: 'AA',
    type: 'Blue'
  },
  {
    id: 3,
    title: 'Reforestation Impact Bond',
    issuer: 'TerraFlow Capital',
    yield: '7.5%',
    maturity: '2032',
    minInvest: '$10,000',
    rating: 'A-',
    type: 'Impact'
  }
];

export function ImpactBonds() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Impact Bonds</h2>
          <p className="text-slate-500">Fixed-income instruments financing projects with positive environmental benefits.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200">
            <FileText className="w-4 h-4 mr-2" /> Prospectus
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Historical Yield Performance
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={YIELD_DATA}>
                  <defs>
                    <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="yield" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-emerald-900 rounded-2xl p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
               <div>
                 <h3 className="text-xl font-bold mb-2">Why Invest in Impact Bonds?</h3>
                 <ul className="space-y-2 text-emerald-100 text-sm">
                   <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Stable, predictable returns</li>
                   <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Verified environmental impact</li>
                   <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Diversification from volatile assets</li>
                 </ul>
               </div>
               <div className="bg-white/10 backdrop-blur p-4 rounded-xl border border-white/10 text-center min-w-[150px]">
                 <div className="text-3xl font-bold">AAA</div>
                 <div className="text-xs text-emerald-300">Avg. Portfolio Rating</div>
               </div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-bold text-slate-900">Available Offerings</h3>
          {BONDS.map((bond) => (
            <motion.div 
              key={bond.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`text-xs px-2 py-1 rounded font-bold ${
                  bond.type === 'Green' ? 'bg-emerald-100 text-emerald-700' :
                  bond.type === 'Blue' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {bond.type} Bond
                </span>
                <span className="text-xs font-bold text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">{bond.rating}</span>
              </div>
              
              <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{bond.title}</h4>
              <p className="text-xs text-slate-500 mb-4">{bond.issuer}</p>
              
              <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                <div className="text-slate-500">Yield</div>
                <div className="font-bold text-emerald-600 text-right">{bond.yield}</div>
                <div className="text-slate-500">Maturity</div>
                <div className="font-medium text-slate-900 text-right">{bond.maturity}</div>
                <div className="text-slate-500">Min. Invest</div>
                <div className="font-medium text-slate-900 text-right">{bond.minInvest}</div>
              </div>

              <Button className="w-full bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200">
                View Details
              </Button>
            </motion.div>
          ))}
          
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              Past performance does not guarantee future results. Bond values may fluctuate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
