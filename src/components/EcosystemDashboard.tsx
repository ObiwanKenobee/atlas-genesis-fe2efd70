import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Leaf, Droplets, Wind, TreePine, TrendingUp, AlertTriangle,
  Zap, Target, Brain, Globe, Users, Vote
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
         BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface EcosystemMetrics {
  soilHealth: number;
  waterQuality: number;
  airPurity: number;
  biodiversityIndex: number;
  carbonSequestration: number;
  confidence: number;
}

interface AIRecommendation {
  id: string;
  type: 'optimization' | 'intervention' | 'monitoring';
  priority: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  expectedImpact: number;
  confidence: number;
  timeframe: string;
  cost: number;
}

export function EcosystemDashboard() {
  const [metrics, setMetrics] = useState<EcosystemMetrics>({
    soilHealth: 0.72,
    waterQuality: 0.68,
    airPurity: 0.85,
    biodiversityIndex: 0.63,
    carbonSequestration: 2.4,
    confidence: 0.82
  });

  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([
    {
      id: 'rec_1',
      type: 'intervention',
      priority: 'high',
      action: 'Implement cover cropping in degraded areas',
      expectedImpact: 0.25,
      confidence: 0.85,
      timeframe: '6-12 months',
      cost: 150
    },
    {
      id: 'rec_2',
      type: 'optimization',
      priority: 'medium',
      action: 'Install riparian buffers along waterways',
      expectedImpact: 0.18,
      confidence: 0.78,
      timeframe: '12-18 months',
      cost: 300
    }
  ]);

  const [trends] = useState([
    { date: '2024-01', soil: 0.65, water: 0.62, air: 0.80, biodiversity: 0.58 },
    { date: '2024-02', soil: 0.68, water: 0.64, air: 0.82, biodiversity: 0.60 },
    { date: '2024-03', soil: 0.70, water: 0.66, air: 0.83, biodiversity: 0.61 },
    { date: '2024-04', soil: 0.72, water: 0.68, air: 0.85, biodiversity: 0.63 }
  ]);

  const getMetricColor = (value: number) => {
    if (value >= 0.8) return 'text-green-500';
    if (value >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { icon: Leaf, label: 'Soil Health', value: metrics.soilHealth, unit: '' },
          { icon: Droplets, label: 'Water Quality', value: metrics.waterQuality, unit: '' },
          { icon: Wind, label: 'Air Purity', value: metrics.airPurity, unit: '' },
          { icon: TreePine, label: 'Biodiversity', value: metrics.biodiversityIndex, unit: '' },
          { icon: TrendingUp, label: 'Carbon Seq.', value: metrics.carbonSequestration, unit: 't/ha/yr' }
        ].map((metric) => (
          <Card key={metric.label} className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-700 rounded-lg">
                  <metric.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{metric.label}</p>
                  <p className={`text-lg font-bold ${getMetricColor(metric.value)}`}>
                    {metric.unit ? `${metric.value}${metric.unit}` : `${(metric.value * 100).toFixed(0)}%`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>AI Insights</span>
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Predictions</span>
          </TabsTrigger>
          <TabsTrigger value="dao" className="flex items-center space-x-2">
            <Vote className="w-4 h-4" />
            <span>DAO</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Trends Chart */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Ecosystem Health Trends</CardTitle>
              <CardDescription>30-day moving averages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="soil" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="water" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="air" stroke="#8B5CF6" strokeWidth={2} />
                  <Line type="monotone" dataKey="biodiversity" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* IoT Sensor Status */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>IoT Sensor Network</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { type: 'Soil Sensors', active: 24, total: 25, status: 'healthy' },
                  { type: 'Water Monitors', active: 12, total: 12, status: 'healthy' },
                  { type: 'Air Quality', active: 8, total: 10, status: 'warning' },
                  { type: 'Biodiversity', active: 6, total: 8, status: 'warning' }
                ].map((sensor) => (
                  <div key={sensor.type} className="p-3 bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-300">{sensor.type}</p>
                    <p className="text-lg font-bold text-white">{sensor.active}/{sensor.total}</p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        sensor.status === 'healthy' ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'
                      }`}
                    >
                      {sensor.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          {/* AI Recommendations */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span>AI-Powered Recommendations</span>
              </CardTitle>
              <CardDescription>Real-time optimization suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(rec.priority)}`} />
                        <Badge variant="outline" className="text-xs">
                          {rec.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.priority} priority
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Expected Impact</p>
                        <p className="text-lg font-bold text-green-400">+{(rec.expectedImpact * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                    <h4 className="font-semibold text-white mb-2">{rec.action}</h4>
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>Timeframe: {rec.timeframe}</span>
                      <span>Cost: ${rec.cost}/hectare</span>
                      <span>Confidence: {(rec.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        Implement
                      </Button>
                      <Button size="sm" variant="outline">
                        Learn More
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          {/* Predictive Models */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Impact Predictions</CardTitle>
              <CardDescription>AI-generated forecasts for different scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { 
                    scenario: 'Reforestation', 
                    hectares: 1000, 
                    carbon: 3200, 
                    biodiversity: 0.15,
                    confidence: 0.87
                  },
                  { 
                    scenario: 'Regenerative Agriculture', 
                    hectares: 5000, 
                    carbon: 9000, 
                    biodiversity: 0.08,
                    confidence: 0.82
                  },
                  { 
                    scenario: 'Wetland Restoration', 
                    hectares: 500, 
                    carbon: 1250, 
                    biodiversity: 0.22,
                    confidence: 0.79
                  }
                ].map((prediction) => (
                  <div key={prediction.scenario} className="p-4 bg-slate-800 rounded-lg">
                    <h4 className="font-semibold text-white mb-3">{prediction.scenario}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Area:</span>
                        <span className="text-white">{prediction.hectares.toLocaleString()} ha</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Carbon:</span>
                        <span className="text-green-400">{prediction.carbon.toLocaleString()} t CO₂</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Biodiversity:</span>
                        <span className="text-blue-400">+{(prediction.biodiversity * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Confidence:</span>
                        <span className="text-purple-400">{(prediction.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dao" className="space-y-6">
          {/* DAO Governance */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Community Governance</span>
              </CardTitle>
              <CardDescription>Decentralized decision-making for regenerative actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 'prop_1',
                    title: 'Allocate $500K for Mangrove Restoration',
                    description: 'Fund restoration of 200 hectares of mangrove forests in Southeast Asia',
                    yesVotes: 1250,
                    noVotes: 340,
                    status: 'active',
                    timeLeft: '3 days'
                  },
                  {
                    id: 'prop_2',
                    title: 'Implement New Soil Carbon Methodology',
                    description: 'Adopt enhanced measurement protocols for soil carbon verification',
                    yesVotes: 890,
                    noVotes: 120,
                    status: 'passed',
                    timeLeft: 'Ended'
                  }
                ].map((proposal) => (
                  <div key={proposal.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white">{proposal.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`${
                          proposal.status === 'active' ? 'border-blue-500 text-blue-500' : 'border-green-500 text-green-500'
                        }`}
                      >
                        {proposal.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{proposal.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex space-x-4">
                        <span className="text-green-400">Yes: {proposal.yesVotes.toLocaleString()}</span>
                        <span className="text-red-400">No: {proposal.noVotes.toLocaleString()}</span>
                      </div>
                      <span className="text-slate-400 text-sm">{proposal.timeLeft}</span>
                    </div>
                    {proposal.status === 'active' && (
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Vote Yes
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-500 text-red-500">
                          Vote No
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}