import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Shield, Brain, Users, Globe, Leaf, Zap } from 'lucide-react';

// Fallback implementation for missing RegenerativeInnovationHub
const mockRegenerativeHub = {
  async initializeRegenerativeSystem() {
    return {
      quantumSecurity: true,
      aiIntelligence: true,
      dataSovereignty: true,
      planetaryTwin: true,
      multiSpeciesGov: true,
      overallHealth: 95
    };
  },
  async getSystemDashboard() {
    return {
      activeActions: Math.round(Math.random() * 50 + 25),
      totalCarbonSequestered: Math.round(Math.random() * 10000 + 5000),
      communitiesEmpowered: Math.round(Math.random() * 200 + 100),
      speciesProtected: Math.round(Math.random() * 500 + 250),
      quantumRecords: Math.round(Math.random() * 1000 + 500),
      systemHealth: 95 + Math.round(Math.random() * 5)
    };
  },
  async proposeRegenerativeAction() {
    return { id: `action_${Date.now()}` };
  },
  async approveRegenerativeAction() {
    return Math.random() > 0.2;
  },
  async executeRegenerativeAction() {
    return {
      success: true,
      carbonSequestered: Math.round(Math.random() * 100 + 50),
      biodiversityIncrease: Math.round(Math.random() * 30 + 20),
      communityBenefit: Math.round(Math.random() * 50000 + 25000),
      quantumVerified: true
    };
  }
};

const InnovationDashboard = () => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  useEffect(() => {
    initializeSystems();
  }, []);

  const initializeSystems = async () => {
    const status = await mockRegenerativeHub.initializeRegenerativeSystem();
    const dashboardData = await mockRegenerativeHub.getSystemDashboard();
    setSystemStatus(status);
    setDashboard(dashboardData);
  };

  const runDemo = async (demoType: string) => {
    setActiveDemo(demoType);
    
    if (demoType === 'regenerative_action') {
      const action = await mockRegenerativeHub.proposeRegenerativeAction();
      const approved = await mockRegenerativeHub.approveRegenerativeAction();
      
      if (approved) {
        await mockRegenerativeHub.executeRegenerativeAction();
      }
    }
    
    setActiveDemo(null);
    const newDashboard = await mockRegenerativeHub.getSystemDashboard();
    setDashboard(newDashboard);
  };

  const innovations = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Quantum Security",
      description: "100-year tamper-proof verification",
      status: systemStatus?.quantumSecurity,
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI Intelligence", 
      description: "Predictive ecosystem modeling",
      status: systemStatus?.aiIntelligence,
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Data Sovereignty",
      description: "Indigenous community control",
      status: systemStatus?.dataSovereignty,
      color: "bg-green-100 text-green-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Regenerative Innovation Systems
        </h1>
        <p className="text-lg text-gray-600">
          Next-generation technologies for planetary regeneration
        </p>
        {systemStatus && (
          <Badge variant="secondary" className="mt-2">
            System Health: {systemStatus.overallHealth}%
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {innovations.map((innovation, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${innovation.color}`}>
                  {innovation.icon}
                </div>
                <Badge variant={innovation.status ? "default" : "secondary"}>
                  {innovation.status ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardTitle className="text-lg">{innovation.title}</CardTitle>
              <CardDescription>{innovation.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {dashboard.activeActions}
              </div>
              <p className="text-sm text-gray-600">Regenerative projects running</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Carbon Sequestered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {dashboard.totalCarbonSequestered.toLocaleString()} tons
              </div>
              <p className="text-sm text-gray-600">Total CO₂ removed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Communities Empowered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {dashboard.communitiesEmpowered}
              </div>
              <p className="text-sm text-gray-600">Indigenous communities supported</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Innovation Demonstrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => runDemo('regenerative_action')}
            disabled={activeDemo === 'regenerative_action'}
            className="flex items-center gap-2"
          >
            {activeDemo === 'regenerative_action' ? (
              <>Processing...</>
            ) : (
              <>
                <Leaf className="h-4 w-4" />
                Run Regenerative Action
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InnovationDashboard;