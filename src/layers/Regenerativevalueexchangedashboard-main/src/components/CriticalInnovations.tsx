import { useState } from 'react';
import { RegenerativeAIOracle } from './innovations/RegenerativeAIOracle';
import { BiodiversityTokens } from './innovations/BiodiversityTokens';
import { TraditionalKnowledgeGraph } from './innovations/TraditionalKnowledgeGraph';
import { RegenerativeDeFi } from './innovations/RegenerativeDeFi';
import { Brain, Sparkles, BookOpen, Coins, Zap, TrendingUp, Shield, Globe } from 'lucide-react';

type InnovationType = 'overview' | 'ai-oracle' | 'biodiversity' | 'knowledge' | 'defi';

export function CriticalInnovations() {
  const [activeInnovation, setActiveInnovation] = useState<InnovationType>('overview');

  const innovations = [
    {
      id: 'ai-oracle' as InnovationType,
      title: 'AI Oracle Network',
      description: 'Predictive intelligence for optimizing outcomes',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      stats: { value: '94.7%', label: 'Prediction Accuracy' },
      impact: 'AI-powered verification and optimization'
    },
    {
      id: 'biodiversity' as InnovationType,
      title: 'Biodiversity Tokens',
      description: 'Species-specific conservation credits',
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-500',
      stats: { value: '847', label: 'Communities' },
      impact: 'Direct funding for endangered species'
    },
    {
      id: 'knowledge' as InnovationType,
      title: 'Knowledge Graph',
      description: 'Traditional ecological wisdom preservation',
      icon: BookOpen,
      color: 'from-amber-500 to-orange-500',
      stats: { value: '234', label: 'Languages' },
      impact: 'Indigenous knowledge sovereignty'
    },
    {
      id: 'defi' as InnovationType,
      title: 'Regenerative DeFi',
      description: 'Yield farming that funds restoration',
      icon: Coins,
      color: 'from-blue-500 to-cyan-500',
      stats: { value: '$124.8M', label: 'Total Value Locked' },
      impact: 'Cross-chain liquidity & lending'
    }
  ];

  const impactMetrics = [
    { label: 'AI Models Active', value: '47', icon: Brain, color: 'purple' },
    { label: 'Species Protected', value: '6,421', icon: Sparkles, color: 'emerald' },
    { label: 'Knowledge Systems', value: '252', icon: BookOpen, color: 'amber' },
    { label: 'DeFi Participants', value: '23,847', icon: Coins, color: 'blue' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white">Critical Innovations</h2>
            <p className="text-emerald-300/80">Next-generation systems pushing the boundaries of regenerative economics</p>
          </div>
        </div>
      </div>

      {activeInnovation === 'overview' && (
        <>
          {/* Impact Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactMetrics.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div key={idx} className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br from-${metric.color}-500 to-${metric.color}-600 rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-emerald-300/70 text-sm mb-1">{metric.label}</div>
                  <div className="text-white">{metric.value}</div>
                </div>
              );
            })}
          </div>

          {/* Innovation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {innovations.map((innovation) => {
              const Icon = innovation.icon;
              return (
                <button
                  key={innovation.id}
                  onClick={() => setActiveInnovation(innovation.id)}
                  className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-8 hover:border-emerald-500/40 transition-all text-left group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${innovation.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white mb-2">{innovation.title}</h3>
                      <p className="text-emerald-300/70 text-sm">{innovation.description}</p>
                    </div>
                  </div>

                  <div className="bg-emerald-900/20 rounded-lg p-4 mb-4">
                    <div className="text-emerald-300/70 text-xs mb-1">Innovation Impact</div>
                    <div className="text-emerald-400 text-sm">{innovation.impact}</div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-emerald-500/20">
                    <div>
                      <div className="text-emerald-300/70 text-sm">{innovation.stats.label}</div>
                      <div className="text-white">{innovation.stats.value}</div>
                    </div>
                    <div className="text-emerald-400 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Technology Stack */}
          <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-white mb-6">Revolutionary Technology Stack</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6 text-purple-400" />
                  <h4 className="text-white">AI & Machine Learning</h4>
                </div>
                <ul className="space-y-2 text-emerald-300/70 text-sm">
                  <li>• Neural networks for impact prediction</li>
                  <li>• Satellite imagery analysis (10m resolution)</li>
                  <li>• Natural language processing for reports</li>
                  <li>• Reinforcement learning for optimization</li>
                  <li>• Anomaly detection for fraud prevention</li>
                </ul>
              </div>

              <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <h4 className="text-white">Blockchain & Web3</h4>
                </div>
                <ul className="space-y-2 text-emerald-300/70 text-sm">
                  <li>• Multi-chain architecture (EVM compatible)</li>
                  <li>• Zero-knowledge proofs for privacy</li>
                  <li>• Decentralized identity (DID)</li>
                  <li>• Smart contract automation</li>
                  <li>• IPFS for distributed storage</li>
                </ul>
              </div>

              <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-6 h-6 text-emerald-400" />
                  <h4 className="text-white">IoT & Remote Sensing</h4>
                </div>
                <ul className="space-y-2 text-emerald-300/70 text-sm">
                  <li>• LoRaWAN sensor networks</li>
                  <li>• Satellite constellation partnerships</li>
                  <li>• Edge computing for data processing</li>
                  <li>• Camera trap networks with AI</li>
                  <li>• Drone mapping & monitoring</li>
                </ul>
              </div>

              <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-amber-400" />
                  <h4 className="text-white">Financial Innovation</h4>
                </div>
                <ul className="space-y-2 text-emerald-300/70 text-sm">
                  <li>• Automated market makers (AMM)</li>
                  <li>• Regenerative yield optimization</li>
                  <li>• Parametric insurance protocols</li>
                  <li>• Fractional asset ownership</li>
                  <li>• Impact-linked derivatives</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Innovation Pipeline */}
          <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-white mb-6">Innovation Pipeline</h3>
            <div className="space-y-4">
              {[
                {
                  phase: 'In Development',
                  innovations: [
                    'Quantum-resistant cryptography',
                    'Real-time carbon accounting',
                    'Decentralized science (DeSci) protocols',
                    'Regenerative credit derivatives'
                  ],
                  color: 'amber'
                },
                {
                  phase: 'Beta Testing',
                  innovations: [
                    'Holographic impact visualization',
                    'Voice-based verification for indigenous communities',
                    'Parametric impact insurance',
                    'Cross-ecosystem value transfer'
                  ],
                  color: 'blue'
                },
                {
                  phase: 'Research Phase',
                  innovations: [
                    'Mycelium network communication protocols',
                    'Bioacoustic biodiversity monitoring',
                    'Regenerative universal basic income',
                    'Planetary boundary tokens'
                  ],
                  color: 'purple'
                }
              ].map((pipeline, idx) => (
                <div key={idx} className={`bg-${pipeline.color}-900/20 border border-${pipeline.color}-500/30 rounded-lg p-5`}>
                  <div className={`text-${pipeline.color}-400 mb-3`}>{pipeline.phase}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pipeline.innovations.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full bg-${pipeline.color}-500`}></div>
                        <span className="text-emerald-300/70 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vision Statement */}
          <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8">
            <h3 className="text-white mb-4">The Future of Regenerative Economics</h3>
            <p className="text-emerald-300/80 text-lg leading-relaxed">
              These innovations represent a fundamental reimagining of how humanity relates to nature and each other. 
              By combining cutting-edge technology with ancient wisdom, we're creating financial systems that reward 
              ecological healing rather than extraction. Every transaction, every token, every data point serves the 
              greater goal: a thriving planet where all life flourishes.
            </p>
          </div>
        </>
      )}

      {/* Innovation Detail Views */}
      {activeInnovation === 'ai-oracle' && (
        <div>
          <button
            onClick={() => setActiveInnovation('overview')}
            className="mb-6 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2"
          >
            ← Back to Innovations
          </button>
          <RegenerativeAIOracle />
        </div>
      )}

      {activeInnovation === 'biodiversity' && (
        <div>
          <button
            onClick={() => setActiveInnovation('overview')}
            className="mb-6 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2"
          >
            ← Back to Innovations
          </button>
          <BiodiversityTokens />
        </div>
      )}

      {activeInnovation === 'knowledge' && (
        <div>
          <button
            onClick={() => setActiveInnovation('overview')}
            className="mb-6 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2"
          >
            ← Back to Innovations
          </button>
          <TraditionalKnowledgeGraph />
        </div>
      )}

      {activeInnovation === 'defi' && (
        <div>
          <button
            onClick={() => setActiveInnovation('overview')}
            className="mb-6 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2"
          >
            ← Back to Innovations
          </button>
          <RegenerativeDeFi />
        </div>
      )}
    </div>
  );
}
