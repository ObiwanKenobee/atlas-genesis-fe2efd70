import { Trees, Heart, Palette, Waves, TrendingUp, CheckCircle, Info, ArrowRight, X, LineChart as LineChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import { useState } from 'react';

const environmentalData = [
  { category: 'Carbon Sequestration', value: 142, projects: 2847 },
  { category: 'Forest Restoration', value: 98, projects: 1923 },
  { category: 'Wetland Revival', value: 76, projects: 1245 },
  { category: 'Soil Regeneration', value: 68, projects: 3421 },
];

const healthData = [
  { category: 'Community Wellness', value: 87, projects: 1567 },
  { category: 'Disease Prevention', value: 65, projects: 892 },
  { category: 'Educational Uplift', value: 61, projects: 2134 },
];

const culturalData = [
  { category: 'Language Preservation', value: 54, projects: 423 },
  { category: 'Traditional Crafts', value: 48, projects: 1876 },
  { category: 'Indigenous Governance', value: 34, projects: 234 },
  { category: 'Heritage Sites', value: 20, projects: 567 },
];

const ecosystemServicesData = [
  { subject: 'Pollination', value: 85 },
  { subject: 'Water Purification', value: 78 },
  { subject: 'Climate Resilience', value: 92 },
  { subject: 'Nutrient Cycling', value: 73 },
  { subject: 'Flood Control', value: 68 },
  { subject: 'Air Quality', value: 81 },
];

const assetDetails = {
  environmental: {
    description: 'Environmental assets represent verified carbon sequestration, forest restoration, wetland revival, and soil regeneration efforts. Each asset is backed by real ecological impact tracked through satellite monitoring and ground verification.',
    benefits: ['Carbon offset credits', 'Biodiversity protection', 'Climate resilience', 'Ecosystem restoration'],
    riskLevel: 'Low',
    avgReturn: '+12.3% annually',
    verificationMethod: 'Satellite imagery + Ground sensors',
    performance: [
      { month: 'Jan', value: 132 },
      { month: 'Feb', value: 138 },
      { month: 'Mar', value: 145 },
      { month: 'Apr', value: 151 },
      { month: 'May', value: 158 },
      { month: 'Jun', value: 164 },
    ]
  },
  health: {
    description: 'Health & Social assets track community wellness programs, disease prevention initiatives, and educational uplift projects that measurably improve human well-being and social cohesion.',
    benefits: ['Community health improvement', 'Educational access', 'Social cohesion', 'Reduced healthcare costs'],
    riskLevel: 'Medium',
    avgReturn: '+8.7% annually',
    verificationMethod: 'Health records + Community surveys',
    performance: [
      { month: 'Jan', value: 78 },
      { month: 'Feb', value: 81 },
      { month: 'Mar', value: 84 },
      { month: 'Apr', value: 87 },
      { month: 'May', value: 89 },
      { month: 'Jun', value: 92 },
    ]
  },
  cultural: {
    description: 'Cultural assets preserve languages, traditional crafts, indigenous governance systems, and heritage sites. These assets maintain cultural diversity and ancestral knowledge essential for regenerative practices.',
    benefits: ['Language preservation', 'Cultural heritage', 'Traditional knowledge', 'Community identity'],
    riskLevel: 'Medium',
    avgReturn: '+15.2% annually',
    verificationMethod: 'Cultural audits + Elder verification',
    performance: [
      { month: 'Jan', value: 42 },
      { month: 'Feb', value: 45 },
      { month: 'Mar', value: 48 },
      { month: 'Apr', value: 51 },
      { month: 'May', value: 53 },
      { month: 'Jun', value: 56 },
    ]
  },
  ecosystem: {
    description: 'Ecosystem service assets quantify pollination, water purification, climate regulation, nutrient cycling, and other critical natural processes that support all life on Earth.',
    benefits: ['Natural pest control', 'Water filtration', 'Climate stability', 'Soil fertility'],
    riskLevel: 'Low',
    avgReturn: '+9.4% annually',
    verificationMethod: 'Ecological monitoring + AI analysis',
    performance: [
      { month: 'Jan', value: 68 },
      { month: 'Feb', value: 71 },
      { month: 'Mar', value: 74 },
      { month: 'Apr', value: 77 },
      { month: 'May', value: 80 },
      { month: 'Jun', value: 83 },
    ]
  }
};

export function AssetClasses() {
  const [selectedAssetType, setSelectedAssetType] = useState<keyof typeof assetDetails | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparedAssets, setComparedAssets] = useState<(keyof typeof assetDetails)[]>([]);

  const toggleComparison = (assetType: keyof typeof assetDetails) => {
    if (comparedAssets.includes(assetType)) {
      setComparedAssets(comparedAssets.filter(a => a !== assetType));
    } else if (comparedAssets.length < 3) {
      setComparedAssets([...comparedAssets, assetType]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-white mb-2">Regenerative Asset Classes</h2>
            <p className="text-emerald-300/80">
              Quantifiable units of ecological restoration, cultural renewal, and human well-being — 
              tokenized and traded as valuable impact assets.
            </p>
          </div>
          <button
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${
              comparisonMode
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-emerald-500/10 text-emerald-400/60 border-emerald-500/20 hover:border-emerald-500/30'
            }`}
          >
            <LineChartIcon className="w-4 h-4" />
            <span className="text-sm">Compare Assets</span>
          </button>
        </div>
      </div>

      {/* Asset Comparison View */}
      {comparisonMode && comparedAssets.length > 0 && (
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white">Asset Performance Comparison</h3>
            <button
              onClick={() => setComparedAssets([])}
              className="text-emerald-400/60 hover:text-emerald-400 text-sm"
            >
              Clear All
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart>
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
              {comparedAssets.includes('environmental') && (
                <Line 
                  type="monotone" 
                  data={assetDetails.environmental.performance}
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Environmental"
                  dot={{ fill: '#10b981', r: 4 }}
                />
              )}
              {comparedAssets.includes('health') && (
                <Line 
                  type="monotone" 
                  data={assetDetails.health.performance}
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Health & Social"
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              )}
              {comparedAssets.includes('cultural') && (
                <Line 
                  type="monotone" 
                  data={assetDetails.cultural.performance}
                  dataKey="value" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Cultural"
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
              )}
              {comparedAssets.includes('ecosystem') && (
                <Line 
                  type="monotone" 
                  data={assetDetails.ecosystem.performance}
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Ecosystem"
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {comparedAssets.map((assetType) => {
              const colors = {
                environmental: '#10b981',
                health: '#3b82f6',
                cultural: '#f59e0b',
                ecosystem: '#8b5cf6'
              };
              const labels = {
                environmental: 'Environmental',
                health: 'Health & Social',
                cultural: 'Cultural',
                ecosystem: 'Ecosystem Services'
              };
              return (
                <div key={assetType} className="bg-emerald-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[assetType] }}></div>
                    <span className="text-emerald-400 text-sm">{labels[assetType]}</span>
                  </div>
                  <div className="text-white mb-1">{assetDetails[assetType].avgReturn}</div>
                  <div className="text-emerald-300/50 text-sm">{assetDetails[assetType].riskLevel} Risk</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Environmental Assets */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Trees className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white">Environmental Assets</h3>
              <p className="text-emerald-300/70 text-sm">Carbon, forests, wetlands, and soil restoration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {comparisonMode && (
              <button
                onClick={() => toggleComparison('environmental')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  comparedAssets.includes('environmental')
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                }`}
              >
                {comparedAssets.includes('environmental') ? 'Selected' : 'Compare'}
              </button>
            )}
            <button
              onClick={() => setSelectedAssetType('environmental')}
              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <Info className="w-5 h-5" />
              <span className="text-sm">Details</span>
            </button>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={environmentalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#10b981" opacity={0.1} />
            <XAxis dataKey="category" stroke="#6ee7b7" angle={-15} textAnchor="end" height={80} />
            <YAxis stroke="#6ee7b7" label={{ value: 'Value (Billions USD)', angle: -90, position: 'insideLeft', fill: '#6ee7b7' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#064e3b', 
                border: '1px solid #10b981',
                borderRadius: '8px',
                color: '#fff'
              }} 
            />
            <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {environmentalData.map((item, idx) => (
            <div key={idx} className="bg-emerald-900/20 rounded-lg p-4">
              <div className="text-emerald-400 text-sm mb-1">{item.category}</div>
              <div className="text-white mb-1">${item.value}B</div>
              <div className="text-emerald-300/50 text-sm">{item.projects.toLocaleString()} projects</div>
            </div>
          ))}
        </div>
      </div>

      {/* Health & Social Assets */}
      <div className="bg-black/30 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white">Health & Social Assets</h3>
              <p className="text-blue-300/70 text-sm">Community wellness, disease prevention, and education</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {comparisonMode && (
              <button
                onClick={() => toggleComparison('health')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  comparedAssets.includes('health')
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                }`}
              >
                {comparedAssets.includes('health') ? 'Selected' : 'Compare'}
              </button>
            )}
            <button
              onClick={() => setSelectedAssetType('health')}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Info className="w-5 h-5" />
              <span className="text-sm">Details</span>
            </button>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={healthData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#3b82f6" opacity={0.1} />
            <XAxis type="number" stroke="#93c5fd" />
            <YAxis type="category" dataKey="category" stroke="#93c5fd" width={150} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e3a8a', 
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                color: '#fff'
              }} 
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {healthData.map((item, idx) => (
            <div key={idx} className="bg-blue-900/20 rounded-lg p-4">
              <div className="text-blue-400 text-sm mb-1">{item.category}</div>
              <div className="text-white mb-1">${item.value}B</div>
              <div className="text-blue-300/50 text-sm">{item.projects.toLocaleString()} projects</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cultural Assets */}
      <div className="bg-black/30 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white">Cultural Assets</h3>
              <p className="text-amber-300/70 text-sm">Languages, traditions, crafts, and indigenous systems</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {comparisonMode && (
              <button
                onClick={() => toggleComparison('cultural')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  comparedAssets.includes('cultural')
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                }`}
              >
                {comparedAssets.includes('cultural') ? 'Selected' : 'Compare'}
              </button>
            )}
            <button
              onClick={() => setSelectedAssetType('cultural')}
              className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Info className="w-5 h-5" />
              <span className="text-sm">Details</span>
            </button>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={culturalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f59e0b" opacity={0.1} />
            <XAxis dataKey="category" stroke="#fcd34d" angle={-15} textAnchor="end" height={80} />
            <YAxis stroke="#fcd34d" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#78350f', 
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                color: '#fff'
              }} 
            />
            <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {culturalData.map((item, idx) => (
            <div key={idx} className="bg-amber-900/20 rounded-lg p-4">
              <div className="text-amber-400 text-sm mb-1">{item.category}</div>
              <div className="text-white mb-1">${item.value}B</div>
              <div className="text-amber-300/50 text-sm">{item.projects.toLocaleString()} projects</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ecosystem Services */}
      <div className="bg-black/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white">Ecosystem Services</h3>
              <p className="text-purple-300/70 text-sm">Pollination, water purification, and climate resilience</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {comparisonMode && (
              <button
                onClick={() => toggleComparison('ecosystem')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  comparedAssets.includes('ecosystem')
                    ? 'bg-purple-500 text-white'
                    : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                }`}
              >
                {comparedAssets.includes('ecosystem') ? 'Selected' : 'Compare'}
              </button>
            )}
            <button
              onClick={() => setSelectedAssetType('ecosystem')}
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Info className="w-5 h-5" />
              <span className="text-sm">Details</span>
            </button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={ecosystemServicesData}>
              <PolarGrid stroke="#8b5cf6" opacity={0.3} />
              <PolarAngleAxis dataKey="subject" stroke="#c4b5fd" />
              <PolarRadiusAxis stroke="#c4b5fd" />
              <Radar name="Service Health" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#4c1d95', 
                  border: '1px solid #8b5cf6',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {ecosystemServicesData.map((item, idx) => (
            <div key={idx} className="bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-purple-400 text-sm">{item.subject}</div>
                <CheckCircle className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-white">{item.value}% Health Score</div>
            </div>
          ))}
        </div>
      </div>

      {/* Asset Details Modal */}
      {selectedAssetType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white">Asset Details</h3>
              <button
                onClick={() => setSelectedAssetType(null)}
                className="text-emerald-400/60 hover:text-emerald-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Trees className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white">Environmental Assets</h4>
                  <p className="text-emerald-300/70 text-sm">Carbon, forests, wetlands, and soil restoration</p>
                </div>
              </div>
              <p className="text-emerald-300/80">{assetDetails[selectedAssetType].description}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {assetDetails[selectedAssetType].benefits.map((benefit, idx) => (
                  <div key={idx} className="bg-emerald-900/20 rounded-lg p-4">
                    <div className="text-emerald-400 text-sm mb-1">Benefit {idx + 1}</div>
                    <div className="text-white">{benefit}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-emerald-400 text-sm">Average Return</div>
                  <div className="text-white">{assetDetails[selectedAssetType].avgReturn}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-emerald-400 text-sm">Risk Level</div>
                  <div className="text-white">{assetDetails[selectedAssetType].riskLevel} Risk</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-emerald-400 text-sm">Verification Method</div>
                  <div className="text-white">{assetDetails[selectedAssetType].verificationMethod}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}