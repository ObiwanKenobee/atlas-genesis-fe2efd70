import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Brain, Globe, Vote, Zap, TreePine, Droplets, 
  BarChart3, TrendingUp, Users, Award 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

// NON-CRITICAL: AI Dashboard Enhancement
export function AIEnhancedDashboard() {
  const [aiInsights, setAiInsights] = useState([
    {
      type: 'optimization',
      priority: 'high',
      action: 'Implement cover cropping in degraded areas',
      expectedImpact: 0.25,
      confidence: 0.85
    }
  ]);

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span>AI Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {aiInsights.map((insight, index) => (
            <div key={index} className="p-4 bg-slate-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {insight.priority} priority
                </Badge>
                <span className="text-green-400">+{(insight.expectedImpact * 100).toFixed(0)}%</span>
              </div>
              <h4 className="font-semibold text-white mb-2">{insight.action}</h4>
              <p className="text-sm text-slate-400">
                Confidence: {(insight.confidence * 100).toFixed(0)}%
              </p>
              <Button size="sm" className="mt-2 bg-emerald-600 hover:bg-emerald-700">
                Implement
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// NON-CRITICAL: Blockchain Integration
export function BlockchainIntegration() {
  const [connected, setConnected] = useState(false);
  const [tokens, setTokens] = useState([]);

  const connectWallet = () => {
    setConnected(true);
    setTokens([
      { id: 'ct_001', credits: 100, project: 'Forest Restoration', retired: false }
    ]);
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span>Web3 Integration</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!connected ? (
          <Button onClick={connectWallet} className="w-full bg-blue-600 hover:bg-blue-700">
            Connect Wallet
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-green-400">✓ Wallet Connected</p>
            {tokens.map((token: any) => (
              <div key={token.id} className="p-3 bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{token.credits} Credits</p>
                    <p className="text-sm text-slate-400">{token.project}</p>
                  </div>
                  <Badge variant={token.retired ? "outline" : "default"}>
                    {token.retired ? 'Retired' : 'Active'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// NON-CRITICAL: DAO Governance
export function DAOGovernance() {
  const [proposals] = useState([
    {
      id: 'prop_1',
      title: 'Fund Mangrove Restoration',
      description: 'Allocate $500K for 200 hectares',
      yesVotes: 1250,
      noVotes: 340,
      status: 'active'
    }
  ]);

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Vote className="w-5 h-5 text-purple-400" />
          <span>DAO Governance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="p-4 bg-slate-800 rounded-lg">
              <h4 className="font-semibold text-white mb-2">{proposal.title}</h4>
              <p className="text-sm text-slate-400 mb-3">{proposal.description}</p>
              <div className="flex items-center justify-between mb-3">
                <div className="flex space-x-4">
                  <span className="text-green-400">Yes: {proposal.yesVotes}</span>
                  <span className="text-red-400">No: {proposal.noVotes}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Vote Yes
                </Button>
                <Button size="sm" variant="outline" className="border-red-500 text-red-500">
                  Vote No
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// NON-CRITICAL: Advanced Analytics
export function AdvancedAnalytics() {
  const [data] = useState([
    { month: 'Jan', credits: 100, impact: 120 },
    { month: 'Feb', credits: 150, impact: 180 },
    { month: 'Mar', credits: 200, impact: 240 },
    { month: 'Apr', credits: 180, impact: 220 }
  ]);

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <span>Advanced Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Line type="monotone" dataKey="credits" stroke="#10B981" strokeWidth={2} />
            <Line type="monotone" dataKey="impact" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// NON-CRITICAL: Ecosystem Monitoring
export function EcosystemMonitoring() {
  const [metrics] = useState({
    soilHealth: 0.72,
    waterQuality: 0.68,
    airPurity: 0.85,
    biodiversity: 0.63
  });

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Globe className="w-5 h-5 text-green-400" />
          <span>Ecosystem Health</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: TreePine, label: 'Soil Health', value: metrics.soilHealth, color: 'text-green-500' },
            { icon: Droplets, label: 'Water Quality', value: metrics.waterQuality, color: 'text-blue-500' },
            { icon: TrendingUp, label: 'Air Purity', value: metrics.airPurity, color: 'text-purple-500' },
            { icon: Award, label: 'Biodiversity', value: metrics.biodiversity, color: 'text-yellow-500' }
          ].map((metric) => (
            <div key={metric.label} className="text-center">
              <metric.icon className={`w-6 h-6 mx-auto mb-2 ${metric.color}`} />
              <div className={`text-lg font-bold ${metric.color}`}>
                {(metric.value * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-slate-400">{metric.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// NON-CRITICAL: Enhanced Navigation
export function EnhancedNavigation() {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="bg-slate-800 border-slate-700">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="ai">AI Insights</TabsTrigger>
        <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
        <TabsTrigger value="dao">Governance</TabsTrigger>
        <TabsTrigger value="ecosystem">Ecosystem</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <AdvancedAnalytics />
      </TabsContent>
      
      <TabsContent value="ai">
        <AIEnhancedDashboard />
      </TabsContent>
      
      <TabsContent value="blockchain">
        <BlockchainIntegration />
      </TabsContent>
      
      <TabsContent value="dao">
        <DAOGovernance />
      </TabsContent>
      
      <TabsContent value="ecosystem">
        <EcosystemMonitoring />
      </TabsContent>
    </Tabs>
  );
}