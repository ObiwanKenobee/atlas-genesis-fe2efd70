import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Globe, Users, TrendingUp, DollarSign, MapPin, Languages, Building, CheckCircle2 } from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function GlobalExpansion() {
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Regional presence
  const regions = [
    {
      id: 'north-america',
      name: 'North America',
      countries: 3,
      users: 23456,
      projects: 145,
      tvl: 28500000,
      growth: 18.4,
      status: 'active',
      languages: ['English', 'Spanish', 'French']
    },
    {
      id: 'europe',
      name: 'Europe',
      countries: 12,
      users: 34567,
      projects: 234,
      tvl: 42300000,
      growth: 24.7,
      status: 'active',
      languages: ['English', 'German', 'French', 'Spanish', 'Italian']
    },
    {
      id: 'asia-pacific',
      name: 'Asia Pacific',
      countries: 8,
      users: 45234,
      projects: 312,
      tvl: 56700000,
      growth: 34.2,
      status: 'active',
      languages: ['English', 'Mandarin', 'Japanese', 'Korean', 'Hindi']
    },
    {
      id: 'latin-america',
      name: 'Latin America',
      countries: 15,
      users: 28934,
      projects: 198,
      tvl: 31200000,
      growth: 41.8,
      status: 'active',
      languages: ['Spanish', 'Portuguese', 'English']
    },
    {
      id: 'africa',
      name: 'Africa',
      countries: 7,
      users: 12456,
      projects: 87,
      tvl: 15800000,
      growth: 52.3,
      status: 'expanding',
      languages: ['English', 'French', 'Swahili', 'Arabic']
    },
    {
      id: 'middle-east',
      name: 'Middle East',
      countries: 5,
      users: 8942,
      projects: 54,
      tvl: 12400000,
      growth: 38.6,
      status: 'expanding',
      languages: ['Arabic', 'English', 'Hebrew']
    },
  ];

  // Supported languages
  const languages = [
    { code: 'en', name: 'English', users: 78234, completion: 100 },
    { code: 'es', name: 'Spanish', users: 45123, completion: 100 },
    { code: 'zh', name: 'Mandarin Chinese', users: 34567, completion: 95 },
    { code: 'fr', name: 'French', users: 23456, completion: 100 },
    { code: 'de', name: 'German', users: 18942, completion: 98 },
    { code: 'pt', name: 'Portuguese', users: 16234, completion: 100 },
    { code: 'ja', name: 'Japanese', users: 12456, completion: 92 },
    { code: 'ar', name: 'Arabic', users: 9234, completion: 88 },
    { code: 'hi', name: 'Hindi', users: 8456, completion: 85 },
    { code: 'ko', name: 'Korean', users: 7123, completion: 90 },
  ];

  // Monthly growth by region
  const regionalGrowth = [
    { month: 'Jan', 'North America': 18500, 'Europe': 24300, 'Asia Pacific': 32100, 'Latin America': 15200, 'Africa': 6800 },
    { month: 'Feb', 'North America': 19800, 'Europe': 26700, 'Asia Pacific': 35400, 'Latin America': 17800, 'Africa': 8200 },
    { month: 'Mar', 'North America': 21200, 'Europe': 29400, 'Asia Pacific': 38900, 'Latin America': 20600, 'Africa': 9800 },
    { month: 'Apr', 'North America': 22100, 'Europe': 31800, 'Asia Pacific': 41200, 'Latin America': 23400, 'Africa': 11200 },
    { month: 'May', 'North America': 22900, 'Europe': 33200, 'Asia Pacific': 43800, 'Latin America': 26100, 'Africa': 12900 },
    { month: 'Jun', 'North America': 23456, 'Europe': 34567, 'Asia Pacific': 45234, 'Latin America': 28934, 'Africa': 14567 },
  ];

  // Currency support
  const currencies = [
    { code: 'USD', name: 'US Dollar', volume: 45600000, markets: 35 },
    { code: 'EUR', name: 'Euro', volume: 38200000, markets: 28 },
    { code: 'GBP', name: 'British Pound', volume: 12400000, markets: 12 },
    { code: 'JPY', name: 'Japanese Yen', volume: 18900000, markets: 8 },
    { code: 'CNY', name: 'Chinese Yuan', volume: 23100000, markets: 15 },
    { code: 'BRL', name: 'Brazilian Real', volume: 9800000, markets: 10 },
  ];

  // Regulatory compliance
  const compliance = [
    {
      region: 'North America',
      jurisdictions: ['USA (SEC, FinCEN)', 'Canada (CSA)', 'Mexico (CNBV)'],
      status: 'Compliant',
      licenses: 3
    },
    {
      region: 'Europe',
      jurisdictions: ['EU (MiCA)', 'UK (FCA)', 'Switzerland (FINMA)'],
      status: 'Compliant',
      licenses: 12
    },
    {
      region: 'Asia Pacific',
      jurisdictions: ['Singapore (MAS)', 'Japan (FSA)', 'Hong Kong (SFC)'],
      status: 'Compliant',
      licenses: 8
    },
    {
      region: 'Latin America',
      jurisdictions: ['Brazil (CVM)', 'Argentina (CNV)', 'Chile (CMF)'],
      status: 'In Progress',
      licenses: 5
    },
  ];

  // Partnership ecosystem
  const partners = [
    {
      type: 'Conservation NGOs',
      count: 234,
      examples: ['WWF', 'Conservation International', 'Rainforest Alliance']
    },
    {
      type: 'Government Agencies',
      count: 67,
      examples: ['UNEP', 'National Park Services', 'Environmental Ministries']
    },
    {
      type: 'Indigenous Communities',
      count: 156,
      examples: ['Kayapo Federation', 'Maasai Cultural Network', 'First Nations']
    },
    {
      type: 'Research Institutions',
      count: 89,
      examples: ['Stanford Woods Institute', 'Oxford Biodiversity', 'ETH Zurich']
    },
    {
      type: 'Financial Institutions',
      count: 42,
      examples: ['IFC', 'Green Climate Fund', 'Impact Investment Banks']
    },
  ];

  // Market penetration
  const marketPenetration = [
    { region: 'North America', penetration: 12, potential: 88 },
    { region: 'Europe', penetration: 18, potential: 82 },
    { region: 'Asia Pacific', penetration: 8, potential: 92 },
    { region: 'Latin America', penetration: 15, potential: 85 },
    { region: 'Africa', penetration: 4, potential: 96 },
  ];

  const totalUsers = regions.reduce((sum, r) => sum + r.users, 0);
  const totalProjects = regions.reduce((sum, r) => sum + r.projects, 0);
  const totalTVL = regions.reduce((sum, r) => sum + r.tvl, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white mb-2">Global Expansion</h2>
        <p className="text-emerald-300/70">Bringing regenerative finance to every corner of the planet</p>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Total Users</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">{(totalUsers / 1000).toFixed(1)}K</div>
          <div className="text-emerald-400 text-sm">Across {regions.length} regions</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Active Projects</span>
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">{totalProjects}</div>
          <div className="text-emerald-400 text-sm">In 50+ countries</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Global TVL</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">${(totalTVL / 1000000).toFixed(0)}M</div>
          <div className="text-emerald-400 text-sm">+31.2% from last quarter</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Languages</span>
            <Languages className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">{languages.length}</div>
          <div className="text-emerald-400 text-sm">94% avg completion</div>
        </Card>
      </div>

      {/* Regional Overview */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Regional Presence</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.map((region) => (
            <div
              key={region.id}
              className={`bg-slate-900/50 border rounded-lg p-4 cursor-pointer transition-all ${
                selectedRegion === region.id
                  ? 'border-emerald-400 bg-emerald-400/10'
                  : 'border-emerald-500/20 hover:border-emerald-400/50'
              }`}
              onClick={() => setSelectedRegion(region.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{region.name}</h4>
                  <div className="text-emerald-300/70 text-sm mt-1">{region.countries} countries</div>
                </div>
                <Badge 
                  className={
                    region.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }
                >
                  {region.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-emerald-300/70 text-xs">Users</div>
                  <div className="text-white font-medium">{(region.users / 1000).toFixed(1)}K</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Projects</div>
                  <div className="text-white font-medium">{region.projects}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">TVL</div>
                  <div className="text-white font-medium">${(region.tvl / 1000000).toFixed(1)}M</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Growth</div>
                  <div className="text-emerald-400 font-medium">+{region.growth}%</div>
                </div>
              </div>

              <div className="text-emerald-300/70 text-xs">Languages: {region.languages.join(', ')}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Regional Growth Chart */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">User Growth by Region</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={regionalGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="month" stroke="#6ee7b7" />
            <YAxis stroke="#6ee7b7" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b98150' }}
              labelStyle={{ color: '#6ee7b7' }}
            />
            <Line type="monotone" dataKey="Asia Pacific" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="Europe" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="Latin America" stroke="#f59e0b" strokeWidth={2} />
            <Line type="monotone" dataKey="North America" stroke="#8b5cf6" strokeWidth={2} />
            <Line type="monotone" dataKey="Africa" stroke="#ec4899" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Language Support */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Supported Languages</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {languages.map((lang) => (
            <div key={lang.code} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Languages className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-white font-medium">{lang.name}</div>
                    <div className="text-emerald-300/70 text-sm">{(lang.users / 1000).toFixed(1)}K users</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-medium">{lang.completion}%</div>
                  <div className="text-emerald-300/70 text-xs">Complete</div>
                </div>
              </div>
              <div className="mt-2">
                <div className="bg-slate-900/50 rounded-full h-2">
                  <div 
                    className="bg-emerald-400 h-2 rounded-full"
                    style={{ width: `${lang.completion}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Currency Support */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Fiat Currency Support</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currencies.map((currency) => (
            <div key={currency.code} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-white font-medium">{currency.name}</div>
                  <div className="text-emerald-300/70 text-sm">{currency.code}</div>
                </div>
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-emerald-300/70 text-xs">24h Volume</div>
                  <div className="text-white font-medium">${(currency.volume / 1000000).toFixed(1)}M</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Markets</div>
                  <div className="text-white font-medium">{currency.markets}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Regulatory Compliance */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Regulatory Compliance</h3>
        
        <div className="space-y-3">
          {compliance.map((item, index) => (
            <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{item.region}</h4>
                  <div className="text-emerald-300/70 text-sm mt-1">
                    {item.licenses} active licenses
                  </div>
                </div>
                <Badge 
                  className={
                    item.status === 'Compliant'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }
                >
                  {item.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.jurisdictions.map((jurisdiction, jIndex) => (
                  <div key={jIndex} className="bg-emerald-500/10 border border-emerald-500/20 rounded px-3 py-1">
                    <span className="text-emerald-300 text-sm">{jurisdiction}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Partnership Ecosystem */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Global Partnership Ecosystem</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((partner, index) => (
            <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Building className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-white font-medium">{partner.type}</h4>
                  <div className="text-emerald-300/70 text-sm">{partner.count} partners</div>
                </div>
              </div>
              <div className="text-emerald-300/70 text-sm">
                Examples: {partner.examples.slice(0, 2).join(', ')}...
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Market Penetration */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Market Penetration & Growth Potential</h3>
        
        <div className="space-y-4">
          {marketPenetration.map((market, index) => (
            <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-white font-medium">{market.region}</div>
                <div className="text-emerald-400 font-medium">{market.penetration}% penetrated</div>
              </div>
              <div className="flex gap-1">
                <div 
                  className="h-3 bg-emerald-400 rounded-l"
                  style={{ width: `${market.penetration}%` }}
                />
                <div 
                  className="h-3 bg-emerald-400/20 rounded-r"
                  style={{ width: `${market.potential}%` }}
                />
              </div>
              <div className="text-emerald-300/70 text-sm mt-2">
                {market.potential}% growth potential remaining
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Expansion Roadmap */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">2026 Expansion Roadmap</h3>
        
        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-1" />
              <div>
                <h4 className="text-white font-medium mb-1">Q1 2026: Southeast Asia Expansion</h4>
                <p className="text-emerald-300/70 text-sm">
                  Launch in Thailand, Vietnam, Indonesia, and Philippines with local language support and partnerships
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <h4 className="text-white font-medium mb-1">Q2 2026: Sub-Saharan Africa Initiative</h4>
                <p className="text-emerald-300/70 text-sm">
                  Expand to Kenya, Nigeria, South Africa, and Ghana with mobile-first solutions
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-blue-400 mt-1" />
              <div>
                <h4 className="text-white font-medium mb-1">Q3 2026: Indigenous Partnerships</h4>
                <p className="text-emerald-300/70 text-sm">
                  Collaborate with indigenous communities in Amazon, Pacific Islands, and Arctic regions
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-purple-400 mt-1" />
              <div>
                <h4 className="text-white font-medium mb-1">Q4 2026: Enterprise & Government Deals</h4>
                <p className="text-emerald-300/70 text-sm">
                  Secure partnerships with national governments and multinational corporations
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
