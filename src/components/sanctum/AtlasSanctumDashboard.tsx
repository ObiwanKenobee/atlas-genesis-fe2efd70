import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Zap, 
  Users, 
  TreePine, 
  Shield, 
  Brain,
  Heart,
  Sprout,
  Network,
  Eye
} from 'lucide-react';

interface AtlasSanctumStatus {
  currentPhase: 1 | 2 | 3;
  phase1: {
    bioregionalNodesDeployed: number;
    communityPartnershipsEstablished: number;
    governanceCouncilsActive: number;
    regenerativeEconomicsInitialized: number;
  };
  phase2: {
    globalNetworkScale: number;
    aiSystemsDeployed: number;
    crossBioregionalExchangeActive: boolean;
    culturalPreservationSystems: number;
  };
  phase3: {
    autonomousBioregions: number;
    planetaryIntelligenceActive: boolean;
    multiGenerationalGovernance: boolean;
    technologicalSovereigntyAchieved: number;
  };
  overallProgress: {
    regenerativeImpact: number;
    communityEmpowerment: number;
    culturalPreservation: number;
  };
}

const AtlasSanctumDashboard: React.FC = () => {
  const [status, setStatus] = useState<AtlasSanctumStatus>({
    currentPhase: 1,
    phase1: {
      bioregionalNodesDeployed: 2,
      communityPartnershipsEstablished: 2,
      governanceCouncilsActive: 2,
      regenerativeEconomicsInitialized: 2
    },
    phase2: {
      globalNetworkScale: 0,
      aiSystemsDeployed: 0,
      crossBioregionalExchangeActive: false,
      culturalPreservationSystems: 0
    },
    phase3: {
      autonomousBioregions: 0,
      planetaryIntelligenceActive: false,
      multiGenerationalGovernance: false,
      technologicalSovereigntyAchieved: 0
    },
    overallProgress: {
      regenerativeImpact: 0.29,
      communityEmpowerment: 0.31,
      culturalPreservation: 0.33
    }
  });
  const [isInitializing, setIsInitializing] = useState(false);

  const initializeSystem = async () => {
    setIsInitializing(true);
    
    // Simulate phase progression
    for (let phase = 1; phase <= 3; phase++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus(prev => ({
        ...prev,
        currentPhase: phase as 1 | 2 | 3,
        phase2: phase >= 2 ? {
          globalNetworkScale: 100,
          aiSystemsDeployed: 4,
          crossBioregionalExchangeActive: true,
          culturalPreservationSystems: 45
        } : prev.phase2,
        phase3: phase >= 3 ? {
          autonomousBioregions: 75,
          planetaryIntelligenceActive: true,
          multiGenerationalGovernance: true,
          technologicalSovereigntyAchieved: 87
        } : prev.phase3,
        overallProgress: {
          regenerativeImpact: 0.89 * (phase / 3),
          communityEmpowerment: 0.92 * (phase / 3),
          culturalPreservation: 0.94 * (phase / 3)
        }
      }));
    }
    
    setIsInitializing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Atlas Sanctum</h1>
              <p className="text-muted-foreground mt-1">Civilizational Operating System for Planetary Regeneration</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  status.currentPhase === 3 ? 'bg-green-500' : 
                  status.currentPhase === 2 ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <span className="text-sm font-medium">Phase {status.currentPhase}/3</span>
              </div>
              <button 
                onClick={initializeSystem}
                disabled={isInitializing}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isInitializing ? (
                  <>
                    <Zap className="w-4 h-4 inline mr-2 animate-pulse" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Sprout className="w-4 h-4 inline mr-2" />
                    Initialize System
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Progress */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((phase) => (
              <div key={phase} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  status.currentPhase >= phase 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {phase}
                </div>
                <div className="ml-3">
                  <div className="font-medium text-foreground">
                    {phase === 1 && 'Living Foundations'}
                    {phase === 2 && 'Planetary Integration'}
                    {phase === 3 && 'Civilizational Emergence'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {phase === 1 && 'Bioregional substrate & community partnerships'}
                    {phase === 2 && 'Global scaling & AI integration'}
                    {phase === 3 && 'Autonomous systems & technological sovereignty'}
                  </div>
                </div>
                {phase < 3 && (
                  <div className={`w-16 h-1 mx-4 rounded-full ${
                    status.currentPhase > phase ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Regenerative Impact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border/50 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <TreePine className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-green-500">
                {(status.overallProgress.regenerativeImpact * 100).toFixed(1)}%
              </span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Regenerative Impact</h3>
            <p className="text-sm text-muted-foreground">
              Ecosystem restoration and carbon sequestration across bioregions
            </p>
          </motion.div>

          {/* Community Empowerment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border/50 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-blue-500">
                {(status.overallProgress.communityEmpowerment * 100).toFixed(1)}%
              </span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Community Empowerment</h3>
            <p className="text-sm text-muted-foreground">
              Local sovereignty and economic autonomy achievement
            </p>
          </motion.div>

          {/* Cultural Preservation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border/50 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold text-purple-500">
                {(status.overallProgress.culturalPreservation * 100).toFixed(1)}%
              </span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Cultural Preservation</h3>
            <p className="text-sm text-muted-foreground">
              Indigenous knowledge systems and cultural practices protected
            </p>
          </motion.div>
        </div>

        {/* Phase Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Phase 1: Living Foundations */}
          <div className="bg-card border border-border/50 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Sprout className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Phase 1: Living Foundations</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bioregional Nodes</span>
                <span className="font-medium">{status.phase1.bioregionalNodesDeployed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Community Partnerships</span>
                <span className="font-medium">{status.phase1.communityPartnershipsEstablished}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Governance Councils</span>
                <span className="font-medium">{status.phase1.governanceCouncilsActive}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Economic Primitives</span>
                <span className="font-medium">{status.phase1.regenerativeEconomicsInitialized}</span>
              </div>
            </div>
          </div>

          {/* Phase 2: Planetary Integration */}
          <div className="bg-card border border-border/50 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Globe className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Phase 2: Planetary Integration</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Global Network Scale</span>
                <span className="font-medium">{status.phase2.globalNetworkScale} nodes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">AI Systems</span>
                <span className="font-medium">{status.phase2.aiSystemsDeployed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cross-Bioregional Exchange</span>
                <span className="font-medium">{status.phase2.crossBioregionalExchangeActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cultural Systems</span>
                <span className="font-medium">{status.phase2.culturalPreservationSystems}</span>
              </div>
            </div>
          </div>

          {/* Phase 3: Civilizational Emergence */}
          <div className="bg-card border border-border/50 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Brain className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Phase 3: Civilizational Emergence</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Autonomous Bioregions</span>
                <span className="font-medium">{status.phase3.autonomousBioregions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Planetary Intelligence</span>
                <span className="font-medium">{status.phase3.planetaryIntelligenceActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Multi-Gen Governance</span>
                <span className="font-medium">{status.phase3.multiGenerationalGovernance ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tech Sovereignty</span>
                <span className="font-medium">{status.phase3.technologicalSovereigntyAchieved}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Vision */}
        <div className="mt-8 bg-card border border-border/50 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Eye className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">Civilizational Operating System Vision</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Atlas Sanctum operates as a living systems protocol where technology, economics, governance, and planetary stewardship co-evolve. 
            This is not software managing data, but a civilizational immune system strengthening the capacity of human and natural communities 
            to thrive together across generations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground">Regenerative by Design</h4>
                <p className="text-sm text-muted-foreground">Every protocol strengthens rather than extracts from communities and ecosystems</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Network className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground">Community Sovereign</h4>
                <p className="text-sm text-muted-foreground">Local communities maintain control over their data, resources, and decision-making</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtlasSanctumDashboard;