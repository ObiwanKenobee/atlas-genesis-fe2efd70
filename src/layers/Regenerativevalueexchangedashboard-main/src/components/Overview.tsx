import { TrendingUp, TrendingDown, Leaf, Heart, Palette, Droplet, Calendar, RefreshCw, Download, Filter } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState } from 'react';

const marketData = {
  '7d': [
    { month: 'Day 1', value: 820 },
    { month: 'Day 2', value: 827 },
    { month: 'Day 3', value: 833 },
    { month: 'Day 4', value: 838 },
    { month: 'Day 5', value: 841 },
    { month: 'Day 6', value: 844 },
    { month: 'Day 7', value: 847 },
  ],
  '1m': [
    { month: 'Week 1', value: 812 },
    { month: 'Week 2', value: 824 },
    { month: 'Week 3', value: 835 },
    { month: 'Week 4', value: 847 },
  ],
  '6m': [
    { month: 'Jan', value: 542 },
    { month: 'Feb', value: 589 },
    { month: 'Mar', value: 634 },
    { month: 'Apr', value: 698 },
    { month: 'May', value: 756 },
    { month: 'Jun', value: 847 },
  ],
  '1y': [
    { month: 'Q1 2024', value: 412 },
    { month: 'Q2 2024', value: 487 },
    { month: 'Q3 2024', value: 634 },
    { month: 'Q4 2024', value: 756 },
    { month: 'Q1 2025', value: 847 },
  ],
};

const assetDistribution = [
  { name: 'Environmental', value: 384, color: '#10b981' },
  { name: 'Health & Social', value: 212, color: '#3b82f6' },
  { name: 'Cultural', value: 156, color: '#f59e0b' },
  { name: 'Ecosystem Services', value: 95, color: '#8b5cf6' },
];

export function Overview() {
  const [timeRange, setTimeRange] = useState<'7d' | '1m' | '6m' | '1y'>('6m');
  const [isLiveData, setIsLiveData] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'environmental' | 'health' | 'cultural' | 'ecosystem'>('all');

  const timeRanges = [
    { id: '7d', label: '7 Days' },
    { id: '1m', label: '1 Month' },
    { id: '6m', label: '6 Months' },
    { id: '1y', label: '1 Year' },
  ];

  const currentData = marketData[timeRange];

  // Calculate year-over-year comparison
  const currentValue = 847.3;
  const previousYearValue = 621.4;
  const yoyChange = ((currentValue - previousYearValue) / previousYearValue * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-white mb-2">Market Overview</h2>
            <p className="text-emerald-300/80">Real-time regenerative value metrics and trends</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-all border border-emerald-500/30">
              <Download className="w-4 h-4" />
              <span className="text-sm">Export Data</span>
            </button>
            <button 
              onClick={() => setIsLiveData(!isLiveData)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${
                isLiveData 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-emerald-500/10 text-emerald-400/60 border-emerald-500/20'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isLiveData ? 'animate-spin' : ''}`} />
              <span className="text-sm">Live Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Year-over-Year Comparison */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">Year-over-Year Growth</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-300/70 text-sm mb-2">Current Year (2025)</div>
            <div className="text-white mb-2">${currentValue}B</div>
            <div className="flex items-center gap-1 text-emerald-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+{yoyChange}% vs 2024</span>
            </div>
          </div>
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-300/70 text-sm mb-2">Previous Year (2024)</div>
            <div className="text-white mb-2">${previousYearValue}B</div>
            <div className="text-emerald-300/60 text-sm">Full year value</div>
          </div>
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-300/70 text-sm mb-2">Absolute Growth</div>
            <div className="text-white mb-2">+${(currentValue - previousYearValue).toFixed(1)}B</div>
            <div className="text-emerald-300/60 text-sm">Added this year</div>
          </div>
        </div>
      </div>

      {/* Key Metrics with Filter */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white">Asset Performance</h3>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400" />
            <select 
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-3 py-2 text-emerald-300 text-sm focus:outline-none focus:border-emerald-500/40"
            >
              <option value="all">All Assets</option>
              <option value="environmental">Environmental</option>
              <option value="health">Health & Social</option>
              <option value="cultural">Cultural</option>
              <option value="ecosystem">Ecosystem Services</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(selectedMetric === 'all' || selectedMetric === 'environmental') && (
            <MetricCard
              title="Environmental Assets"
              value="$384.2B"
              change="+12.3%"
              trend="up"
              icon={Leaf}
              color="emerald"
            />
          )}
          {(selectedMetric === 'all' || selectedMetric === 'health') && (
            <MetricCard
              title="Health & Social Assets"
              value="$212.8B"
              change="+8.7%"
              trend="up"
              icon={Heart}
              color="blue"
            />
          )}
          {(selectedMetric === 'all' || selectedMetric === 'cultural') && (
            <MetricCard
              title="Cultural Assets"
              value="$156.1B"
              change="+15.2%"
              trend="up"
              icon={Palette}
              color="amber"
            />
          )}
          {(selectedMetric === 'all' || selectedMetric === 'ecosystem') && (
            <MetricCard
              title="Ecosystem Services"
              value="$94.2B"
              change="+9.4%"
              trend="up"
              icon={Droplet}
              color="purple"
            />
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Growth Chart with Time Range Selector */}
        <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white">Total Market Value Growth (Billions USD)</h3>
            <div className="flex gap-1 bg-emerald-900/20 rounded-lg p-1">
              {timeRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id as any)}
                  className={`px-3 py-1 rounded-md text-sm transition-all ${
                    timeRange === range.id
                      ? 'bg-emerald-500 text-white'
                      : 'text-emerald-400/60 hover:text-emerald-400'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={currentData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#10b981" opacity={0.1} />
              <XAxis dataKey="month" stroke="#6ee7b7" />
              <YAxis stroke="#6ee7b7" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#064e3b', 
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#colorValue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Distribution */}
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <h3 className="text-white mb-6">Asset Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assetDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {assetDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#064e3b', 
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {assetDistribution.map((asset, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }}></div>
                  <span className="text-emerald-300/70">{asset.name}</span>
                </div>
                <span className="text-white">${asset.value}B</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Projects"
          value="12,847"
          description="Restoration and renewal initiatives worldwide"
        />
        <StatCard
          title="Verified Custodians"
          value="3,421"
          description="Community cooperatives and conservation groups"
        />
        <StatCard
          title="Carbon Sequestered"
          value="847M tons"
          description="CO₂ removed from atmosphere this year"
        />
      </div>

      {/* Mission Statement */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-8">
        <h2 className="text-white mb-4">The Regenerative Revolution</h2>
        <p className="text-emerald-300/80 mb-4">
          The Regenerative Value Exchange transforms how we measure wealth. Instead of extracting value from nature, 
          we recognize and reward those who heal ecosystems, preserve cultures, and enhance human well-being.
        </p>
        <p className="text-emerald-300/80">
          Through blockchain verification, AI-driven monitoring, and multi-stakeholder governance, we've created a marketplace 
          where regenerative actions become appreciating assets. Every forest restored, every language preserved, and every 
          community uplifted contributes to a new form of wealth — one that grows by healing, not harming.
        </p>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  color: string;
}

function MetricCard({ title, value, change, trend, icon: Icon, color }: MetricCardProps) {
  const colorClasses = {
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{change}</span>
        </div>
      </div>
      <div className="text-emerald-300/70 text-sm mb-1">{title}</div>
      <div className="text-white">{value}</div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
}

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
      <div className="text-emerald-300/70 text-sm mb-2">{title}</div>
      <div className="text-white mb-2">{value}</div>
      <div className="text-emerald-300/50 text-sm">{description}</div>
    </div>
  );
}