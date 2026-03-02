import { MapPin, Users, Building, Leaf, Award, TrendingUp } from 'lucide-react';

const custodians = [
  {
    id: 1,
    name: 'Amazon Conservation Collective',
    type: 'Community Cooperative',
    location: 'Brazil',
    coordinates: { lat: -3.4653, lng: -62.2159 },
    assets: ['Forest Restoration', 'Carbon Sequestration'],
    projects: 142,
    value: '$234M',
    members: 2847,
  },
  {
    id: 2,
    name: 'Maasai Cultural Heritage Trust',
    type: 'Cultural Heritage Organization',
    location: 'Kenya',
    coordinates: { lat: -1.2864, lng: 36.8172 },
    assets: ['Cultural Preservation', 'Traditional Practices'],
    projects: 67,
    value: '$92M',
    members: 1234,
  },
  {
    id: 3,
    name: 'Great Barrier Reef Foundation',
    type: 'Conservation Group',
    location: 'Australia',
    coordinates: { lat: -18.2871, lng: 147.6992 },
    assets: ['Coral Restoration', 'Marine Biodiversity'],
    projects: 234,
    value: '$187M',
    members: 892,
  },
  {
    id: 4,
    name: 'Himalayan Watershed Alliance',
    type: 'Community Cooperative',
    location: 'Nepal',
    coordinates: { lat: 28.3949, lng: 84.1240 },
    assets: ['Watershed Protection', 'Glacier Monitoring'],
    projects: 89,
    value: '$156M',
    members: 1567,
  },
  {
    id: 5,
    name: 'Regenerative Capital Partners',
    type: 'Ethical Financial Institution',
    location: 'Netherlands',
    coordinates: { lat: 52.3676, lng: 4.9041 },
    assets: ['Impact Investment', 'ESG Integration'],
    projects: 423,
    value: '$1.2B',
    members: 234,
  },
  {
    id: 6,
    name: 'Quechua Language Revitalization Network',
    type: 'Cultural Heritage Organization',
    location: 'Peru',
    coordinates: { lat: -9.1900, lng: -75.0152 },
    assets: ['Language Preservation', 'Educational Programs'],
    projects: 34,
    value: '$43M',
    members: 4231,
  },
  {
    id: 7,
    name: 'Sahel Regenerative Agriculture Cooperative',
    type: 'Community Cooperative',
    location: 'Senegal',
    coordinates: { lat: 14.4974, lng: -14.4524 },
    assets: ['Soil Restoration', 'Agroforestry'],
    projects: 178,
    value: '$134M',
    members: 6782,
  },
  {
    id: 8,
    name: 'Pacific Island Cultural Trust',
    type: 'Cultural Heritage Organization',
    location: 'Fiji',
    coordinates: { lat: -17.7134, lng: 178.0650 },
    assets: ['Traditional Navigation', 'Cultural Practices'],
    projects: 56,
    value: '$67M',
    members: 892,
  },
];

const custodianTypes = [
  { type: 'Community Cooperative', count: 1847, color: 'emerald', icon: Users },
  { type: 'Conservation Groups', count: 892, color: 'green', icon: Leaf },
  { type: 'Ethical Financial Institutions', count: 234, color: 'blue', icon: Building },
  { type: 'Cultural Heritage Organizations', count: 448, color: 'amber', icon: Award },
];

export function CustodianNetwork() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
        <h2 className="text-white mb-2">Global Custodian Network</h2>
        <p className="text-emerald-300/80">
          Local and global guardians safeguarding natural and cultural assets — from community cooperatives 
          to conservation groups and ethical financial institutions.
        </p>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {custodianTypes.map((type, idx) => {
          const Icon = type.icon;
          return (
            <div key={idx} className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br from-${type.color}-500 to-${type.color}-600 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white">{type.count.toLocaleString()}</div>
                  <div className="text-emerald-300/70 text-sm">{type.type}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Visualization */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-6">Global Custodian Distribution</h3>
        <div className="relative bg-emerald-900/10 rounded-lg overflow-hidden" style={{ height: '400px' }}>
          {/* World Map Representation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              <svg viewBox="0 0 1000 500" className="w-full h-full opacity-20">
                <path
                  d="M 100 250 Q 150 150, 250 200 T 400 250 Q 500 300, 600 250 T 800 200 Q 850 150, 900 250"
                  stroke="#10b981"
                  strokeWidth="2"
                  fill="none"
                />
                <ellipse cx="500" cy="250" rx="400" ry="200" stroke="#10b981" strokeWidth="1" fill="none" />
                <line x1="100" y1="250" x2="900" y2="250" stroke="#10b981" strokeWidth="1" />
                <line x1="500" y1="50" x2="500" y2="450" stroke="#10b981" strokeWidth="1" />
              </svg>
              
              {/* Custodian Markers */}
              {custodians.map((custodian, idx) => {
                const x = ((custodian.coordinates.lng + 180) / 360) * 1000;
                const y = ((90 - custodian.coordinates.lat) / 180) * 500;
                
                return (
                  <div
                    key={idx}
                    className="absolute group cursor-pointer"
                    style={{
                      left: `${(x / 1000) * 100}%`,
                      top: `${(y / 500) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-emerald-300 animate-pulse"></div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-emerald-950 border border-emerald-500/50 rounded-lg p-3 whitespace-nowrap">
                        <div className="text-white text-sm mb-1">{custodian.name}</div>
                        <div className="text-emerald-300/70 text-xs">{custodian.location}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-4 text-center text-emerald-300/70 text-sm">
          3,421 custodians across 142 countries protecting and restoring our planet
        </div>
      </div>

      {/* Custodian Directory */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-6">Featured Custodians</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {custodians.map((custodian) => (
            <div key={custodian.id} className="bg-emerald-900/10 border border-emerald-500/10 rounded-lg p-6 hover:border-emerald-500/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-white mb-2">{custodian.name}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300/70 text-sm">{custodian.location}</span>
                  </div>
                  <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm inline-block">
                    {custodian.type}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white mb-1">{custodian.value}</div>
                  <div className="text-emerald-300/70 text-sm">Total Value</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-emerald-300/70 text-sm mb-2">Protected Assets</div>
                <div className="flex flex-wrap gap-2">
                  {custodian.assets.map((asset, idx) => (
                    <div key={idx} className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm">
                      {asset}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-500/10">
                <div>
                  <div className="text-emerald-300/70 text-sm mb-1">Active Projects</div>
                  <div className="text-white">{custodian.projects}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-sm mb-1">Members</div>
                  <div className="text-white">{custodian.members.toLocaleString()}</div>
                </div>
              </div>

              <button className="w-full mt-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg transition-colors">
                View Full Profile →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custodian Roles */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-6">How Custodians Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-900/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white">Community Cooperatives</h4>
            </div>
            <p className="text-emerald-300/70 text-sm">
              Local communities who have lived in harmony with ecosystems for generations now protect and restore 
              their lands while earning regenerative value credits. Their traditional knowledge guides restoration efforts.
            </p>
          </div>

          <div className="bg-emerald-900/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white">Conservation Groups</h4>
            </div>
            <p className="text-emerald-300/70 text-sm">
              Scientific organizations and environmental NGOs use cutting-edge monitoring technology to verify 
              ecosystem restoration, ensuring that every credit represents real, measurable regeneration.
            </p>
          </div>

          <div className="bg-emerald-900/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white">Ethical Financial Institutions</h4>
            </div>
            <p className="text-emerald-300/70 text-sm">
              Banks and investment firms committed to regenerative finance provide capital, infrastructure, 
              and expertise to scale restoration projects while ensuring financial sustainability.
            </p>
          </div>

          <div className="bg-emerald-900/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white">Cultural Heritage Organizations</h4>
            </div>
            <p className="text-emerald-300/70 text-sm">
              Groups dedicated to preserving languages, traditions, and indigenous governance systems document 
              and protect cultural assets, ensuring that human wisdom isn't lost to time.
            </p>
          </div>
        </div>
      </div>

      {/* Success Story */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-8">
        <h3 className="text-white mb-4">Custodian Success Story</h3>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-emerald-400 mb-2">Amazon Conservation Collective</h4>
            <p className="text-emerald-300/80 mb-4">
              In just 18 months, this cooperative of 142 indigenous communities has restored 47,000 hectares 
              of degraded rainforest, sequestered 12.4 million tons of CO₂, and protected 2,847 species.
            </p>
            <p className="text-emerald-300/80">
              By earning $234M in regenerative value credits, they've created sustainable livelihoods for their 
              members while healing one of Earth's most vital ecosystems. Their traditional forest management 
              practices, combined with modern verification technology, serve as a model for custodianship worldwide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
