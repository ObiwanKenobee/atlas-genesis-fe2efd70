import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, DollarSign, Users, Building, Leaf, Globe, 
  Zap, Shield, Award, Target, BarChart3, Coins
} from 'lucide-react';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveCard, ResponsiveText } from './ResponsiveSystem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const BusinessModelOverview = () => {
  const revenueStreams = [
    {
      title: 'Transaction Fees',
      revenue: '$847M',
      growth: '+156%',
      description: '2.5% fee on all RIU trades',
      icon: DollarSign,
      color: 'emerald'
    },
    {
      title: 'Platform Subscriptions',
      revenue: '$234M',
      growth: '+89%',
      description: 'Enterprise & SMB monthly plans',
      icon: Building,
      color: 'blue'
    },
    {
      title: 'Verification Services',
      revenue: '$156M',
      growth: '+234%',
      description: 'Satellite & AI verification fees',
      icon: Shield,
      color: 'purple'
    },
    {
      title: 'Data Licensing',
      revenue: '$89M',
      growth: '+67%',
      description: 'Environmental data API access',
      icon: BarChart3,
      color: 'amber'
    }
  ];

  const marketSegments = [
    {
      segment: 'Enterprise',
      size: '$1.2T',
      share: '12%',
      customers: '2,847',
      arpu: '$47K',
      icon: Building
    },
    {
      segment: 'SMB',
      size: '$340B',
      share: '8%',
      customers: '23,456',
      arpu: '$1.2K',
      icon: Users
    },
    {
      segment: 'Individual',
      size: '$89B',
      share: '15%',
      customers: '847K',
      arpu: '$156',
      icon: Leaf
    },
    {
      segment: 'Government',
      size: '$567B',
      share: '5%',
      customers: '89',
      arpu: '$3.2M',
      icon: Globe
    }
  ];

  return (
    <ResponsiveContainer>
      <div className="mb-12">
        <ResponsiveText size="3xl" weight="bold" align="center" className="mb-4">
          Business Model Architecture
        </ResponsiveText>
        <ResponsiveText size="lg" color="muted" align="center" className="max-w-3xl mx-auto">
          Multi-trillion dollar regenerative economy powered by diversified revenue streams
        </ResponsiveText>
      </div>

      {/* Revenue Streams */}
      <div className="mb-16">
        <ResponsiveText size="2xl" weight="bold" className="mb-6">
          Revenue Streams - $1.32B ARR
        </ResponsiveText>
        <ResponsiveGrid cols={{ default: 1, md: 2, lg: 4 }} gap="lg">
          {revenueStreams.map((stream, index) => (
            <ResponsiveCard key={index} variant="elevated" className="text-center">
              <div className={`w-12 h-12 rounded-xl bg-${stream.color}-500/10 flex items-center justify-center mx-auto mb-4`}>
                <stream.icon className={`w-6 h-6 text-${stream.color}-600`} />
              </div>
              <ResponsiveText size="lg" weight="semibold" className="mb-2">
                {stream.title}
              </ResponsiveText>
              <div className="text-3xl font-bold text-foreground mb-1">{stream.revenue}</div>
              <Badge variant="secondary" className={`bg-${stream.color}-500/10 text-${stream.color}-600 mb-3`}>
                {stream.growth}
              </Badge>
              <ResponsiveText size="sm" color="muted">
                {stream.description}
              </ResponsiveText>
            </ResponsiveCard>
          ))}
        </ResponsiveGrid>
      </div>

      {/* Market Segments */}
      <div className="mb-16">
        <ResponsiveText size="2xl" weight="bold" className="mb-6">
          Market Segments - $2.4T TAM
        </ResponsiveText>
        <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="lg">
          {marketSegments.map((segment, index) => (
            <ResponsiveCard key={index} variant="glass" className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <segment.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <ResponsiveText size="lg" weight="semibold">{segment.segment}</ResponsiveText>
                  <ResponsiveText size="sm" color="muted">Market Size: {segment.size}</ResponsiveText>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">{segment.share}</div>
                  <div className="text-xs text-muted-foreground">Market Share</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{segment.customers}</div>
                  <div className="text-xs text-muted-foreground">Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-emerald-600">{segment.arpu}</div>
                  <div className="text-xs text-muted-foreground">ARPU</div>
                </div>
              </div>
            </ResponsiveCard>
          ))}
        </ResponsiveGrid>
      </div>
    </ResponsiveContainer>
  );
};

export const EconomicEngine = () => {
  const economicMetrics = [
    { label: 'Gross Margin', value: '87%', trend: '+12%' },
    { label: 'Net Revenue Retention', value: '156%', trend: '+23%' },
    { label: 'Customer LTV', value: '$2.3M', trend: '+89%' },
    { label: 'CAC Payback', value: '4.2mo', trend: '-34%' }
  ];

  return (
    <ResponsiveContainer className="py-20 bg-muted/20">
      <div className="text-center mb-12">
        <ResponsiveText size="3xl" weight="bold" className="mb-4">
          Economic Engine
        </ResponsiveText>
        <ResponsiveText size="lg" color="muted">
          Unit economics driving sustainable growth at scale
        </ResponsiveText>
      </div>

      <ResponsiveGrid cols={{ default: 2, lg: 4 }} gap="lg" className="mb-12">
        {economicMetrics.map((metric, index) => (
          <div key={index} className="text-center p-6 rounded-xl bg-card border border-border">
            <div className="text-3xl font-bold text-foreground mb-2">{metric.value}</div>
            <div className="text-sm text-muted-foreground mb-2">{metric.label}</div>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
              {metric.trend}
            </Badge>
          </div>
        ))}
      </ResponsiveGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ResponsiveCard variant="elevated">
          <ResponsiveText size="lg" weight="semibold" className="mb-4">
            Value Creation Flywheel
          </ResponsiveText>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">1</div>
              <span className="text-sm">More projects → Higher verification volume</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">2</div>
              <span className="text-sm">Better data → Improved AI models</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">3</div>
              <span className="text-sm">Lower costs → Competitive pricing</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">4</div>
              <span className="text-sm">More buyers → Network effects</span>
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard variant="elevated">
          <ResponsiveText size="lg" weight="semibold" className="mb-4">
            Competitive Moats
          </ResponsiveText>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="text-sm">Proprietary satellite verification</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="text-sm">AI-powered risk assessment</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-emerald-500" />
              <span className="text-sm">Global regulatory compliance</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="text-sm">Network effects at scale</span>
            </div>
          </div>
        </ResponsiveCard>
      </div>
    </ResponsiveContainer>
  );
};

export const GrowthStrategy = () => {
  const growthInitiatives = [
    {
      initiative: 'Geographic Expansion',
      investment: '$234M',
      roi: '340%',
      timeline: '18mo',
      description: 'Enter 47 new markets across Africa, Asia, and Latin America'
    },
    {
      initiative: 'Product Innovation',
      investment: '$156M',
      roi: '280%',
      timeline: '12mo',
      description: 'AI-powered carbon forecasting and automated verification'
    },
    {
      initiative: 'Strategic Partnerships',
      investment: '$89M',
      roi: '450%',
      timeline: '6mo',
      description: 'Integrate with major ESG platforms and financial institutions'
    },
    {
      initiative: 'Enterprise Sales',
      investment: '$67M',
      roi: '520%',
      timeline: '24mo',
      description: 'Dedicated enterprise sales team and custom solutions'
    }
  ];

  return (
    <ResponsiveContainer className="py-20">
      <div className="text-center mb-12">
        <ResponsiveText size="3xl" weight="bold" className="mb-4">
          Growth Strategy
        </ResponsiveText>
        <ResponsiveText size="lg" color="muted">
          Strategic investments driving 10x growth over 5 years
        </ResponsiveText>
      </div>

      <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="lg">
        {growthInitiatives.map((initiative, index) => (
          <ResponsiveCard key={index} variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <ResponsiveText size="lg" weight="semibold">{initiative.initiative}</ResponsiveText>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                {initiative.roi} ROI
              </Badge>
            </div>
            <ResponsiveText size="sm" color="muted" className="mb-4">
              {initiative.description}
            </ResponsiveText>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-semibold text-foreground">{initiative.investment}</div>
                <div className="text-xs text-muted-foreground">Investment</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-primary">{initiative.timeline}</div>
                <div className="text-xs text-muted-foreground">Timeline</div>
              </div>
            </div>
          </ResponsiveCard>
        ))}
      </ResponsiveGrid>

      <div className="mt-12 text-center">
        <Button variant="hero" size="lg" className="mr-4">
          <Target className="w-5 h-5 mr-2" />
          View Full Strategy
        </Button>
        <Button variant="outline" size="lg">
          <TrendingUp className="w-5 h-5 mr-2" />
          Financial Projections
        </Button>
      </div>
    </ResponsiveContainer>
  );
};