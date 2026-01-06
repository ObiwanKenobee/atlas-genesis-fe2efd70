import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Zap, Globe, Users, TrendingUp, Award, Brain, Leaf, 
  Database, Lock, Cpu, Network, Eye, AlertTriangle, CheckCircle,
  BarChart3, Activity, Layers, Settings, Target, Sparkles
} from 'lucide-react';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveCard, ResponsiveText } from './ResponsiveSystem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const QuantumVerificationEngine = () => (
  <ResponsiveCard variant="glass" className="border-primary/20">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
        <Shield className="w-6 h-6 text-white" />
      </div>
      <div>
        <ResponsiveText size="lg" weight="semibold">Quantum Verification</ResponsiveText>
        <ResponsiveText size="sm" color="muted">99.97% Accuracy</ResponsiveText>
      </div>
    </div>
    
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Satellite Verification</span>
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Blockchain Consensus</span>
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
          <Network className="w-3 h-3 mr-1" />
          Synced
        </Badge>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">AI Anomaly Detection</span>
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
          <Brain className="w-3 h-3 mr-1" />
          Learning
        </Badge>
      </div>
    </div>
  </ResponsiveCard>
);

export const RegenerativeMetrics = () => (
  <ResponsiveCard variant="elevated">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
        <Leaf className="w-6 h-6 text-white" />
      </div>
      <div>
        <ResponsiveText size="lg" weight="semibold">Regenerative Impact</ResponsiveText>
        <ResponsiveText size="sm" color="muted">Real-time Ecosystem Health</ResponsiveText>
      </div>
    </div>
    
    <ResponsiveGrid cols={{ default: 2, lg: 4 }} gap="sm">
      <div className="text-center p-3 rounded-lg bg-muted/30">
        <div className="text-2xl font-bold text-emerald-600">847K</div>
        <div className="text-xs text-muted-foreground">Tons CO₂</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-muted/30">
        <div className="text-2xl font-bold text-blue-600">2.3M</div>
        <div className="text-xs text-muted-foreground">Hectares</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-muted/30">
        <div className="text-2xl font-bold text-purple-600">156</div>
        <div className="text-xs text-muted-foreground">Species</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-muted/30">
        <div className="text-2xl font-bold text-amber-600">94%</div>
        <div className="text-xs text-muted-foreground">Health Score</div>
      </div>
    </ResponsiveGrid>
  </ResponsiveCard>
);

export const GlobalNetworkStatus = () => (
  <ResponsiveCard variant="glass" className="border-blue-500/20">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
        <Globe className="w-6 h-6 text-white" />
      </div>
      <div>
        <ResponsiveText size="lg" weight="semibold">Global Network</ResponsiveText>
        <ResponsiveText size="sm" color="muted">Planetary Scale Operations</ResponsiveText>
      </div>
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm">North America</span>
        </div>
        <span className="text-xs text-muted-foreground">847 nodes</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm">Europe</span>
        </div>
        <span className="text-xs text-muted-foreground">623 nodes</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm">Asia Pacific</span>
        </div>
        <span className="text-xs text-muted-foreground">1,247 nodes</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-sm">Africa</span>
        </div>
        <span className="text-xs text-muted-foreground">394 nodes</span>
      </div>
    </div>
  </ResponsiveCard>
);

export const AIDecisionMatrix = () => (
  <ResponsiveCard variant="elevated" className="border-purple-500/20">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <Brain className="w-6 h-6 text-white" />
      </div>
      <div>
        <ResponsiveText size="lg" weight="semibold">AI Decision Engine</ResponsiveText>
        <ResponsiveText size="sm" color="muted">Autonomous Optimization</ResponsiveText>
      </div>
    </div>
    
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-500" />
          <span className="text-sm">Credit Pricing</span>
        </div>
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
          Optimizing
        </Badge>
      </div>
      
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-500" />
          <span className="text-sm">Risk Assessment</span>
        </div>
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Complete
        </Badge>
      </div>
      
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span className="text-sm">Market Matching</span>
        </div>
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
          Processing
        </Badge>
      </div>
    </div>
  </ResponsiveCard>
);

export const SecurityOperationsCenter = () => (
  <ResponsiveCard variant="glass" className="border-red-500/20">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
        <Lock className="w-6 h-6 text-white" />
      </div>
      <div>
        <ResponsiveText size="lg" weight="semibold">Security Center</ResponsiveText>
        <ResponsiveText size="sm" color="muted">24/7 Threat Monitoring</ResponsiveText>
      </div>
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Threat Level</span>
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Low
        </Badge>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Active Scans</span>
        <span className="text-sm font-medium">2,847</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Blocked Attempts</span>
        <span className="text-sm font-medium">0</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Uptime</span>
        <span className="text-sm font-medium text-emerald-600">99.97%</span>
      </div>
    </div>
  </ResponsiveCard>
);

export const MarketIntelligence = () => (
  <ResponsiveCard variant="elevated">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
        <TrendingUp className="w-6 h-6 text-white" />
      </div>
      <div>
        <ResponsiveText size="lg" weight="semibold">Market Intelligence</ResponsiveText>
        <ResponsiveText size="sm" color="muted">Real-time Analytics</ResponsiveText>
      </div>
    </div>
    
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Current Price</span>
        <div className="text-right">
          <div className="text-lg font-semibold text-foreground">$47.23</div>
          <div className="text-xs text-emerald-600">+2.4%</div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">24h Volume</span>
        <div className="text-right">
          <div className="text-lg font-semibold text-foreground">$2.8M</div>
          <div className="text-xs text-blue-600">+15.7%</div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Market Cap</span>
        <div className="text-right">
          <div className="text-lg font-semibold text-foreground">$1.84B</div>
          <div className="text-xs text-purple-600">+8.2%</div>
        </div>
      </div>
    </div>
  </ResponsiveCard>
);

export const CriticalSystemsDashboard = () => (
  <ResponsiveContainer>
    <div className="mb-8">
      <ResponsiveText size="3xl" weight="bold" align="center" className="mb-4">
        Civilizational Infrastructure
      </ResponsiveText>
      <ResponsiveText size="lg" color="muted" align="center" className="max-w-3xl mx-auto">
        Critical systems powering the regenerative economy at planetary scale
      </ResponsiveText>
    </div>
    
    <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="lg">
      <QuantumVerificationEngine />
      <RegenerativeMetrics />
      <GlobalNetworkStatus />
      <AIDecisionMatrix />
      <SecurityOperationsCenter />
      <MarketIntelligence />
    </ResponsiveGrid>
    
    <div className="mt-12 text-center">
      <Button variant="hero" size="lg" className="mr-4">
        <Settings className="w-5 h-5 mr-2" />
        System Controls
      </Button>
      <Button variant="outline" size="lg">
        <Eye className="w-5 h-5 mr-2" />
        Full Monitoring
      </Button>
    </div>
  </ResponsiveContainer>
);