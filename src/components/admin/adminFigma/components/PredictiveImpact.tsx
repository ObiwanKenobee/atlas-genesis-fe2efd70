import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Sparkles, Target, Zap, Brain, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Prediction {
  metric: string;
  current: number;
  predicted30d: number;
  predicted60d: number;
  predicted90d: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  impact: number;
  probability: number;
  recommendation: string;
}

export function PredictiveImpact() {
  const [timeframe, setTimeframe] = useState<'30d' | '60d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const predictions: Prediction[] = [
    {
      metric: 'Carbon Offset (tons)',
      current: 12456,
      predicted30d: 14230,
      predicted60d: 16890,
      predicted90d: 19450,
      confidence: 92,
      trend: 'up',
      riskLevel: 'low',
    },
    {
      metric: 'Biodiversity Index',
      current: 7.8,
      predicted30d: 7.6,
      predicted60d: 7.3,
      predicted90d: 7.1,
      confidence: 78,
      trend: 'down',
      riskLevel: 'high',
    },
    {
      metric: 'Community Engagement',
      current: 2847,
      predicted30d: 3124,
      predicted60d: 3456,
      predicted90d: 3789,
      confidence: 85,
      trend: 'up',
      riskLevel: 'low',
    },
    {
      metric: 'Financial Sustainability',
      current: 89,
      predicted30d: 87,
      predicted60d: 85,
      predicted90d: 83,
      confidence: 81,
      trend: 'down',
      riskLevel: 'medium',
    },
  ];

  const scenarios: Scenario[] = [
    {
      id: '1',
      name: 'Accelerate Reforestation',
      description: 'Increase reforestation budget by 30%',
      impact: +25,
      probability: 78,
      recommendation: 'Allocate additional $500K to high-impact zones',
    },
    {
      id: '2',
      name: 'Ocean Restoration Focus',
      description: 'Shift 20% resources to marine ecosystems',
      impact: +18,
      probability: 65,
      recommendation: 'Partner with coastal communities for implementation',
    },
    {
      id: '3',
      name: 'Technology Integration',
      description: 'Deploy IoT sensors for real-time monitoring',
      impact: +32,
      probability: 85,
      recommendation: 'Invest in sensor network infrastructure',
    },
    {
      id: '4',
      name: 'Community Training',
      description: 'Expand local capacity building programs',
      impact: +22,
      probability: 72,
      recommendation: 'Launch 5 regional training centers',
    },
  ];

  const insights = [
    {
      type: 'success',
      icon: <Sparkles className="w-5 h-5" />,
      title: 'Carbon Trajectory Exceeds Target',
      description: 'Current pace will exceed annual goal by 15% if maintained',
    },
    {
      type: 'warning',
      icon: <AlertTriangle className="w-5 h-5" />,
      title: 'Biodiversity Alert',
      description: 'Declining trend detected. Immediate intervention recommended',
    },
    {
      type: 'info',
      icon: <Brain className="w-5 h-5" />,
      title: 'AI Recommendation',
      description: 'Model suggests reallocating 12% of budget to coastal zones',
    },
    {
      type: 'success',
      icon: <Target className="w-5 h-5" />,
      title: 'Optimal Performance Zone',
      description: 'Current operations are in 94th percentile efficiency',
    },
  ];

  const getPredictedValue = (prediction: Prediction) => {
    switch (timeframe) {
      case '30d':
        return prediction.predicted30d;
      case '60d':
        return prediction.predicted60d;
      case '90d':
        return prediction.predicted90d;
    }
  };

  const getChangePercent = (prediction: Prediction) => {
    const predicted = getPredictedValue(prediction);
    return ((predicted - prediction.current) / prediction.current) * 100;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="mb-4 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl mb-2 flex items-center gap-2 sm:gap-3">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              Predictive Impact Analytics
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              AI-powered forecasting and scenario modeling
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 hidden sm:inline">Forecast Period:</span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
            >
              <option value="30d">30 Days</option>
              <option value="60d">60 Days</option>
              <option value="90d">90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Insights Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-4 sm:p-6 text-white">
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-base sm:text-lg mb-2">AI-Powered Forecast</h3>
            <p className="text-sm sm:text-base opacity-90 mb-3">
              Our machine learning models have analyzed 10,000+ historical data points to predict your impact trajectory with {predictions[0].confidence}% confidence.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white/20 rounded text-xs sm:text-sm">
                LSTM Time Series
              </span>
              <span className="px-3 py-1 bg-white/20 rounded text-xs sm:text-sm">
                Random Forest
              </span>
              <span className="px-3 py-1 bg-white/20 rounded text-xs sm:text-sm">
                Prophet Algorithm
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {predictions.map((prediction, index) => {
          const change = getChangePercent(prediction);
          const predictedValue = getPredictedValue(prediction);
          
          return (
            <div
              key={index}
              className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedMetric(prediction.metric)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-sm text-gray-600 mb-1">{prediction.metric}</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl sm:text-3xl">{prediction.current.toLocaleString()}</p>
                    <div className={`flex items-center gap-1 text-sm ${
                      prediction.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {prediction.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span>{Math.abs(change).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs border ${getRiskColor(prediction.riskLevel)}`}>
                  {prediction.riskLevel} risk
                </span>
              </div>

              {/* Mini Chart */}
              <div className="mb-4">
                <div className="h-16 flex items-end gap-1">
                  {[prediction.current, prediction.predicted30d, prediction.predicted60d, prediction.predicted90d].map((value, i) => {
                    const maxValue = Math.max(prediction.current, prediction.predicted90d);
                    const height = (value / maxValue) * 100;
                    
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Now</span>
                  <span>{timeframe}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-600">Predicted: </span>
                  <span className="font-semibold">{predictedValue.toLocaleString()}</span>
                </div>
                <div className="text-gray-500">
                  {prediction.confidence}% confidence
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-600" />
          AI-Generated Insights
        </h3>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 ${
                  insight.type === 'success' ? 'text-emerald-600' :
                  insight.type === 'warning' ? 'text-amber-600' :
                  'text-blue-600'
                }`}>
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm mb-1">{insight.title}</h4>
                  <p className="text-xs opacity-80">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario Modeling */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          What-If Scenario Analysis
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Explore different strategies and their predicted impact on your regenerative goals
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm flex-1">{scenario.name}</h4>
                <div className="flex items-center gap-1 text-emerald-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm">+{scenario.impact}%</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mb-3">{scenario.description}</p>
              
              <div className="space-y-2 mb-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Success Probability</span>
                    <span>{scenario.probability}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                      style={{ width: `${scenario.probability}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-900">
                  <strong>Recommendation:</strong> {scenario.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ML Model Performance */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg mb-4">Model Performance Metrics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl mb-1">92%</p>
            <p className="text-xs text-gray-600">Accuracy</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl mb-1">0.08</p>
            <p className="text-xs text-gray-600">RMSE</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl mb-1">89%</p>
            <p className="text-xs text-gray-600">Precision</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl mb-1">10K+</p>
            <p className="text-xs text-gray-600">Training Data</p>
          </div>
        </div>
      </div>
    </div>
  );
}
