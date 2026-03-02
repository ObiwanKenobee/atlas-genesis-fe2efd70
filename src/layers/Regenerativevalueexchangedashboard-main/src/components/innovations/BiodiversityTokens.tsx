import { useState } from 'react';
import { Sparkles, TrendingUp, Shield, Users, MapPin, Camera, BarChart3 } from 'lucide-react';

interface SpeciesToken {
  id: string;
  species: string;
  scientificName: string;
  status: 'critically_endangered' | 'endangered' | 'vulnerable' | 'near_threatened';
  region: string;
  population: number;
  tokenPrice: number;
  change24h: number;
  holders: number;
  conservationProjects: number;
  emoji: string;
}

export function BiodiversityTokens() {
  const [selectedToken, setSelectedToken] = useState<SpeciesToken | null>(null);

  const tokens: SpeciesToken[] = [
    {
      id: 'PAND',
      species: 'Giant Panda',
      scientificName: 'Ailuropoda melanoleuca',
      status: 'vulnerable',
      region: 'China',
      population: 1864,
      tokenPrice: 287.43,
      change24h: 5.2,
      holders: 1247,
      conservationProjects: 12,
      emoji: '🐼'
    },
    {
      id: 'ORCA',
      species: 'Orca (Southern Resident)',
      scientificName: 'Orcinus orca',
      status: 'endangered',
      region: 'Pacific Northwest',
      population: 73,
      tokenPrice: 512.89,
      change24h: -2.1,
      holders: 892,
      conservationProjects: 8,
      emoji: '🐋'
    },
    {
      id: 'RHNO',
      species: 'Javan Rhino',
      scientificName: 'Rhinoceros sondaicus',
      status: 'critically_endangered',
      region: 'Indonesia',
      population: 76,
      tokenPrice: 1247.56,
      change24h: 8.7,
      holders: 634,
      conservationProjects: 5,
      emoji: '🦏'
    },
    {
      id: 'ORAN',
      species: 'Bornean Orangutan',
      scientificName: 'Pongo pygmaeus',
      status: 'critically_endangered',
      region: 'Borneo',
      population: 104700,
      tokenPrice: 423.12,
      change24h: 3.4,
      holders: 1523,
      conservationProjects: 18,
      emoji: '🦧'
    },
    {
      id: 'TIGR',
      species: 'Bengal Tiger',
      scientificName: 'Panthera tigris tigris',
      status: 'endangered',
      region: 'India, Bangladesh',
      population: 2967,
      tokenPrice: 678.94,
      change24h: 6.1,
      holders: 2134,
      conservationProjects: 23,
      emoji: '🐅'
    },
    {
      id: 'HAWK',
      species: 'Philippine Eagle',
      scientificName: 'Pithecophaga jefferyi',
      status: 'critically_endangered',
      region: 'Philippines',
      population: 400,
      tokenPrice: 892.34,
      change24h: 4.8,
      holders: 567,
      conservationProjects: 7,
      emoji: '🦅'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critically_endangered': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
      case 'endangered': return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' };
      case 'vulnerable': return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' };
      case 'near_threatened': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
      default: return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const totalMarketCap = tokens.reduce((sum, token) => sum + (token.tokenPrice * token.population), 0);
  const totalHolders = tokens.reduce((sum, token) => sum + token.holders, 0);
  const totalProjects = tokens.reduce((sum, token) => sum + token.conservationProjects, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white">Biodiversity Token Exchange</h2>
            <p className="text-emerald-300/80">Species-specific conservation credits linked to real population outcomes</p>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="text-emerald-300/70 text-sm mb-2">Total Market Cap</div>
          <div className="text-white mb-1">${(totalMarketCap / 1000000).toFixed(2)}M</div>
          <div className="flex items-center gap-1 text-emerald-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+8.3%</span>
          </div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="text-emerald-300/70 text-sm mb-2">Species Tracked</div>
          <div className="text-white mb-1">{tokens.length}</div>
          <div className="text-emerald-400 text-sm">6 ecosystems</div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="text-emerald-300/70 text-sm mb-2">Total Holders</div>
          <div className="text-white mb-1">{totalHolders.toLocaleString()}</div>
          <div className="text-emerald-400 text-sm">Active investors</div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="text-emerald-300/70 text-sm mb-2">Conservation Projects</div>
          <div className="text-white mb-1">{totalProjects}</div>
          <div className="text-emerald-400 text-sm">Active globally</div>
        </div>
      </div>

      {/* Species Token Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens.map((token) => {
          const statusColors = getStatusColor(token.status);
          
          return (
            <button
              key={token.id}
              onClick={() => setSelectedToken(token)}
              className={`bg-black/30 backdrop-blur-sm border rounded-xl p-6 text-left transition-all hover:border-emerald-500/40 ${
                selectedToken?.id === token.id ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-emerald-500/20'
              }`}
            >
              {/* Species Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{token.emoji}</div>
                  <div>
                    <div className="text-white mb-1">{token.species}</div>
                    <div className="text-emerald-300/70 text-sm">{token.id}</div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${statusColors.bg} ${statusColors.text}`}>
                  {formatStatus(token.status).split(' ')[0]}
                </div>
              </div>

              {/* Scientific Name */}
              <div className="text-emerald-300/70 text-sm italic mb-4">{token.scientificName}</div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-emerald-300/70 text-xs mb-1">Population</div>
                  <div className="text-white">{token.population.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs mb-1">Region</div>
                  <div className="text-white text-sm">{token.region}</div>
                </div>
              </div>

              {/* Price & Change */}
              <div className="flex items-center justify-between pt-4 border-t border-emerald-500/20">
                <div>
                  <div className="text-emerald-300/70 text-xs mb-1">Token Price</div>
                  <div className="text-white">${token.tokenPrice}</div>
                </div>
                <div className={`flex items-center gap-1 ${token.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  <TrendingUp className={`w-4 h-4 ${token.change24h < 0 ? 'rotate-180' : ''}`} />
                  <span className="text-sm">{Math.abs(token.change24h)}%</span>
                </div>
              </div>

              {/* Holders & Projects */}
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300/70 text-sm">{token.holders} holders</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300/70 text-sm">{token.conservationProjects} projects</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Token Details */}
      {selectedToken && (
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{selectedToken.emoji}</div>
              <div>
                <h3 className="text-white mb-1">{selectedToken.species}</h3>
                <div className="text-emerald-300/70 text-sm italic mb-2">{selectedToken.scientificName}</div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300/70 text-sm">{selectedToken.region}</span>
                </div>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg ${getStatusColor(selectedToken.status).bg} ${getStatusColor(selectedToken.status).border} border`}>
              <div className={`${getStatusColor(selectedToken.status).text}`}>
                {formatStatus(selectedToken.status)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-emerald-900/20 rounded-lg p-4">
              <div className="text-emerald-300/70 text-sm mb-2">Wild Population</div>
              <div className="text-white mb-2">{selectedToken.population.toLocaleString()}</div>
              <div className="text-emerald-400 text-sm">Verified by WWF & IUCN</div>
            </div>
            <div className="bg-emerald-900/20 rounded-lg p-4">
              <div className="text-emerald-300/70 text-sm mb-2">Token Economics</div>
              <div className="text-white mb-2">${selectedToken.tokenPrice}</div>
              <div className="text-emerald-400 text-sm">Per unit • Market-determined</div>
            </div>
            <div className="bg-emerald-900/20 rounded-lg p-4">
              <div className="text-emerald-300/70 text-sm mb-2">Conservation Impact</div>
              <div className="text-white mb-2">{selectedToken.conservationProjects} Projects</div>
              <div className="text-emerald-400 text-sm">Active interventions</div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mb-6">
            <h4 className="text-white mb-4">How Biodiversity Tokens Work</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Camera className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-white text-sm mb-2">1. Real-Time Tracking</div>
                <div className="text-emerald-300/70 text-sm">
                  Population data verified through camera traps, satellite monitoring, and field surveys
                </div>
              </div>
              <div>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-white text-sm mb-2">2. Conservation Funding</div>
                <div className="text-emerald-300/70 text-sm">
                  Token purchases directly fund habitat protection, anti-poaching, and breeding programs
                </div>
              </div>
              <div>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-white text-sm mb-2">3. Value Appreciation</div>
                <div className="text-emerald-300/70 text-sm">
                  Token value increases as population grows, rewarding early conservation investors
                </div>
              </div>
            </div>
          </div>

          {/* Trading Actions */}
          <div className="flex items-center gap-4">
            <button className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all">
              Buy {selectedToken.id} Tokens
            </button>
            <button className="flex-1 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all border border-emerald-500/30">
              View Conservation Projects
            </button>
            <button className="px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-all border border-purple-500/30">
              <Users className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Impact Metrics */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">Ecosystem Impact Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-300/70 text-sm mb-2">Habitat Protected</div>
            <div className="text-white">2.4M hectares</div>
          </div>
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-300/70 text-sm mb-2">Species Recovery Rate</div>
            <div className="text-emerald-400">+5.8% annually</div>
          </div>
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-300/70 text-sm mb-2">Communities Engaged</div>
            <div className="text-white">847</div>
          </div>
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-300/70 text-sm mb-2">Conservation Funding</div>
            <div className="text-white">${(totalMarketCap * 0.1 / 1000000).toFixed(1)}M</div>
          </div>
        </div>
      </div>

      {/* Educational Note */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-blue-400 mb-2">Revolutionary Conservation Finance</h4>
            <p className="text-emerald-300/80 text-sm mb-3">
              Biodiversity Tokens represent a paradigm shift in conservation funding. Unlike traditional donations, 
              these tokens create a direct financial incentive aligned with species recovery. As populations grow 
              through successful conservation, token holders benefit, creating sustainable long-term funding for 
              endangered species protection.
            </p>
            <p className="text-emerald-300/80 text-sm">
              All population data is verified by partner organizations including WWF, IUCN, and regional conservation 
              agencies, with real-time updates from camera trap networks, GPS collars, and satellite monitoring systems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
