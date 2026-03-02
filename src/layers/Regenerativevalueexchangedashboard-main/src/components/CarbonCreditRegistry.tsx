import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Leaf, Shield, CheckCircle2, TrendingUp, MapPin, Calendar, FileCheck, Globe } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function CarbonCreditRegistry() {
  const [selectedRegistry, setSelectedRegistry] = useState('verra');

  // Integrated registries
  const registries = [
    {
      id: 'verra',
      name: 'Verra (VCS)',
      fullName: 'Verified Carbon Standard',
      creditsIssued: 1234567890,
      projects: 2145,
      countries: 89,
      price: 12.50,
      status: 'integrated',
      methodology: 'Gold Standard'
    },
    {
      id: 'gold-standard',
      name: 'Gold Standard',
      fullName: 'Gold Standard for the Global Goals',
      creditsIssued: 987654321,
      projects: 1876,
      countries: 72,
      price: 15.75,
      status: 'integrated',
      methodology: 'CDM'
    },
    {
      id: 'car',
      name: 'Climate Action Reserve',
      fullName: 'Climate Action Reserve',
      creditsIssued: 456789012,
      projects: 934,
      countries: 3,
      price: 14.20,
      status: 'integrated',
      methodology: 'CAR Protocol'
    },
    {
      id: 'acr',
      name: 'American Carbon Registry',
      fullName: 'American Carbon Registry',
      creditsIssued: 345678901,
      projects: 678,
      countries: 15,
      price: 13.80,
      status: 'integrated',
      methodology: 'ACR Standard'
    },
  ];

  // Project types
  const projectTypes = [
    { type: 'Reforestation & Afforestation', credits: 456000000, projects: 678, avgPrice: 14.20, color: '#10b981' },
    { type: 'Renewable Energy', credits: 389000000, projects: 523, avgPrice: 12.80, color: '#3b82f6' },
    { type: 'Energy Efficiency', credits: 234000000, projects: 412, avgPrice: 11.50, color: '#f59e0b' },
    { type: 'Avoided Deforestation (REDD+)', credits: 567000000, projects: 289, avgPrice: 16.30, color: '#8b5cf6' },
    { type: 'Methane Capture', credits: 178000000, projects: 234, avgPrice: 10.90, color: '#ec4899' },
    { type: 'Blue Carbon (Mangroves, Wetlands)', credits: 145000000, projects: 156, avgPrice: 18.50, color: '#14b8a6' },
  ];

  // Recent credit retirements
  const recentRetirements = [
    {
      id: 'RET-8472',
      project: 'Amazon Rainforest Conservation',
      credits: 125000,
      buyer: 'Microsoft',
      vintage: '2024',
      registry: 'Verra',
      date: '2025-11-28',
      purpose: 'Corporate Net-Zero Commitment'
    },
    {
      id: 'RET-8471',
      project: 'Kenya Wind Farm Project',
      credits: 87500,
      buyer: 'Apple',
      vintage: '2024',
      registry: 'Gold Standard',
      date: '2025-11-25',
      purpose: 'Scope 2 Emissions Offset'
    },
    {
      id: 'RET-8470',
      project: 'Mangrove Restoration Indonesia',
      credits: 45600,
      buyer: 'Stripe Climate',
      vintage: '2025',
      registry: 'Verra',
      date: '2025-11-22',
      purpose: 'Carbon Removal Portfolio'
    },
    {
      id: 'RET-8469',
      project: 'California Forest Conservation',
      credits: 156000,
      buyer: 'Google',
      vintage: '2024',
      registry: 'CAR',
      date: '2025-11-20',
      purpose: 'Carbon Neutral Operations'
    },
  ];

  // Price history by vintage
  const priceHistory = [
    { month: 'Jan', '2024': 11.50, '2025': 14.20, '2026': 16.80 },
    { month: 'Feb', '2024': 11.80, '2025': 14.60, '2026': 17.20 },
    { month: 'Mar', '2024': 12.10, '2025': 15.10, '2026': 17.80 },
    { month: 'Apr', '2024': 12.30, '2025': 15.40, '2026': 18.20 },
    { month: 'May', '2024': 12.50, '2025': 15.75, '2026': 18.60 },
    { month: 'Jun', '2024': 12.50, '2025': 15.75, '2026': 18.60 },
  ];

  // Verification standards
  const verificationStandards = [
    {
      icon: Shield,
      standard: 'Additionality',
      description: 'Projects must prove they would not have happened without carbon financing',
      verified: true
    },
    {
      icon: CheckCircle2,
      standard: 'Permanence',
      description: 'Carbon reductions must be permanent and protected for minimum duration',
      verified: true
    },
    {
      icon: FileCheck,
      standard: 'Leakage Prevention',
      description: 'Ensure emissions are not simply displaced to other locations',
      verified: true
    },
    {
      icon: Globe,
      standard: 'Monitoring & Verification',
      description: 'Third-party verification and ongoing monitoring requirements',
      verified: true
    },
  ];

  // Geographic distribution
  const geographicDistribution = [
    { region: 'Latin America', credits: 567000000, percentage: 32, color: '#10b981' },
    { region: 'Asia Pacific', credits: 445000000, percentage: 25, color: '#3b82f6' },
    { region: 'Africa', credits: 389000000, percentage: 22, color: '#f59e0b' },
    { region: 'North America', credits: 234000000, percentage: 13, color: '#8b5cf6' },
    { region: 'Europe', credits: 145000000, percentage: 8, color: '#ec4899' },
  ];

  // Market statistics
  const marketStats = [
    { month: 'Jan', issued: 12500000, retired: 8900000 },
    { month: 'Feb', issued: 14200000, retired: 9800000 },
    { month: 'Mar', issued: 16800000, retired: 11200000 },
    { month: 'Apr', issued: 15400000, retired: 10600000 },
    { month: 'May', issued: 18900000, retired: 12800000 },
    { month: 'Jun', issued: 19200000, retired: 13400000 },
  ];

  const totalCredits = registries.reduce((sum, reg) => sum + reg.creditsIssued, 0);
  const totalProjects = registries.reduce((sum, reg) => sum + reg.projects, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white mb-2">Carbon Credit Registry Integration</h2>
        <p className="text-emerald-300/70">Unified access to global carbon credit registries and verification systems</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Total Credits</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">{(totalCredits / 1000000000).toFixed(2)}B</div>
          <div className="text-emerald-400 text-sm">Across all registries</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Active Projects</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">{totalProjects.toLocaleString()}</div>
          <div className="text-emerald-400 text-sm">Verified projects</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Avg Price</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">$14.06</div>
          <div className="text-emerald-400 text-sm">Per tCO2e</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Registries</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">{registries.length}</div>
          <div className="text-emerald-400 text-sm">Integrated systems</div>
        </Card>
      </div>

      {/* Integrated Registries */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Integrated Carbon Registries</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {registries.map((registry) => (
            <div
              key={registry.id}
              className={`bg-slate-900/50 border rounded-lg p-4 cursor-pointer transition-all ${
                selectedRegistry === registry.id
                  ? 'border-emerald-400 bg-emerald-400/10'
                  : 'border-emerald-500/20 hover:border-emerald-400/50'
              }`}
              onClick={() => setSelectedRegistry(registry.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{registry.name}</h4>
                  <div className="text-emerald-300/70 text-sm mt-1">{registry.fullName}</div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  {registry.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-emerald-300/70 text-xs">Credits Issued</div>
                  <div className="text-white font-medium">{(registry.creditsIssued / 1000000).toFixed(0)}M</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Projects</div>
                  <div className="text-white font-medium">{registry.projects.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Countries</div>
                  <div className="text-white font-medium">{registry.countries}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Avg Price</div>
                  <div className="text-white font-medium">${registry.price}</div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-2">
                <div className="text-emerald-300/70 text-xs">Methodology</div>
                <div className="text-white text-sm">{registry.methodology}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Project Types */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Carbon Credit Projects by Type</h3>
        
        <div className="space-y-3">
          {projectTypes.map((project, index) => (
            <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: project.color }}
                  />
                  <h4 className="text-white font-medium">{project.type}</h4>
                </div>
                <div className="text-emerald-400 font-medium">${project.avgPrice}/tCO2e</div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <div className="text-emerald-300/70 text-xs">Credits Issued</div>
                  <div className="text-white font-medium">{(project.credits / 1000000).toFixed(0)}M tCO2e</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Active Projects</div>
                  <div className="text-white font-medium">{project.projects}</div>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-full h-2 mt-3">
                <div 
                  className="h-2 rounded-full"
                  style={{ 
                    width: `${(project.credits / 567000000) * 100}%`,
                    backgroundColor: project.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Price History */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Carbon Credit Prices by Vintage (USD/tCO2e)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={priceHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="month" stroke="#6ee7b7" />
            <YAxis stroke="#6ee7b7" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b98150' }}
              labelStyle={{ color: '#6ee7b7' }}
            />
            <Line type="monotone" dataKey="2024" stroke="#10b981" strokeWidth={2} name="2024 Vintage" />
            <Line type="monotone" dataKey="2025" stroke="#3b82f6" strokeWidth={2} name="2025 Vintage" />
            <Line type="monotone" dataKey="2026" stroke="#f59e0b" strokeWidth={2} name="2026 Vintage" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Market Activity */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Monthly Issuance vs. Retirement</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={marketStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="month" stroke="#6ee7b7" />
            <YAxis stroke="#6ee7b7" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b98150' }}
              labelStyle={{ color: '#6ee7b7' }}
            />
            <Bar dataKey="issued" fill="#10b981" name="Issued" />
            <Bar dataKey="retired" fill="#ef4444" name="Retired" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">Geographic Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={geographicDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ region, percentage }) => `${region}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="credits"
              >
                {geographicDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b98150' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Verification Standards */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">Verification Standards</h3>
          
          <div className="space-y-3">
            {verificationStandards.map((standard, index) => {
              const Icon = standard.icon;
              return (
                <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-500/20 p-2 rounded-lg">
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-white font-medium">{standard.standard}</h4>
                        {standard.verified && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-emerald-300/70 text-sm">{standard.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent Retirements */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Recent Credit Retirements</h3>
        
        <div className="space-y-2">
          {recentRetirements.map((retirement, index) => (
            <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-white font-medium">{retirement.project}</div>
                    <div className="text-emerald-300/70 text-sm">{retirement.id}</div>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  {retirement.registry}
                </Badge>
              </div>

              <div className="grid grid-cols-5 gap-3">
                <div>
                  <div className="text-emerald-300/70 text-xs">Credits Retired</div>
                  <div className="text-white font-medium">{retirement.credits.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Buyer</div>
                  <div className="text-white font-medium">{retirement.buyer}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Vintage</div>
                  <div className="text-white font-medium">{retirement.vintage}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Date</div>
                  <div className="text-white font-medium">{retirement.date}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Purpose</div>
                  <div className="text-white font-medium text-sm">{retirement.purpose}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Registry API Access */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">API Integration</h3>
        
        <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4 mb-4">
          <div className="text-emerald-300/70 text-sm mb-2">Example: Query Carbon Credits</div>
          <pre className="text-white text-sm overflow-x-auto">
{`// Query credits from integrated registries
const credits = await rve.carbon.queryCredits({
  registry: ['verra', 'gold-standard'],
  projectType: 'reforestation',
  vintage: '2024',
  minPrice: 10,
  maxPrice: 20,
  location: 'Latin America'
});

// Retire credits on-chain
await rve.carbon.retireCredits({
  creditIds: credits.map(c => c.id),
  beneficiary: 'Your Organization',
  reason: 'Corporate Net-Zero Commitment'
});`}
          </pre>
        </div>

        <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
          View Full API Documentation
        </Button>
      </Card>
    </div>
  );
}
