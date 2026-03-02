import React from 'react';
import { 
  LayoutDashboard, 
  Globe, 
  Wallet, 
  Sprout, 
  Settings,
  ChartPie,
  Leaf,
  Users,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ activeTab, setActiveTab, isMobile = false, onClose }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'marketplace', label: 'Impact Marketplace', icon: Globe },
    { id: 'sustainable-finance', label: 'Sustainable Finance', icon: Wallet },
    { id: 'microfinance', label: 'Microfinance', icon: Users },
    { id: 'defi', label: 'DeFi Integration', icon: Zap },
    { id: 'bonds', label: 'Impact Bonds', icon: ShieldCheck },
    { id: 'portfolio', label: 'My Impact', icon: Sprout },
    { id: 'reports', label: 'Reports', icon: ChartPie },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const content = (
    <>
      <div className="p-6 flex items-center gap-3">
        <div className="p-2 bg-emerald-500 rounded-lg">
          <Leaf className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">TerraFlow</h1>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId={isMobile ? "activeTabMobile" : "activeTab"}
                  className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white")} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <motion.div 
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        exit={{ x: -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 z-50"
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 hidden md:flex fixed left-0 top-0">
      {content}
    </div>
  );
}