import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Shield, Zap, Lock, CheckCircle2, TrendingUp, Activity, Cpu, Database, Network, BarChart3 } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export function ZKRollupIntegration() {
  const [selectedRollup, setSelectedRollup] = useState('zkSync');

  // ZK-Rollup providers
  const rollupProviders = [
    {
      name: 'zkSync Era',
      type: 'zkEVM',
      technology: 'zkSNARK',
      tps: '2000+',
      tvl: '$847M',
      proofTime: '10-30 min',
      status: 'active',
      gasReduction: '95%',
      color: '#8C8DFC'
    },
    {
      name: 'StarkNet',
      type: 'App-Specific',
      technology: 'zkSTARK',
      tps: '5000+',
      tvl: '$234M',
      proofTime: '5-15 min',
      status: 'active',
      gasReduction: '97%',
      color: '#FF6B6B'
    },
    {
      name: 'Polygon zkEVM',
      type: 'zkEVM',
      technology: 'zkSNARK',
      tps: '2500+',
      tvl: '$456M',
      proofTime: '8-20 min',
      status: 'active',
      gasReduction: '96%',
      color: '#8247E5'
    },
    {
      name: 'Scroll',
      type: 'zkEVM',
      technology: 'zkSNARK',
      tps: '1800+',
      tvl: '$178M',
      proofTime: '12-25 min',
      status: 'active',
      gasReduction: '94%',
      color: '#FFD700'
    },
  ];

  // Transaction metrics
  const transactionMetrics = [
    { month: 'Jan', l1Cost: 125, l2Cost: 6, savings: 95.2 },
    { month: 'Feb', l1Cost: 142, l2Cost: 7, savings: 95.1 },
    { month: 'Mar', l1Cost: 158, l2Cost: 8, savings: 94.9 },
    { month: 'Apr', l1Cost: 134, l2Cost: 7, savings: 94.8 },
    { month: 'May', l1Cost: 167, l2Cost: 8, savings: 95.2 },
    { month: 'Jun', l1Cost: 189, l2Cost: 9, savings: 95.2 },
  ];

  // Performance comparison
  const performanceData = [
    { metric: 'TPS', L1: 15, 'zkSync': 2000, 'StarkNet': 5000, 'Polygon zkEVM': 2500 },
    { metric: 'Cost', L1: 100, 'zkSync': 5, 'StarkNet': 3, 'Polygon zkEVM': 4 },
    { metric: 'Finality', L1: 100, 'zkSync': 95, 'StarkNet': 92, 'Polygon zkEVM': 94 },
    { metric: 'Security', L1: 100, 'zkSync': 98, 'StarkNet': 97, 'Polygon zkEVM': 98 },
    { metric: 'Decentralization', L1: 100, 'zkSync': 85, 'StarkNet': 80, 'Polygon zkEVM': 88 },
  ];

  // Batch statistics
  const batchStats = [
    { hour: '00:00', batches: 12, txs: 24500, proofs: 12 },
    { hour: '04:00', batches: 8, txs: 16800, proofs: 8 },
    { hour: '08:00', batches: 15, txs: 31200, proofs: 15 },
    { hour: '12:00', batches: 18, txs: 37800, proofs: 18 },
    { hour: '16:00', batches: 22, txs: 45600, proofs: 22 },
    { hour: '20:00', batches: 19, txs: 39400, proofs: 19 },
  ];

  // Security features
  const securityFeatures = [
    {
      icon: Shield,
      title: 'Zero-Knowledge Proofs',
      description: 'Cryptographic verification without revealing transaction data',
      status: 'Active'
    },
    {
      icon: Lock,
      title: 'L1 Security Inheritance',
      description: 'Inherits Ethereum mainnet security guarantees',
      status: 'Active'
    },
    {
      icon: Network,
      title: 'Decentralized Sequencers',
      description: 'Multiple sequencers prevent censorship',
      status: 'Active'
    },
    {
      icon: Database,
      title: 'Data Availability',
      description: 'All state data posted to L1 for verification',
      status: 'Active'
    },
  ];

  // Recent proofs
  const recentProofs = [
    { id: 'PROOF-4782', rollup: 'zkSync', txCount: 2147, size: '234 KB', verificationTime: '12m 34s', status: 'verified' },
    { id: 'PROOF-4781', rollup: 'StarkNet', txCount: 5234, size: '187 KB', verificationTime: '8m 12s', status: 'verified' },
    { id: 'PROOF-4780', rollup: 'Polygon zkEVM', txCount: 3156, size: '298 KB', verificationTime: '15m 23s', status: 'verified' },
    { id: 'PROOF-4779', rollup: 'zkSync', txCount: 1987, size: '201 KB', verificationTime: '11m 45s', status: 'verified' },
    { id: 'PROOF-4778', rollup: 'StarkNet', txCount: 4823, size: '165 KB', verificationTime: '7m 56s', status: 'verifying' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white mb-2">ZK-Rollup Integration</h2>
        <p className="text-emerald-300/70">Zero-knowledge rollups for scalable, secure, and cost-efficient transactions</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Total TVL</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">$1.72B</div>
          <div className="text-emerald-400 text-sm">Across all ZK-Rollups</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">24h Transactions</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">2.4M</div>
          <div className="text-emerald-400 text-sm">+34.2% from yesterday</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Gas Savings</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">95.2%</div>
          <div className="text-emerald-400 text-sm">vs L1 transactions</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Proofs Verified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">94</div>
          <div className="text-emerald-400 text-sm">In last 24 hours</div>
        </Card>
      </div>

      {/* ZK-Rollup Providers */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Integrated ZK-Rollup Providers</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rollupProviders.map((provider, index) => (
            <div 
              key={index} 
              className={`bg-slate-900/50 border rounded-lg p-4 cursor-pointer transition-all ${
                selectedRollup === provider.name 
                  ? 'border-emerald-400 bg-emerald-400/10' 
                  : 'border-emerald-500/20 hover:border-emerald-400/50'
              }`}
              onClick={() => setSelectedRollup(provider.name)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{provider.name}</h4>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                      {provider.type}
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                      {provider.technology}
                    </Badge>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  {provider.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <div className="text-emerald-300/70 text-xs">TPS</div>
                  <div className="text-white font-medium">{provider.tps}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">TVL</div>
                  <div className="text-white font-medium">{provider.tvl}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Proof Time</div>
                  <div className="text-white font-medium">{provider.proofTime}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Gas Reduction</div>
                  <div className="text-white font-medium">{provider.gasReduction}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Cost Savings Chart */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Transaction Cost Comparison (USD)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={transactionMetrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="month" stroke="#6ee7b7" />
            <YAxis stroke="#6ee7b7" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b98150' }}
              labelStyle={{ color: '#6ee7b7' }}
            />
            <Bar dataKey="l1Cost" fill="#ef4444" name="L1 Cost" />
            <Bar dataKey="l2Cost" fill="#10b981" name="L2 Cost" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Performance Radar Chart */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={performanceData}>
            <PolarGrid stroke="#ffffff20" />
            <PolarAngleAxis dataKey="metric" stroke="#6ee7b7" />
            <PolarRadiusAxis stroke="#6ee7b7" />
            <Radar name="zkSync" dataKey="zkSync" stroke="#8C8DFC" fill="#8C8DFC" fillOpacity={0.3} />
            <Radar name="StarkNet" dataKey="StarkNet" stroke="#FF6B6B" fill="#FF6B6B" fillOpacity={0.3} />
            <Radar name="Polygon zkEVM" dataKey="Polygon zkEVM" stroke="#8247E5" fill="#8247E5" fillOpacity={0.3} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b98150' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {/* Batch Statistics */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Batch Processing Statistics (24h)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={batchStats}>
            <defs>
              <linearGradient id="batchGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="hour" stroke="#6ee7b7" />
            <YAxis stroke="#6ee7b7" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b98150' }}
              labelStyle={{ color: '#6ee7b7' }}
            />
            <Area type="monotone" dataKey="txs" stroke="#10b981" fill="url(#batchGradient)" name="Transactions" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Security Features */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Security & Privacy Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-500/20 p-2 rounded-lg">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    {feature.status}
                  </Badge>
                </div>
                <h4 className="text-white font-medium mb-1">{feature.title}</h4>
                <p className="text-emerald-300/70 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Proofs */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Recent ZK Proofs</h3>
        
        <div className="space-y-2">
          {recentProofs.map((proof, index) => (
            <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`w-4 h-4 ${proof.status === 'verified' ? 'text-emerald-400' : 'text-yellow-400'}`} />
                  <div>
                    <div className="text-white font-medium">{proof.id}</div>
                    <div className="text-emerald-300/70 text-sm">{proof.rollup}</div>
                  </div>
                </div>
                <Badge 
                  className={
                    proof.status === 'verified'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }
                >
                  {proof.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-4 gap-3 mt-3">
                <div>
                  <div className="text-emerald-300/70 text-xs">Transactions</div>
                  <div className="text-white font-medium">{proof.txCount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Proof Size</div>
                  <div className="text-white font-medium">{proof.size}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Verification Time</div>
                  <div className="text-white font-medium">{proof.verificationTime}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Compression</div>
                  <div className="text-white font-medium">{(proof.txCount / parseFloat(proof.size)).toFixed(0)}x</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Technical Details */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">ZK-Rollup Technical Architecture</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* zkSNARK */}
          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Cpu className="w-5 h-5 text-purple-400" />
              </div>
              <h4 className="text-white font-medium">zkSNARK Technology</h4>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-emerald-300/70 text-sm">Proof System</div>
                <div className="text-white">Succinct Non-Interactive Argument of Knowledge</div>
              </div>
              <div>
                <div className="text-emerald-300/70 text-sm">Key Features</div>
                <div className="text-white">Constant proof size, fast verification, requires trusted setup</div>
              </div>
              <div>
                <div className="text-emerald-300/70 text-sm">Use Cases</div>
                <div className="text-white">zkSync Era, Polygon zkEVM, Scroll</div>
              </div>
              <div>
                <div className="text-emerald-300/70 text-sm">Advantages</div>
                <div className="text-white">Smaller proofs (~200KB), EVM compatibility</div>
              </div>
            </div>
          </div>

          {/* zkSTARK */}
          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/20 p-2 rounded-lg">
                <Cpu className="w-5 h-5 text-red-400" />
              </div>
              <h4 className="text-white font-medium">zkSTARK Technology</h4>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-emerald-300/70 text-sm">Proof System</div>
                <div className="text-white">Scalable Transparent Argument of Knowledge</div>
              </div>
              <div>
                <div className="text-emerald-300/70 text-sm">Key Features</div>
                <div className="text-white">No trusted setup, quantum-resistant, larger proofs</div>
              </div>
              <div>
                <div className="text-emerald-300/70 text-sm">Use Cases</div>
                <div className="text-white">StarkNet, StarkEx (dYdX, Immutable X)</div>
              </div>
              <div>
                <div className="text-emerald-300/70 text-sm">Advantages</div>
                <div className="text-white">Higher security, no setup ceremony, faster proving</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Integration Guide */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Developer Integration</h3>
        
        <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4 mb-4">
          <div className="text-emerald-300/70 text-sm mb-2">Example: Deploy to zkSync Era</div>
          <pre className="text-white text-sm overflow-x-auto">
{`// Install zkSync SDK
npm install zksync-web3 ethers

// Connect to zkSync
import { Wallet, Provider } from 'zksync-web3';

const provider = new Provider('https://zksync2-mainnet.zksync.io');
const wallet = new Wallet(PRIVATE_KEY, provider);

// Deploy contract with 95% cost savings
const contract = await deployContract(wallet, artifact, []);`}
          </pre>
        </div>

        <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
          View Full Documentation
        </Button>
      </Card>
    </div>
  );
}
