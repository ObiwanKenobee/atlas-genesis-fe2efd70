import React from 'react';
import { Heart, TrendingUp, Users, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface ProjectCardProps {
  id: string;
  title: string;
  category: string;
  location: string;
  image: string;
  raised: number;
  goal: number;
  impactMetric: string; // e.g., "2.5k tons CO2"
  returnRate?: string; // For DeFi aspect
  supporters: number;
  onInvest?: () => void;
}

export function ProjectCard({
  id,
  title,
  category,
  location,
  image,
  raised,
  goal,
  impactMetric,
  returnRate,
  supporters,
  onInvest
}: ProjectCardProps) {
  const percentage = Math.min(100, Math.round((raised / goal) * 100));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-emerald-700">
          {category}
        </div>
        <div className="absolute top-3 right-3 p-2 bg-slate-900/50 hover:bg-emerald-500 rounded-full text-white backdrop-blur-sm transition-colors cursor-pointer">
          <Heart className="w-4 h-4" />
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{title}</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-slate-300"></span>
              {location}
            </p>
          </div>
          {returnRate && (
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-400 font-medium">APY</span>
              <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                {returnRate} <TrendingUp className="w-3 h-3" />
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 font-medium">${raised.toLocaleString()} <span className="text-slate-400 font-normal">raised</span></span>
            <span className="text-slate-900 font-bold">{percentage}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full" 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">Supporters</span>
              <span className="text-sm font-bold text-slate-700">{supporters}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">Impact</span>
              <span className="text-sm font-bold text-slate-700">{impactMetric}</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onInvest}
          className="w-full mt-5 bg-slate-900 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-600 transition-colors"
        >
          Invest Now
        </button>
      </div>
    </motion.div>
  );
}
