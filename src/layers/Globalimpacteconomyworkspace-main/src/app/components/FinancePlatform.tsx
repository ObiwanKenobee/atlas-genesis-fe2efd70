import React, { useEffect, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  Landmark,
  Wallet,
  Loader2
} from 'lucide-react';
import { projectId } from '../../../utils/supabase/info';
import { toast } from 'sonner';

const CHART_DATA = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
  { name: 'Aug', value: 5200 },
  { name: 'Sep', value: 6100 },
  { name: 'Oct', value: 7500 },
  { name: 'Nov', value: 8400 },
  { name: 'Dec', value: 9200 },
];

export function FinancePlatform() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-76dec4a8/demo-portfolio`);
      const data = await res.json();
      if (data.portfolio) {
        setPortfolio(data.portfolio);
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !portfolio) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // Fallback if no portfolio
  const safePortfolio = portfolio || {
    balance: 12450,
    totalYield: 1240,
    invested: 5000,
    transactions: []
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Finance & DeFi</h2>
          <p className="text-slate-500">Manage your impact portfolio and track financial returns.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-medium border border-emerald-200">
            <Wallet className="w-4 h-4" /> 
            {'Connect Wallet'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
          <span className="text-slate-400 text-sm font-medium">Total Balance</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold">${safePortfolio.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="text-emerald-400 text-sm font-medium flex items-center bg-emerald-400/10 px-2 py-0.5 rounded">
              +12.5% <ArrowUpRight className="w-3 h-3 ml-1" />
            </span>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium text-sm transition-colors">
              Deposit
            </button>
            <button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-medium text-sm transition-colors">
              Withdraw
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400">Total Invested</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">${safePortfolio.invested.toLocaleString()}</span>
          <p className="text-sm text-slate-500 mt-1">Across active projects</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400">Total Yield</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">${safePortfolio.totalYield.toLocaleString()}</span>
          <p className="text-sm text-slate-500 mt-1">Accumulated earnings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Portfolio Performance</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide">
            {safePortfolio.transactions.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No transactions yet.</p>
            ) : (
              safePortfolio.transactions.map((tx: any) => (
                <div key={tx.id} className="flex flex-col p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                        {tx.amount > 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 line-clamp-1">{tx.project}</p>
                        <p className="text-xs text-slate-500">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-400">{tx.status}</p>
                    </div>
                  </div>
                  {tx.reference && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-400">Ref: <span className="font-mono text-slate-600">{tx.reference}</span></p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          {safePortfolio.transactions.length > 0 && (
             <button className="w-full mt-4 text-sm text-slate-500 hover:text-emerald-600 font-medium transition-colors">
               View All Transactions
             </button>
          )}
        </div>
      </div>
    </div>
  );
}