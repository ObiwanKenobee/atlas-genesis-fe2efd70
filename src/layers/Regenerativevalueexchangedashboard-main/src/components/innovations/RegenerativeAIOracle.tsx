import { useState } from 'react';
import { Brain, Zap, TrendingUp, AlertTriangle, CheckCircle, Layers, Target, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface PredictionModel {
  id: string;
  name: string;
  type: 'carbon' | 'biodiversity' | 'water' | 'social';
  accuracy: number;
  predictions: number;
  status: 'active' | 'training' | 'calibrating';
}

export function RegenerativeAIOracle() {
  const [selectedModel, setSelectedModel] = useState<string>('carbon-seq-v3');

  const models: PredictionModel[] = [
    { id: 'carbon-seq-v3', name: 'Carbon Sequestration Predictor v3', type: 'carbon', accuracy: 94.7, predictions: 12847, status: 'active' },
    { id: 'bio-index-v2', name: 'Biodiversity Index Forecaster', type: 'biodiversity', accuracy: 91.3, predictions: 8234, status: 'active' },
    { id: 'water-quality-v4', name: 'Water Quality Predictor', type: 'water', accuracy: 96.2, predictions: 15632, status: 'active' },
    { id: 'community-impact-v1', name: 'Social Impact Analyzer', type: 'social', accuracy: 88.5, predictions: 6721, status: 'training' }
  ];

  const predictionData = [
    { month: 'Jan', actual: 145, predicted: 142, optimal: 150 },
    { month: 'Feb', actual: 152, predicted: 155, optimal: 160 },
    { month: 'Mar', actual: 168, predicted: 165, optimal: 170 },
    { month: 'Apr', actual: 178, predicted: 182, optimal: 185 },
    { month: 'May', actual: 195, predicted: 192, optimal: 200 },
    { month: 'Jun', actual: 0, predicted: 208, optimal: 215 },
    { month: 'Jul', actual: 0, predicted: 225, optimal: 230 },
  ];

  const radarData = [
    { factor: 'Soil Health', current: 78, predicted: 85, optimal: 95 },
    { factor: 'Tree Coverage', current: 82, predicted: 88, optimal: 92 },
    { factor: 'Water Quality', current: 71, predicted: 79, optimal: 90 },
    { factor: 'Biodiversity', current: 65, predicted: 74, optimal: 88 },
    { factor: 'Community Engagement', current: 88, predicted: 90, optimal: 95 },
  ];

  const optimizations = [
    {
      title: 'Increase Native Species Planting',
      impact: '+12% Biodiversity',
      confidence: 94,
      timeline: '6 months',
      cost: 'Low',
      priority: 'high'
    },
    {
      title: 'Implement Rotational Grazing',
      impact: '+8% Soil Carbon',
      confidence: 91,
      timeline: '3 months',
      cost: 'Medium',
      priority: 'high'
    },
    {
      title: 'Expand Riparian Buffer Zones',
      impact: '+15% Water Quality',
      confidence: 96,
      timeline: '4 months',
      cost: 'Medium',
      priority: 'medium'
    },
    {
      title: 'Deploy Additional IoT Sensors',
      impact: '+5% Accuracy',
      confidence: 88,
      timeline: '1 month',
      cost: 'Low',
      priority: 'low'
    }
  ];

  const aiInsights = [
    {
      type: 'warning',
      title: 'Drought Risk Detected',
      description: 'AI models predict 34% higher risk of drought stress in the northern zone over the next 90 days.',
      action: 'Recommend implementing water retention strategies immediately.',
      confidence: 89
    },
    {
      type: 'opportunity',
      title: 'Optimal Planting Window',
      description: 'Climate models indicate ideal conditions for native tree planting in 2-3 weeks.',
      action: 'Prepare seedlings and coordinate with community volunteers.',
      confidence: 92
    },
    {
      type: 'success',
      title: 'Carbon Target Exceeding Projections',
      description: 'Current sequestration rates are 18% above baseline predictions.',
      action: 'Document practices for replication in similar ecosystems.',
      confidence: 97
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white">Regenerative AI Oracle</h2>
            <p className="text-emerald-300/80">Predictive intelligence for optimizing ecological restoration outcomes</p>
          </div>
        </div>
      </div>

      {/* AI Models Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => setSelectedModel(model.id)}
            className={`bg-black/30 backdrop-blur-sm border rounded-xl p-6 text-left transition-all ${
              selectedModel === model.id
                ? 'border-purple-500/50 bg-purple-500/10'
                : 'border-emerald-500/20 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                model.status === 'active' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
              }`}>
                <Brain className={`w-5 h-5 ${
                  model.status === 'active' ? 'text-emerald-400' : 'text-amber-400'
                }`} />
              </div>
              <div className={`px-2 py-1 rounded-full text-xs ${
                model.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {model.status}
              </div>
            </div>
            <div className="text-white text-sm mb-2">{model.name}</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-emerald-300/70 text-xs">Accuracy</div>
                <div className="text-white">{model.accuracy}%</div>
              </div>
              <div>
                <div className="text-emerald-300/70 text-xs">Predictions</div>
                <div className="text-white">{model.predictions.toLocaleString()}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Prediction vs Actual Performance */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white">Prediction Accuracy & Future Forecasts</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-emerald-300/70 text-sm">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-emerald-300/70 text-sm">Predicted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-emerald-300/70 text-sm">Optimal</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={predictionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#10b981" opacity={0.1} />
            <XAxis dataKey="month" stroke="#6ee7b7" />
            <YAxis stroke="#6ee7b7" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#064e3b', 
                border: '1px solid #10b981',
                borderRadius: '8px',
                color: '#fff'
              }} 
            />
            <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="optimal" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Multi-Factor Radar Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <h3 className="text-white mb-6">Ecosystem Health Factors</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#10b981" opacity={0.2} />
              <PolarAngleAxis dataKey="factor" stroke="#6ee7b7" tick={{ fill: '#6ee7b7', fontSize: 12 }} />
              <PolarRadiusAxis stroke="#6ee7b7" />
              <Radar name="Current" dataKey="current" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Radar name="Predicted" dataKey="predicted" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
              <Radar name="Optimal" dataKey="optimal" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* AI-Recommended Optimizations */}
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <h3 className="text-white mb-4">AI-Recommended Optimizations</h3>
          <div className="space-y-3">
            {optimizations.map((opt, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${
                opt.priority === 'high' 
                  ? 'bg-purple-900/20 border-purple-500/30' 
                  : opt.priority === 'medium'
                  ? 'bg-emerald-900/20 border-emerald-500/20'
                  : 'bg-amber-900/20 border-amber-500/20'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-white mb-1">{opt.title}</div>
                    <div className="text-emerald-400 text-sm">{opt.impact}</div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    opt.priority === 'high'
                      ? 'bg-purple-500/20 text-purple-400'
                      : opt.priority === 'medium'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {opt.priority}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-emerald-300/70 mb-1">Confidence</div>
                    <div className="text-white">{opt.confidence}%</div>
                  </div>
                  <div>
                    <div className="text-emerald-300/70 mb-1">Timeline</div>
                    <div className="text-white">{opt.timeline}</div>
                  </div>
                  <div>
                    <div className="text-emerald-300/70 mb-1">Cost</div>
                    <div className="text-white">{opt.cost}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights & Alerts */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">Real-Time AI Insights</h3>
        <div className="space-y-4">
          {aiInsights.map((insight, idx) => {
            const Icon = insight.type === 'warning' ? AlertTriangle : insight.type === 'opportunity' ? Target : CheckCircle;
            const colors = insight.type === 'warning' 
              ? { bg: 'bg-amber-900/20', border: 'border-amber-500/30', icon: 'text-amber-400' }
              : insight.type === 'opportunity'
              ? { bg: 'bg-blue-900/20', border: 'border-blue-500/30', icon: 'text-blue-400' }
              : { bg: 'bg-emerald-900/20', border: 'border-emerald-500/30', icon: 'text-emerald-400' };
            
            return (
              <div key={idx} className={`${colors.bg} border ${colors.border} rounded-lg p-4`}>
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white">{insight.title}</h4>
                      <div className="text-emerald-300/70 text-sm">{insight.confidence}% confidence</div>
                    </div>
                    <p className="text-emerald-300/80 text-sm mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-emerald-400 text-sm">{insight.action}</div>
                      <button className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        insight.type === 'warning'
                          ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400'
                          : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400'
                      }`}>
                        Take Action
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Neural Network Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-purple-400" />
            <span className="text-white">Neural Network Status</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-emerald-300/70 text-sm">Active Models</span>
              <span className="text-white">47</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-300/70 text-sm">Training Models</span>
              <span className="text-amber-400">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-300/70 text-sm">Data Points Processed</span>
              <span className="text-white">2.4M</span>
            </div>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span className="text-white">Live Processing</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-emerald-300/70 text-sm">Satellite Images</span>
              <span className="text-emerald-400">Analyzing...</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-300/70 text-sm">Sensor Data</span>
              <span className="text-emerald-400">Real-time</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-300/70 text-sm">Community Reports</span>
              <span className="text-emerald-400">Processing</span>
            </div>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-400" />
            <span className="text-white">Compute Resources</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-emerald-300/70 text-sm">GPU Utilization</span>
                <span className="text-white">78%</span>
              </div>
              <div className="h-2 bg-emerald-900/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 w-[78%]"></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-emerald-300/70 text-sm">Memory</span>
                <span className="text-white">64%</span>
              </div>
              <div className="h-2 bg-emerald-900/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-[64%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
