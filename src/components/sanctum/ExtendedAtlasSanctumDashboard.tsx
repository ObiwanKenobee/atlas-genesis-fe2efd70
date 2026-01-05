import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Rocket, Brain, Globe, Zap, Star, Infinity } from 'lucide-react';

const ExtendedAtlasSanctumDashboard = () => {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [isEvolutionActive, setIsEvolutionActive] = useState(false);

  const phases = [
    {
      id: 1,
      title: "Living Foundations",
      icon: <Globe className="h-6 w-6" />,
      description: "Bioregional substrate with community partnerships",
      status: "Complete",
      color: "text-green-600"
    },
    {
      id: 2,
      title: "Planetary Integration", 
      icon: <Brain className="h-6 w-6" />,
      description: "Global scaling with AI systems",
      status: "Active",
      color: "text-blue-600"
    },
    {
      id: 3,
      title: "Civilizational Emergence",
      icon: <Zap className="h-6 w-6" />,
      description: "Autonomous bioregional economies",
      status: "Pending",
      color: "text-purple-600"
    },
    {
      id: 4,
      title: "Interplanetary Expansion",
      icon: <Rocket className="h-6 w-6" />,
      description: "Lunar outposts and Mars settlements",
      status: "Future",
      color: "text-orange-600"
    },
    {
      id: 5,
      title: "Consciousness Integration",
      icon: <Brain className="h-6 w-6" />,
      description: "Human-AI symbiosis and planetary mind",
      status: "Future",
      color: "text-indigo-600"
    },
    {
      id: 6,
      title: "Cosmic Regeneration",
      icon: <Star className="h-6 w-6" />,
      description: "Type III Regenerative Civilization",
      status: "Vision",
      color: "text-yellow-600"
    }
  ];

  const evolutionMetrics = {
    planetaryRegeneration: 89,
    interplanetaryHarmony: 0,
    consciousnessEvolution: 15,
    cosmicIntegration: 0,
    universalContribution: 5,
    eternalSustainability: 25
  };

  const startEvolution = async () => {
    setIsEvolutionActive(true);
    
    // Simulate phase progression
    for (let phase = 1; phase <= 6; phase++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentPhase(phase);
    }
    
    setIsEvolutionActive(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Extended Atlas Sanctum
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            6-Phase Civilizational Evolution System
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Current Phase: {currentPhase}
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {phases[currentPhase - 1]?.title}
            </Badge>
          </div>
        </div>

        {/* Phase Evolution Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Infinity className="h-6 w-6" />
              Civilizational Evolution Timeline
            </CardTitle>
            <CardDescription>
              From bioregional foundations to cosmic regenerative civilization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {phases.map((phase) => (
                <Card 
                  key={phase.id} 
                  className={`transition-all duration-300 ${
                    phase.id <= currentPhase ? 'border-green-500 bg-green-50' : 
                    phase.id === currentPhase + 1 ? 'border-blue-500 bg-blue-50' : 
                    'opacity-60'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg bg-white ${phase.color}`}>
                        {phase.icon}
                      </div>
                      <Badge 
                        variant={
                          phase.id <= currentPhase ? "default" : 
                          phase.id === currentPhase + 1 ? "secondary" : 
                          "outline"
                        }
                      >
                        {phase.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">
                      Phase {phase.id}: {phase.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{phase.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evolution Metrics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Civilizational Evolution Metrics</CardTitle>
            <CardDescription>Progress across all evolutionary dimensions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Object.entries(evolutionMetrics).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {value}%
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Evolution Control
            </CardTitle>
            <CardDescription>
              Initiate the complete 6-phase civilizational evolution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={startEvolution}
                disabled={isEvolutionActive}
                className="flex items-center gap-2"
                size="lg"
              >
                {isEvolutionActive ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Evolving...
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4" />
                    Begin Complete Evolution
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setCurrentPhase(1)}
                disabled={isEvolutionActive}
              >
                Reset to Phase 1
              </Button>
            </div>
            
            {isEvolutionActive && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">
                  🌌 Civilizational evolution in progress...
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  Transitioning through all phases toward cosmic regenerative civilization
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExtendedAtlasSanctumDashboard;