import React, { useState, useEffect } from 'react';
import { Search, ListFilter, SlidersHorizontal, Loader2, X, Leaf } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { projectId } from '../../../utils/supabase/info';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';

const CATEGORIES = ['All', 'Energy', 'Regeneration', 'Water', 'Agriculture', 'Social'];

export function ImpactMarketplace() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-76dec4a8/projects`);
      const data = await res.json();
      if (data.projects) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-76dec4a8/demo-invest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          amount: parseFloat(investAmount),
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Investment failed');
      
      toast.success(`Successfully invested $${investAmount} in ${selectedProject.title}`);
      setSelectedProject(null);
      setInvestAmount('');
      // Refresh projects to show updated stats
      fetchProjects();
    } catch (error: any) {
      console.error('Investment error:', error);
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesCategory = activeCategory === 'All' || project.category === activeCategory;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Impact Marketplace</h2>
          <p className="text-slate-500">Discover and fund high-impact regenerative projects.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64 text-sm"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <ProjectCard 
            key={project.id} 
            {...project} 
            onInvest={() => setSelectedProject(project)}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <ListFilter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No projects found</h3>
          <p className="text-slate-500">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {/* Investment Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedProject(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl overflow-hidden"
            >
              {/* Abstract Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>

              <div className="mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Invest in Impact</h3>
                <p className="text-slate-500 text-sm mt-1">
                  You are funding <span className="font-semibold text-slate-900">{selectedProject.title}</span>.
                </p>
              </div>

              <form onSubmit={handleInvest} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Investment Amount ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                    <input
                      type="number"
                      min="10"
                      required
                      value={investAmount}
                      onChange={(e) => setInvestAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-8 pr-4 text-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="1000"
                    />
                  </div>
                  <p className="text-xs text-slate-500 flex justify-between">
                    <span>Min. investment: $10</span>
                    <span>Available balance: $12,450.00</span>
                  </p>
                </div>

                <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Estimated Yield</span>
                    <span className="font-bold text-emerald-700">{selectedProject.returnRate || '5%'} APY</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Impact Generated</span>
                    <span className="font-bold text-emerald-700">{selectedProject.impactMetric}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={processing}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-6 text-base"
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                    </div>
                  ) : (
                    'Confirm Investment'
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}