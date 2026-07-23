import React, { useEffect, useState } from 'react';
import { 
  Leaf, 
  Wind, 
  Droplets, 
  Sprout, 
  Trophy, 
  Share2, 
  Download,
  Map,
  Loader2,
  Wallet,
  ExternalLink,
  Copy,
  TrendingUp,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Button } from './ui/button';

export function MyImpact() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-76dec4a8/impact-stats`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await res.json();
        
        // Basic validation
        if (!data || !data.carbonOffset || !data.badges) {
          throw new Error('Invalid data format');
        }

        setStats(data);
      } catch (error) {
        console.error('Error fetching impact stats:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-96 text-slate-500">
        <div className="text-center">
          <p className="mb-2">Unable to load impact data.</p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const chartData = stats.carbonOffset?.history?.map((val: number, i: number) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i],
    value: val
  })) || [];

  const projects = stats.projects || [];
  const assets = stats.assets || [];
  const marketData = stats.marketData || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Market Ticker */}
      <div className="bg-slate-900 rounded-xl p-3 flex items-center overflow-hidden border border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mr-6 text-emerald-400 font-bold text-sm whitespace-nowrap">
          <Activity className="w-4 h-4" /> Live Markets
        </div>
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar mask-gradient w-full">
          {marketData.map((item: any) => (
            <div key={item.symbol} className="flex items-center gap-2 text-sm whitespace-nowrap">
              <span className="font-bold text-slate-200">{item.symbol}</span>
              <span className="text-slate-400">${item.price.toFixed(2)}</span>
              <span className={item.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}>
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Impact</h2>
          <p className="text-slate-500">Visualize and track your real-world environmental contributions.</p>
        </div>
        <div className="flex gap-3 items-center">
          <Button 
            variant={walletConnected ? "outline" : "default"}
            className={walletConnected 
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" 
              : "bg-slate-900 hover:bg-slate-800 text-white"}
            onClick={() => setWalletConnected(!walletConnected)}
          >
            <Wallet className="w-4 h-4 mr-2" /> 
            {walletConnected ? `${stats.wallet?.address?.slice(0,6)}...${stats.wallet?.address?.slice(-4)}` : "Connect Wallet"}
          </Button>
          {walletConnected && (
            <div className="hidden md:block bg-white px-3 py-2 rounded-md border border-slate-200 text-sm font-medium shadow-sm">
               {stats.wallet?.balance}
            </div>
          )}
          <Button variant="outline" className="border-slate-200">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-emerald-900 rounded-2xl p-6 text-white relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-400/30 transition-colors duration-500"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-500/20 w-10 h-10 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="bg-emerald-800/50 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-emerald-200 border border-emerald-700/50">
                VERIFIED
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight">{stats.carbonOffset.total}</div>
            <div className="text-sm text-emerald-300 font-medium">{stats.carbonOffset.unit} CO₂e Offset</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:border-emerald-100 transition-colors"
        >
          <div className="bg-emerald-50 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
            <Sprout className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.treesPlanted.total.toLocaleString()}</div>
          <div className="text-sm text-slate-500 font-medium">{stats.treesPlanted.unit} Planted</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:border-blue-100 transition-colors"
        >
          <div className="bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
            <Wind className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.energyGenerated.total}</div>
          <div className="text-sm text-slate-500 font-medium">{stats.energyGenerated.unit} Clean Energy</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:border-cyan-100 transition-colors"
        >
          <div className="bg-cyan-50 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
            <Droplets className="w-5 h-5 text-cyan-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{(stats.waterSaved.total / 1000).toFixed(1)}k</div>
          <div className="text-sm text-slate-500 font-medium">{stats.waterSaved.unit} Cleaned</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">Carbon Offset Trajectory</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-lg">6M</button>
                <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 rounded-lg">1Y</button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ color: '#64748b' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCarbon)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900">Active Project Portfolio</h3>
                <Button variant="ghost" size="sm" className="text-emerald-600">View All</Button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project: any) => (
                   <div key={project.id} className="group relative rounded-xl overflow-hidden border border-slate-100 hover:shadow-md transition-all bg-slate-50/50">
                      <div className="aspect-[16/9] w-full relative">
                         <img src={project.image} alt={project.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                         <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-slate-800">
                           {project.type}
                         </div>
                         <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-mono text-emerald-400 border border-white/10 flex items-center gap-1">
                           <CheckCircle2 className="w-3 h-3" /> VERIFIED ON-CHAIN
                         </div>
                      </div>
                      <div className="p-4">
                         <h4 className="font-bold text-slate-900 mb-1">{project.name}</h4>
                         <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                            <Map className="w-3 h-3" /> {project.location}
                         </div>
                         <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-white rounded-lg p-2 border border-slate-100">
                               <div className="text-[10px] text-emerald-600 font-semibold uppercase">Contribution</div>
                               <div className="text-sm font-bold text-slate-900">{project.contribution}</div>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-slate-100">
                               <div className="text-[10px] text-blue-600 font-semibold uppercase">Impact</div>
                               <div className="text-sm font-bold text-slate-900">{project.impact}</div>
                            </div>
                         </div>
                         <div className="relative pt-1 border-t border-slate-100 mt-2 pt-3">
                            <div className="flex items-center justify-between text-xs text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors">
                              <span className="font-mono">TX: 0x8a...3b21</span>
                              <ExternalLink className="w-3 h-3" />
                            </div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Badges & Assets */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white border border-slate-700 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="text-xl">💎</span> Digital Assets
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">Wallet Connected</span>
             </div>
             
             <div className="space-y-4 relative z-10">
                {assets.map((asset: any) => (
                   <div key={asset.id} className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-colors group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                            <img src={asset.image} alt="NFT" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white truncate group-hover:text-emerald-300 transition-colors">{asset.name}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                              {asset.network} <span className="w-1 h-1 rounded-full bg-slate-500"></span> {asset.tokenId}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-emerald-400 font-mono font-bold">{asset.value}</div>
                        </div>
                      </div>
                      
                      {/* Contract Address Copy */}
                      <div className="bg-black/30 rounded px-2 py-1.5 flex items-center justify-between group/code cursor-pointer hover:bg-black/50 transition-colors">
                        <code className="text-[10px] text-slate-400 font-mono truncate">{asset.contractAddress}</code>
                        <Copy className="w-3 h-3 text-slate-500 group-hover/code:text-emerald-400" />
                      </div>
                   </div>
                ))}
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9">
                     Mint Impact
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white text-xs h-9 bg-transparent">
                     View Opensea
                  </Button>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Achievements
            </h3>
            
            <div className="space-y-4 flex-1">
              {stats.badges.map((badge: any) => (
                <div key={badge.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                    {badge.icon}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{badge.name}</div>
                    <div className="text-xs text-slate-500">Earned on {new Date(badge.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
