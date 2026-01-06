import React from 'react';
import { Coins, TrendingUp, Users, Zap, Shield, Globe } from 'lucide-react';

export const TokenomicsEngine = () => {
  const tokenMetrics = [
    { label: 'Total Supply', value: '1B RIU', description: 'Fixed supply with deflationary mechanics' },
    { label: 'Circulating', value: '247M RIU', description: '24.7% of total supply in circulation' },
    { label: 'Staked', value: '156M RIU', description: '63% of circulating supply staked' },
    { label: 'Burned', value: '12.3M RIU', description: 'Quarterly burns from transaction fees' }
  ];

  const valueAccrual = [
    { mechanism: 'Transaction Fees', percentage: '2.5%', flow: 'Burned (50%) + Stakers (30%) + Treasury (20%)' },
    { mechanism: 'Verification Rewards', percentage: '0.5%', flow: 'Node operators and validators' },
    { mechanism: 'Governance Staking', percentage: '8.5%', flow: 'Annual yield for governance participation' },
    { mechanism: 'Liquidity Mining', percentage: '12%', flow: 'LP rewards for market making' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold mb-6">RIU Tokenomics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tokenMetrics.map((metric, index) => (
            <div key={index} className="p-4 rounded-lg bg-card border border-border">
              <div className="text-lg font-semibold text-foreground mb-1">{metric.value}</div>
              <div className="text-sm font-medium text-muted-foreground mb-2">{metric.label}</div>
              <div className="text-xs text-muted-foreground">{metric.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Value Accrual Mechanisms</h3>
        <div className="space-y-3">
          {valueAccrual.map((mechanism, index) => (
            <div key={index} className="p-4 rounded-lg bg-muted/20 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{mechanism.mechanism}</span>
                <span className="text-sm font-semibold text-primary">{mechanism.percentage}</span>
              </div>
              <div className="text-sm text-muted-foreground">{mechanism.flow}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const RevenueModel = () => {
  const revenueBreakdown = [
    { source: 'Marketplace Fees', amount: '$847M', percentage: '64%', growth: '+156%' },
    { source: 'SaaS Subscriptions', amount: '$234M', percentage: '18%', growth: '+89%' },
    { source: 'Verification Services', amount: '$156M', percentage: '12%', growth: '+234%' },
    { source: 'Data Licensing', amount: '$89M', percentage: '6%', growth: '+67%' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Revenue Architecture - $1.32B ARR</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {revenueBreakdown.map((revenue, index) => (
          <div key={index} className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">{revenue.source}</h4>
              <span className="text-sm text-muted-foreground">{revenue.percentage}</span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-2">{revenue.amount}</div>
            <div className="text-sm text-emerald-600 font-medium">{revenue.growth} YoY</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const UnitEconomics = () => {
  const metrics = [
    { metric: 'Customer LTV', value: '$2.3M', benchmark: 'Top 5%' },
    { metric: 'Customer CAC', value: '$12K', benchmark: 'Best in class' },
    { metric: 'LTV/CAC Ratio', value: '192x', benchmark: 'Exceptional' },
    { metric: 'Gross Margin', value: '87%', benchmark: 'Industry leading' },
    { metric: 'Payback Period', value: '4.2mo', benchmark: 'Top quartile' },
    { metric: 'Net Revenue Retention', value: '156%', benchmark: 'Elite tier' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Unit Economics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((item, index) => (
          <div key={index} className="p-4 rounded-lg bg-muted/20 border border-border/50 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{item.value}</div>
            <div className="text-sm font-medium text-foreground mb-1">{item.metric}</div>
            <div className="text-xs text-muted-foreground">{item.benchmark}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MarketStrategy = () => {
  const segments = [
    {
      segment: 'Enterprise (Fortune 500)',
      tam: '$1.2T',
      strategy: 'Direct sales, custom solutions, multi-year contracts',
      arpu: '$47K',
      customers: '2,847'
    },
    {
      segment: 'Mid-Market & SMB',
      tam: '$340B',
      strategy: 'Self-serve platform, channel partnerships',
      arpu: '$1.2K',
      customers: '23,456'
    },
    {
      segment: 'Individual Investors',
      tam: '$89B',
      strategy: 'Mobile app, social features, gamification',
      arpu: '$156',
      customers: '847K'
    },
    {
      segment: 'Government & NGOs',
      tam: '$567B',
      strategy: 'Policy partnerships, compliance tools',
      arpu: '$3.2M',
      customers: '89'
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Go-to-Market Strategy</h3>
      <div className="space-y-4">
        {segments.map((segment, index) => (
          <div key={index} className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold">{segment.segment}</h4>
              <span className="text-sm font-medium text-primary">TAM: {segment.tam}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{segment.strategy}</p>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">ARPU: </span>
                <span className="font-medium">{segment.arpu}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Customers: </span>
                <span className="font-medium">{segment.customers}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};