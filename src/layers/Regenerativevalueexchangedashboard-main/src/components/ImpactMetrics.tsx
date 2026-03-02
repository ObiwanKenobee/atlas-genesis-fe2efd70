import { TreePine, Users, Heart, Globe, TrendingUp, Droplet, Wind, Sprout, MapPin, Filter, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend, ComposedChart, Bar, Line } from 'recharts';
import { useState } from 'react';

const ecosystemHealth = [
  { month: 'Jan', forests: 67, wetlands: 54, oceans: 61, soil: 58 },
  { month: 'Feb', forests: 69, wetlands: 56, oceans: 62, soil: 60 },
  { month: 'Mar', forests: 71, wetlands: 59, oceans: 64, soil: 63 },
  { month: 'Apr', forests: 74, wetlands: 62, oceans: 66, soil: 66 },
  { month: 'May', forests: 77, wetlands: 65, oceans: 68, soil: 69 },
  { month: 'Jun', forests: 81, wetlands: 68, oceans: 71, soil: 73 },
];

const regionalData = {
  global: { forests: 81, wetlands: 68, oceans: 71, soil: 73 },
  'north-america': { forests: 78, wetlands: 72, oceans: 68, soil: 75 },
  'south-america': { forests: 85, wetlands: 70, oceans: 73, soil: 71 },
  europe: { forests: 76, wetlands: 74, oceans: 69, soil: 78 },
  africa: { forests: 79, wetlands: 65, oceans: 72, soil: 68 },
  asia: { forests: 83, wetlands: 66, oceans: 74, soil: 70 },
  oceania: { forests: 80, wetlands: 71, oceans: 76, soil: 72 },
};

const impactComparison = [
  { month: 'Jan', current: 67, previous: 62, target: 75 },
  { month: 'Feb', current: 69, previous: 63, target: 75 },
  { month: 'Mar', current: 71, previous: 65, target: 75 },
  { month: 'Apr', current: 74, previous: 67, target: 75 },
  { month: 'May', current: 77, previous: 69, target: 75 },
  { month: 'Jun', current: 81, previous: 71, target: 75 },
];

const impactForecast = [
  { month: 'Jul', value: 83, forecast: true },
  { month: 'Aug', value: 85, forecast: true },
  { month: 'Sep', value: 86, forecast: true },
  { month: 'Oct', value: 88, forecast: true },
  { month: 'Nov', value: 89, forecast: true },
  { month: 'Dec', value: 91, forecast: true },
];

const projects = [
  {
    id: 1,
    name: 'Amazon Rainforest Corridor Restoration',
    location: 'Brazil, Peru, Colombia',
    impact: {
      carbon: '12.4M tons',
      biodiversity: '2,847 species protected',
      communities: '142 indigenous communities',
    },
    value: '$234M',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Sahel Great Green Wall Initiative',
    location: 'Africa (11 countries)',
    impact: {
      trees: '847K hectares reforested',
      livelihoods: '67K families supported',
      carbon: '8.9M tons',
    },
    value: '$187M',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Pacific Island Cultural Heritage Program',
    location: 'Polynesia, Micronesia, Melanesia',
    impact: {
      languages: '23 languages preserved',
      traditions: '156 cultural practices documented',
      youth: '4,231 youth engaged',
    },
    value: '$92M',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Himalayan Watershed Protection',
    location: 'Nepal, Bhutan, India',
    impact: {
      water: '2.3M people water access',
      glaciers: '47 glacier systems monitored',
      ecosystems: '234K hectares protected',
    },
    value: '$156M',
    status: 'Active',
  },
];

const realTimeMetrics = [
  {
    title: 'CO₂ Sequestered (Today)',
    value: '2.34M tons',
    icon: Wind,
    color: 'emerald',
    change: '+12.3%',
  },
  {
    title: 'Trees Planted (This Month)',
    value: '8.9M',
    icon: TreePine,
    color: 'green',
    change: '+8.7%',
  },
  {
    title: 'Communities Supported',
    value: '12,847',
    icon: Users,
    color: 'blue',
    change: '+15.2%',
  },
  {
    title: 'Hectares Restored',
    value: '234K',
    icon: Sprout,
    color: 'purple',
    change: '+9.4%',
  },
  {
    title: 'Clean Water Access',
    value: '4.2M people',
    icon: Droplet,
    color: 'cyan',
    change: '+6.8%',
  },
  {
    title: 'Health Programs Active',
    value: '1,567',
    icon: Heart,
    color: 'pink',
    change: '+11.3%',
  },
];

export function ImpactMetrics() {
  const [selectedRegion, setSelectedRegion] = useState<keyof typeof regionalData>('global');
  const [showComparison, setShowComparison] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

  const regions = [
    { id: 'global', label: 'Global' },
    { id: 'north-america', label: 'North America' },
    { id: 'south-america', label: 'South America' },
    { id: 'europe', label: 'Europe' },
    { id: 'africa', label: 'Africa' },
    { id: 'asia', label: 'Asia' },
    { id: 'oceania', label: 'Oceania' },
  ];

  const currentRegionalData = regionalData[selectedRegion];
  const regionalImpact = [
    { name: 'Forest Health', value: currentRegionalData.forests, fill: '#10b981' },
    { name: 'Water Quality', value: currentRegionalData.wetlands, fill: '#3b82f6' },
    { name: 'Biodiversity', value: currentRegionalData.oceans, fill: '#f59e0b' },
    { name: 'Soil Health', value: currentRegionalData.soil, fill: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-white mb-2">Real-Time Impact Metrics</h2>
            <p className="text-emerald-300/80">
              Track measurable regeneration across every transaction — see how investments translate into 
              ecological restoration, cultural renewal, and human well-being.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowComparison(!showComparison)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${
                showComparison
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-emerald-500/10 text-emerald-400/60 border-emerald-500/20 hover:border-emerald-500/30'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span className="text-sm">Compare</span>
            </button>
            <button 
              onClick={() => setShowForecast(!showForecast)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${
                showForecast
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-emerald-500/10 text-emerald-400/60 border-emerald-500/20 hover:border-emerald-500/30'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Forecast</span>
            </button>
          </div>
        </div>
      </div>

      {/* Regional Filter */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-5 h-5 text-emerald-400" />
          <h3 className="text-white">Regional Analysis</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => setSelectedRegion(region.id as any)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                selectedRegion === region.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
              }`}
            >
              {region.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {realTimeMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br from-${metric.color}-500 to-${metric.color}-600 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>{metric.change}</span>
                </div>
              </div>
              <div className="text-emerald-300/70 text-sm mb-1">{metric.title}</div>
              <div className="text-white">{metric.value}</div>
            </div>
          );
        })}
      </div>

      {/* Ecosystem Health Trends with Comparison */}
      {showComparison ? (
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <h3 className="text-white mb-6">Impact Comparison: Current vs Previous Year</h3>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={impactComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#10b981" opacity={0.1} />
              <XAxis dataKey="month" stroke="#6ee7b7" />
              <YAxis stroke="#6ee7b7" label={{ value: 'Health Score', angle: -90, position: 'insideLeft', fill: '#6ee7b7' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#064e3b', 
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Bar dataKey="previous" fill="#6ee7b7" fillOpacity={0.3} name="2024" />
              <Line type="monotone" dataKey="current" stroke="#10b981" strokeWidth={3} name="2025" dot={{ fill: '#10b981', r: 5 }} />
              <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Target" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-emerald-300/70 text-sm">Current Year (2025)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-300 opacity-30 rounded-full"></div>
              <span className="text-emerald-300/70 text-sm">Previous Year (2024)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-amber-500" style={{ borderTop: '2px dashed #f59e0b' }}></div>
              <span className="text-emerald-300/70 text-sm">Target</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <h3 className="text-white mb-6">Global Ecosystem Health Trends</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={ecosystemHealth}>
              <defs>
                <linearGradient id="colorForests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorWetlands" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOceans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSoil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#10b981" opacity={0.1} />
              <XAxis dataKey="month" stroke="#6ee7b7" />
              <YAxis stroke="#6ee7b7" label={{ value: 'Health Score', angle: -90, position: 'insideLeft', fill: '#6ee7b7' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#064e3b', 
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Area type="monotone" dataKey="forests" stroke="#10b981" fill="url(#colorForests)" strokeWidth={2} />
              <Area type="monotone" dataKey="wetlands" stroke="#3b82f6" fill="url(#colorWetlands)" strokeWidth={2} />
              <Area type="monotone" dataKey="oceans" stroke="#0ea5e9" fill="url(#colorOceans)" strokeWidth={2} />
              <Area type="monotone" dataKey="soil" stroke="#8b5cf6" fill="url(#colorSoil)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-emerald-300/70 text-sm">Forests</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-emerald-300/70 text-sm">Wetlands</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
              <span className="text-emerald-300/70 text-sm">Oceans</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-emerald-300/70 text-sm">Soil</span>
            </div>
          </div>
        </div>
      )}

      {/* Impact Forecast */}
      {showForecast && (
        <div className="bg-black/30 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6">
          <h3 className="text-white mb-6">Impact Forecast: Next 6 Months</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={[...ecosystemHealth, ...impactForecast]}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f59e0b" opacity={0.1} />
              <XAxis dataKey="month" stroke="#fcd34d" />
              <YAxis stroke="#fcd34d" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#78350f', 
                  border: '1px solid #f59e0b',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="forests" 
                stroke="#10b981" 
                fill="url(#colorForests)" 
                strokeWidth={2} 
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#f59e0b" 
                fill="url(#colorForecast)" 
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 bg-amber-900/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-amber-400 mb-2">Projected Growth</div>
                <div className="text-emerald-300/80 text-sm">
                  Based on current trends and planned initiatives, ecosystem health scores are projected to reach 91% 
                  by December 2025, exceeding our 75% target by a significant margin.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Impact Score - Now Regional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <h3 className="text-white mb-6">{selectedRegion === 'global' ? 'Planetary' : regions.find(r => r.id === selectedRegion)?.label} Health Score</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart 
                innerRadius="30%" 
                outerRadius="100%" 
                data={regionalImpact}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  minAngle={15}
                  background
                  clockWise
                  dataKey="value"
                  cornerRadius={10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#064e3b', 
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {regionalImpact.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                  <span className="text-emerald-300/70 text-sm">{item.name}</span>
                </div>
                <span className="text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Summary */}
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <h3 className="text-white mb-6">RVE Global Impact Summary</h3>
          <div className="space-y-4">
            <div className="bg-emerald-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300/70">Total Projects</span>
                </div>
                <span className="text-white">12,847</span>
              </div>
              <div className="text-emerald-300/60 text-sm">Across 142 countries</div>
            </div>

            <div className="bg-emerald-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300/70">Ecosystems Healing</span>
                </div>
                <span className="text-white">847</span>
              </div>
              <div className="text-emerald-300/60 text-sm">From degraded to thriving</div>
            </div>

            <div className="bg-emerald-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300/70">Communities Empowered</span>
                </div>
                <span className="text-white">3,421</span>
              </div>
              <div className="text-emerald-300/60 text-sm">Indigenous and local groups</div>
            </div>

            <div className="bg-emerald-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300/70">Lives Improved</span>
                </div>
                <span className="text-white">24.7M</span>
              </div>
              <div className="text-emerald-300/60 text-sm">Through health & wellness programs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Projects */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-6">High-Impact Regeneration Projects</h3>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-emerald-900/10 border border-emerald-500/10 rounded-lg p-6 hover:border-emerald-500/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-white mb-2">{project.name}</h4>
                  <div className="text-emerald-300/70 text-sm mb-3">{project.location}</div>
                  <div className="flex items-center gap-2">
                    <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm">
                      {project.status}
                    </div>
                    <div className="text-emerald-300/70 text-sm">Total Value: {project.value}</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(project.impact).map(([key, value], idx) => (
                  <div key={idx} className="bg-emerald-900/20 rounded-lg p-3">
                    <div className="text-emerald-300/70 text-sm mb-1 capitalize">{key}</div>
                    <div className="text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Statement */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-8">
        <h3 className="text-white mb-4">From Extraction to Regeneration</h3>
        <p className="text-emerald-300/80 mb-4">
          The RVE has fundamentally transformed how we measure economic growth. Instead of GDP based on resource depletion, 
          we now track Regenerative Value — an economy that grows by healing, not harming.
        </p>
        <p className="text-emerald-300/80">
          Every metric on this dashboard represents real change: forests regrowing, languages being spoken again, 
          communities thriving, and ecosystems returning to health. This is wealth that appreciates over time, 
          creating abundance for future generations rather than debt.
        </p>
      </div>
    </div>
  );
}