import { useState } from 'react';
import { BookOpen, Globe, Users, Lock, Unlock, Award, Search, Shield } from 'lucide-react';

interface KnowledgeNode {
  id: string;
  title: string;
  category: 'medicinal' | 'agricultural' | 'ecological' | 'spiritual' | 'craft';
  community: string;
  region: string;
  accessLevel: 'public' | 'restricted' | 'sacred';
  verifiers: number;
  relatedNodes: string[];
  impact: string;
}

export function TraditionalKnowledgeGraph() {
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const knowledgeNodes: KnowledgeNode[] = [
    {
      id: 'TK-001',
      title: 'Forest Regeneration Through Sacred Groves',
      category: 'ecological',
      community: 'Khasi People',
      region: 'Meghalaya, India',
      accessLevel: 'public',
      verifiers: 47,
      relatedNodes: ['TK-003', 'TK-012'],
      impact: 'Preserved 1,200+ hectares of pristine forest ecosystem'
    },
    {
      id: 'TK-002',
      title: 'Medicinal Plant Cultivation Cycles',
      category: 'medicinal',
      community: 'Shipibo-Konibo',
      region: 'Amazon Basin, Peru',
      accessLevel: 'restricted',
      verifiers: 23,
      relatedNodes: ['TK-005', 'TK-008'],
      impact: 'Documented 200+ medicinal species with sustainable harvest protocols'
    },
    {
      id: 'TK-003',
      title: 'Water Conservation Through Ancient Channels',
      category: 'ecological',
      community: 'Berber Communities',
      region: 'Atlas Mountains, Morocco',
      accessLevel: 'public',
      verifiers: 34,
      relatedNodes: ['TK-001', 'TK-006'],
      impact: 'Sustained agriculture in arid regions for 2,000+ years'
    },
    {
      id: 'TK-004',
      title: 'Sacred Fire Management Practices',
      category: 'spiritual',
      community: 'Aboriginal Australians',
      region: 'Northern Territory, Australia',
      accessLevel: 'sacred',
      verifiers: 12,
      relatedNodes: ['TK-009'],
      impact: 'Reduced wildfire intensity by 40%, increased biodiversity'
    },
    {
      id: 'TK-005',
      title: 'Three Sisters Agricultural System',
      category: 'agricultural',
      community: 'Haudenosaunee (Iroquois)',
      region: 'Northeast North America',
      accessLevel: 'public',
      verifiers: 56,
      relatedNodes: ['TK-002', 'TK-011'],
      impact: 'Sustainable polyculture producing 30% more yield than monoculture'
    },
    {
      id: 'TK-006',
      title: 'Traditional Weaving & Natural Dyes',
      category: 'craft',
      community: 'Mapuche People',
      region: 'Patagonia, Chile & Argentina',
      accessLevel: 'public',
      verifiers: 29,
      relatedNodes: ['TK-003'],
      impact: 'Zero-waste textile production using 100% natural materials'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medicinal': return { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: '💊' };
      case 'agricultural': return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: '🌾' };
      case 'ecological': return { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: '🌍' };
      case 'spiritual': return { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: '✨' };
      case 'craft': return { bg: 'bg-pink-500/20', text: 'text-pink-400', icon: '🎨' };
      default: return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: '📚' };
    }
  };

  const getAccessIcon = (level: string) => {
    switch (level) {
      case 'public': return Unlock;
      case 'restricted': return Shield;
      case 'sacred': return Lock;
      default: return Lock;
    }
  };

  const getAccessColor = (level: string) => {
    switch (level) {
      case 'public': return 'text-emerald-400';
      case 'restricted': return 'text-amber-400';
      case 'sacred': return 'text-red-400';
      default: return 'text-emerald-400';
    }
  };

  const filteredNodes = knowledgeNodes.filter(node =>
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.community.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 backdrop-blur-sm border border-amber-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white">Traditional Knowledge Graph</h2>
            <p className="text-emerald-300/80">Preserving and honoring indigenous wisdom with consent-based sharing</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="text-emerald-300/70 text-sm mb-2">Knowledge Nodes</div>
          <div className="text-white mb-1">{knowledgeNodes.length * 42}</div>
          <div className="text-emerald-400 text-sm">Documented systems</div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="text-emerald-300/70 text-sm mb-2">Indigenous Communities</div>
          <div className="text-white mb-1">847</div>
          <div className="text-emerald-400 text-sm">Participating globally</div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="text-emerald-300/70 text-sm mb-2">Languages Preserved</div>
          <div className="text-white mb-1">234</div>
          <div className="text-emerald-400 text-sm">Active documentation</div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="text-emerald-300/70 text-sm mb-2">Community Verifiers</div>
          <div className="text-white mb-1">3,421</div>
          <div className="text-emerald-400 text-sm">Trusted knowledge keepers</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400/50" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search traditional knowledge by topic, community, or region..."
            className="w-full bg-emerald-900/20 border border-emerald-500/20 rounded-lg pl-12 pr-4 py-4 text-white placeholder:text-emerald-300/30 focus:outline-none focus:border-emerald-500/40"
          />
        </div>
      </div>

      {/* Knowledge Categories */}
      <div className="flex gap-3 flex-wrap">
        {['all', 'medicinal', 'agricultural', 'ecological', 'spiritual', 'craft'].map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-lg transition-all ${
              cat === 'all'
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
            }`}
          >
            {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Knowledge Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNodes.map((node) => {
          const categoryColors = getCategoryColor(node.category);
          const AccessIcon = getAccessIcon(node.accessLevel);
          const accessColor = getAccessColor(node.accessLevel);
          
          return (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`bg-black/30 backdrop-blur-sm border rounded-xl p-6 text-left transition-all hover:border-emerald-500/40 ${
                selectedNode?.id === node.id ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-emerald-500/20'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{categoryColors.icon}</div>
                  <div>
                    <div className="text-white mb-1">{node.title}</div>
                    <div className="text-emerald-300/70 text-sm">{node.id}</div>
                  </div>
                </div>
                <AccessIcon className={`w-5 h-5 ${accessColor}`} />
              </div>

              {/* Community & Region */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300/70 text-sm">{node.community}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300/70 text-sm">{node.region}</span>
                </div>
              </div>

              {/* Category & Access */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`px-3 py-1 rounded-full text-xs ${categoryColors.bg} ${categoryColors.text}`}>
                  {node.category}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs ${
                  node.accessLevel === 'public' ? 'bg-emerald-500/20 text-emerald-400' :
                  node.accessLevel === 'restricted' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {node.accessLevel}
                </div>
              </div>

              {/* Impact */}
              <div className="bg-emerald-900/20 rounded-lg p-3 mb-4">
                <div className="text-emerald-300/70 text-xs mb-1">Documented Impact</div>
                <div className="text-emerald-400 text-sm">{node.impact}</div>
              </div>

              {/* Verifiers & Connections */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-emerald-300/70">{node.verifiers} verifiers</span>
                </div>
                <div className="text-emerald-300/70">{node.relatedNodes.length} connections</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-white mb-2">{selectedNode.title}</h3>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300/70 text-sm">{selectedNode.community}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300/70 text-sm">{selectedNode.region}</span>
                </div>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg ${
              selectedNode.accessLevel === 'public' ? 'bg-emerald-500/20 border border-emerald-500/30' :
              selectedNode.accessLevel === 'restricted' ? 'bg-amber-500/20 border border-amber-500/30' :
              'bg-red-500/20 border border-red-500/30'
            }`}>
              <div className="flex items-center gap-2">
                {(() => {
                  const AccessIcon = getAccessIcon(selectedNode.accessLevel);
                  return <AccessIcon className={`w-4 h-4 ${getAccessColor(selectedNode.accessLevel)}`} />;
                })()}
                <span className={getAccessColor(selectedNode.accessLevel)}>
                  {selectedNode.accessLevel.charAt(0).toUpperCase() + selectedNode.accessLevel.slice(1)} Access
                </span>
              </div>
            </div>
          </div>

          {/* Access Level Explanation */}
          <div className={`rounded-lg p-4 mb-6 ${
            selectedNode.accessLevel === 'public' ? 'bg-emerald-900/20 border border-emerald-500/20' :
            selectedNode.accessLevel === 'restricted' ? 'bg-amber-900/20 border border-amber-500/20' :
            'bg-red-900/20 border border-red-500/20'
          }`}>
            <h4 className={`mb-2 ${
              selectedNode.accessLevel === 'public' ? 'text-emerald-400' :
              selectedNode.accessLevel === 'restricted' ? 'text-amber-400' :
              'text-red-400'
            }`}>
              Access Protocol
            </h4>
            <p className="text-emerald-300/80 text-sm">
              {selectedNode.accessLevel === 'public' 
                ? 'This knowledge has been shared openly by the community for educational and research purposes. Full documentation is available to all users.'
                : selectedNode.accessLevel === 'restricted'
                ? 'This knowledge requires permission from community elders before access. Researchers and practitioners must submit formal requests explaining intended use.'
                : 'This knowledge is sacred and not available for external sharing. Only community members and authorized spiritual practitioners may access this information.'
              }
            </p>
          </div>

          {/* Impact & Verification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-emerald-900/20 rounded-lg p-4">
              <h4 className="text-white mb-3">Documented Impact</h4>
              <p className="text-emerald-400 text-sm mb-4">{selectedNode.impact}</p>
              <div className="flex items-center gap-2 text-emerald-300/70 text-sm">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Verified by {selectedNode.verifiers} community knowledge keepers</span>
              </div>
            </div>

            <div className="bg-emerald-900/20 rounded-lg p-4">
              <h4 className="text-white mb-3">Related Knowledge Systems</h4>
              <div className="space-y-2">
                {selectedNode.relatedNodes.map((relatedId) => {
                  const related = knowledgeNodes.find(n => n.id === relatedId);
                  return related ? (
                    <div key={relatedId} className="flex items-center justify-between text-sm p-2 bg-emerald-900/30 rounded">
                      <span className="text-emerald-300/70">{related.title}</span>
                      <span className="text-emerald-400">{related.id}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {selectedNode.accessLevel === 'public' && (
              <>
                <button className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all">
                  View Full Documentation
                </button>
                <button className="flex-1 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all border border-emerald-500/30">
                  Contact Community
                </button>
              </>
            )}
            {selectedNode.accessLevel === 'restricted' && (
              <button className="flex-1 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-all border border-amber-500/30">
                Request Access from Community Elders
              </button>
            )}
            {selectedNode.accessLevel === 'sacred' && (
              <div className="flex-1 text-center py-3 text-red-400 bg-red-500/10 rounded-lg border border-red-500/30">
                This knowledge is protected and not available for external access
              </div>
            )}
          </div>
        </div>
      )}

      {/* Principles */}
      <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
        <h3 className="text-white mb-4">Guiding Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="text-white mb-2">Community Sovereignty</h4>
            <p className="text-emerald-300/70 text-sm">
              Indigenous communities retain full ownership and control over their traditional knowledge. 
              They decide what is shared, with whom, and under what conditions.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="text-white mb-2">Fair Compensation</h4>
            <p className="text-emerald-300/70 text-sm">
              When knowledge is accessed for commercial purposes, communities receive direct financial 
              benefit through RVE's automated smart contract royalty system.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="text-white mb-2">Cultural Preservation</h4>
            <p className="text-emerald-300/70 text-sm">
              Documentation preserves knowledge for future generations while respecting cultural protocols 
              and ensuring transmission through traditional knowledge keepers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
