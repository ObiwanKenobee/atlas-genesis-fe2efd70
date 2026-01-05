import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Shield, Brain, Users, Globe, Leaf, Zap } from 'lucide-react';

// Simplified mock implementation that always works
const mockRegenerativeHub = {
  async initializeRegenerativeSystem() {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
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
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate loading
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
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate processing
    return { id: `action_${Date.now()}` };
  },
  async approveRegenerativeAction() {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate approval
    return Math.random() > 0.2;
  },
  async executeRegenerativeAction() {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate execution
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeSystems();
  }, []);

  const initializeSystems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const status = await mockRegenerativeHub.initializeRegenerativeSystem();
      const dashboardData = await mockRegenerativeHub.getSystemDashboard();
      setSystemStatus(status);
      setDashboard(dashboardData);
    } catch (err) {
      setError('Failed to initialize systems');
      console.error('Initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runDemo = async (demoType: string) => {
    try {
      setActiveDemo(demoType);
      
      if (demoType === 'regenerative_action') {
        const action = await mockRegenerativeHub.proposeRegenerativeAction();
        const approved = await mockRegenerativeHub.approveRegenerativeAction();
        
        if (approved) {
          await mockRegenerativeHub.executeRegenerativeAction();
        }
      }
      
      const newDashboard = await mockRegenerativeHub.getSystemDashboard();
      setDashboard(newDashboard);
    } catch (err) {
      setError('Demo execution failed');
      console.error('Demo error:', err);
    } finally {
      setActiveDemo(null);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
            <p className="text-lg font-medium">Initializing Innovation Systems...</p>
            <p className="text-sm text-gray-600">Please wait while we load the platform</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <CardContent className="text-center space-y-4">
            <p className="text-red-600 font-medium">System Error</p>
            <p className="text-gray-600">{error}</p>
            <Button onClick={initializeSystems} className="w-full">
              Retry Initialization
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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