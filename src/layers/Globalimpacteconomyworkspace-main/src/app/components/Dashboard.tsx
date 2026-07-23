import React, { useEffect, useState } from 'react';
import { 
  Leaf, 
  Wind, 
  Droplets, 
  Users, 
  TrendingUp,
  ArrowRight,
  Loader2,
  Globe,
  Wallet,
  Zap,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { projectId } from '../../../utils/supabase/info';
import { Button } from './ui/button';

export function Dashboard({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [investedAmount, setInvestedAmount] = useState(0);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
      setInvestedAmount(5000); // Mock data or fetch from API
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const modules = [
    {
      title: "Impact Marketplace",
      desc: "Direct investment in regenerative projects",
      icon: Globe,
      color: "emerald",
      tab: "marketplace",
      stat: "124 Active Projects",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Sustainable Finance",
      desc: "Institutional-grade ESG portfolios",
      icon: Wallet,
      color: "blue",
      tab: "sustainable-finance",
      stat: "+12.5% APY",
      image: "https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Microfinance Platform",
      desc: "P2P lending for farmers & SMEs",
      icon: Users,
      color: "amber",
      tab: "microfinance",
      stat: "$1.2M Disbursed",
      image: "https://images.unsplash.com/photo-1590393322744-934fa793444a?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "DeFi Integration",
      desc: "Liquidity pools & tokenized assets",
      icon: Zap,
      color: "purple",
      tab: "defi",
      stat: "$850K TVL",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Impact Bonds",
      desc: "Fixed-income green & blue bonds",
      icon: ShieldCheck,
      color: "cyan",
      tab: "bonds",
      stat: "AAA Rated",
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600"
    }
  ];

  const getColorClasses = (color: string) => {
    switch(color) {
      case 'emerald': return { bg: 'bg-emerald-50', icon: 'text-emerald-600', overlay: 'bg-emerald-900/20' };
      case 'blue': return { bg: 'bg-blue-50', icon: 'text-blue-600', overlay: 'bg-blue-900/20' };
      case 'amber': return { bg: 'bg-amber-50', icon: 'text-amber-600', overlay: 'bg-amber-900/20' };
      case 'purple': return { bg: 'bg-purple-50', icon: 'text-purple-600', overlay: 'bg-purple-900/20' };
      case 'cyan': return { bg: 'bg-cyan-50', icon: 'text-cyan-600', overlay: 'bg-cyan-900/20' };
      default: return { bg: 'bg-slate-50', icon: 'text-slate-600', overlay: 'bg-slate-900/20' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 md:p-12 min-h-[400px] flex flex-col justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1758610031201-6cb5d6ee7f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwbmF0dXJlJTIwY2l0eSUyMHJlZ2VuZXJhdGl2ZSUyMGZpbmFuY2V8ZW58MXx8fHwxNzcwMzM0NDQ1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
            alt="Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium mb-6">
              <Activity className="w-4 h-4" /> Live System Status: Optimal
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Global Impact <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Economy</span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl mb-8 leading-relaxed max-w-lg">
              Enable financial flows supporting regenerative businesses through impact investing, DeFi, and microfinance.
            </p>
            
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div>
                <div className="text-sm text-slate-400 mb-1">Value Generated</div>
                <div className="text-5xl font-bold text-white tracking-tight">$4.2B</div>
              </div>
              <div className="h-12 w-px bg-slate-700 hidden md:block"></div>
              <div>
                <div className="text-sm text-slate-400 mb-1">Active Investors</div>
                <div className="text-2xl font-bold text-white">12,450+</div>
              </div>
              <div className="h-12 w-px bg-slate-700 hidden md:block"></div>
              <div>
                <div className="text-sm text-slate-400 mb-1">Carbon Offset</div>
                <div className="text-2xl font-bold text-white">850k <span className="text-sm font-normal text-slate-400">Tons</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Masonry Grid */}
      <ResponsiveMasonry
        columnsCountBreakPoints={{350: 1, 750: 2, 900: 3}}
      >
        <Masonry gutter="1.5rem">
          {modules.map((item, index) => {
            const colors = getColorClasses(item.color);
            return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveTab(item.tab)}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-48 overflow-hidden relative">
                  <div className={`absolute inset-0 z-10 group-hover:bg-opacity-10 transition-all ${colors.overlay}`}></div>
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute bottom-4 left-4 z-20">
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-sm">
                      {item.stat}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${colors.bg}`}>
                    <item.icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm mb-4">
                    {item.desc}
                  </p>
                  <div className="flex items-center text-sm font-medium text-emerald-600 group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </motion.div>
            );
          })}
          
          {/* Quick Action Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between min-h-[200px]"
          >
            <div>
              <Leaf className="w-8 h-8 mb-4 text-emerald-200" />
              <h3 className="text-xl font-bold mb-2">Ready to make an impact?</h3>
              <p className="text-emerald-100 text-sm">Start your journey with a $10 micro-investment today.</p>
            </div>
            <Button 
              onClick={() => setActiveTab('marketplace')}
              className="bg-white text-emerald-700 hover:bg-emerald-50 border-0 w-full mt-4"
            >
              Start Investing
            </Button>
          </motion.div>

        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
}
