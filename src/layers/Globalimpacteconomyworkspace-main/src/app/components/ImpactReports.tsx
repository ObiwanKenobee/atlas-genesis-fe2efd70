import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  Calendar,
  Loader2,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId } from '/utils/supabase/info';
import { Button } from './ui/button';

export function ImpactReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-76dec4a8/reports`);
        
        if (!res.ok) throw new Error('Failed to fetch reports');
        
        const data = await res.json();
        if (data.reports) {
          setReports(data.reports);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'All' || report.type === filter;
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Verified': return 'bg-emerald-100 text-emerald-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Impact Reports</h2>
          <p className="text-slate-500">Access verified documentation and annual impact statements.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64 text-sm"
            />
          </div>
          <Button variant="outline" className="border-slate-200 text-slate-600">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Annual', 'Audit', 'Project', 'Social'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === type 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-6 md:col-span-5 pl-2">Document Name</div>
          <div className="hidden md:block col-span-2">Date</div>
          <div className="hidden md:block col-span-2">Verifier</div>
          <div className="col-span-3 md:col-span-2 text-center">Status</div>
          <div className="col-span-3 md:col-span-1 text-right pr-2">Action</div>
        </div>

        <div className="divide-y divide-slate-100">
          <AnimatePresence>
            {filteredReports.map((report) => (
              <motion.div 
                key={report.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors group"
              >
                <div className="col-span-6 md:col-span-5 flex items-center gap-3 pl-2">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{report.title}</div>
                    <div className="text-xs text-slate-500">{report.size} • {report.type}</div>
                  </div>
                </div>

                <div className="hidden md:flex col-span-2 items-center text-sm text-slate-500">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                  {report.date}
                </div>

                <div className="hidden md:flex col-span-2 items-center text-sm text-slate-900 font-medium">
                  <FileCheck className="w-4 h-4 mr-2 text-emerald-500" />
                  {report.verifier}
                </div>

                <div className="col-span-3 md:col-span-2 flex justify-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(report.status)}`}>
                    {report.status === 'Verified' && <CheckCircle2 className="w-3 h-3" />}
                    {report.status}
                  </span>
                </div>

                <div className="col-span-3 md:col-span-1 flex justify-end pr-2">
                  <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {filteredReports.length === 0 && (
          <div className="text-center py-12">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Search className="w-8 h-8 text-slate-300" />
             </div>
             <h3 className="text-slate-900 font-bold">No reports found</h3>
             <p className="text-slate-500 text-sm">Try adjusting your filters.</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
             <FileCheck className="w-6 h-6" />
           </div>
           <div>
             <h3 className="font-bold text-slate-900">Third-Party Verification</h3>
             <p className="text-sm text-slate-600">All our reports are audited by independent bodies to ensure 100% transparency.</p>
           </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
          Learn More
        </Button>
      </div>
    </div>
  );
}
