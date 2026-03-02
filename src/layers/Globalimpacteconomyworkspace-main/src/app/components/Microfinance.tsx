import React from 'react';
import { Users, TrendingUp, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';

const BORROWERS = [
  {
    id: 1,
    name: 'Amara Diallo',
    business: 'Organic Cacao Farm',
    location: 'Ivory Coast',
    amount: 500,
    term: '12 months',
    repaid: 65,
    risk: 'Low',
    image: 'https://images.unsplash.com/photo-1531123414780-f74242c2b052?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    purpose: 'Buying organic fertilizers and new seedlings'
  },
  {
    id: 2,
    name: 'Rajesh Kumar',
    business: 'Solar Irrigation',
    location: 'India',
    amount: 1200,
    term: '24 months',
    repaid: 30,
    risk: 'Medium',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    purpose: 'Installing solar pump for 3-acre farm'
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    business: 'Sustainable Textiles',
    location: 'Peru',
    amount: 800,
    term: '18 months',
    repaid: 10,
    risk: 'Low',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    purpose: 'Purchasing natural dyes and alpaca wool'
  }
];

export function Microfinance() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Microfinance Platform</h2>
          <p className="text-slate-500">Direct peer-to-peer lending for regenerative entrepreneurs.</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Auto-Lend Settings
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Empowering Rural Economies</h3>
            <p className="text-emerald-50 max-w-xl">
              Our platform enables farmers to access <span className="font-bold text-white">$205K-$565K annual income</span> through sustainable agricultural practices and direct market access.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-xl border border-white/20 whitespace-nowrap">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Avg Income Uplift</span>
            <div className="text-2xl font-bold">+340%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Active Loans</div>
          <div className="text-3xl font-bold text-slate-900">124</div>
          <div className="text-xs text-emerald-600 font-medium mt-2 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> +12 this month
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Repayment Rate</div>
          <div className="text-3xl font-bold text-slate-900">98.5%</div>
          <div className="text-xs text-emerald-600 font-medium mt-2 flex items-center">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Above industry avg
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Avg. Return</div>
          <div className="text-3xl font-bold text-slate-900">6.2%</div>
          <div className="text-xs text-slate-400 mt-2">Annualized yield</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BORROWERS.map((borrower) => (
          <motion.div 
            key={borrower.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={borrower.image} 
                alt={borrower.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-slate-800">
                ${borrower.amount} Request
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{borrower.name}</h3>
                  <p className="text-emerald-600 text-sm font-medium">{borrower.business}</p>
                </div>
                <div className={`text-xs px-2 py-1 rounded font-medium ${
                  borrower.risk === 'Low' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {borrower.risk} Risk
                </div>
              </div>
              
              <div className="flex items-center text-xs text-slate-500 mb-4">
                <MapPin className="w-3 h-3 mr-1" /> {borrower.location}
              </div>

              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {borrower.purpose}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Repayment Progress</span>
                  <span>{borrower.repaid}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${borrower.repaid}%` }}
                  ></div>
                </div>
              </div>

              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
                Lend Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
