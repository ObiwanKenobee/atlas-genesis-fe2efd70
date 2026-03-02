import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Building2, Briefcase, TrendingUp, Shield, CheckCircle2, Clock, DollarSign, Users } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function InstitutionalPartnerships() {
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);

  // Partner tiers
  const partnerTiers = [
    {
      tier: 'Platinum',
      count: 5,
      minInvestment: 50000000,
      benefits: ['Custom integration', 'Dedicated support', 'Governance voting', 'White-label access'],
      color: '#E5E7EB'
    },
    {
      tier: 'Gold',
      count: 12,
      minInvestment: 10000000,
      benefits: ['Priority access', 'API integration', 'Quarterly reviews', 'Co-marketing'],
      color: '#F59E0B'
    },
    {
      tier: 'Silver',
      count: 28,
      minInvestment: 1000000,
      benefits: ['Standard access', 'Technical support', 'Monthly reports'],
      color: '#9CA3AF'
    },
    {
      tier: 'Bronze',
      count: 47,
      minInvestment: 100000,
      benefits: ['Platform access', 'Email support', 'Basic analytics'],
      color: '#CD7F32'
    },
  ];

  // Featured institutional partners
  const institutions = [
    {
      id: 'IFC',
      name: 'International Finance Corporation',
      type: 'Development Finance',
      tier: 'Platinum',
      investment: 75000000,
      projects: 23,
      since: '2025-01',
      focus: 'Emerging Markets Conservation',
      status: 'active'
    },
    {
      id: 'GCF',
      name: 'Green Climate Fund',
      type: 'Climate Finance',
      tier: 'Platinum',
      investment: 120000000,
      projects: 34,
      since: '2024-11',
      focus: 'Climate Adaptation & Mitigation',
      status: 'active'
    },
    {
      id: 'BlackRock',
      name: 'BlackRock Sustainable Investing',
      type: 'Asset Management',
      tier: 'Platinum',
      investment: 200000000,
      projects: 18,
      since: '2025-03',
      focus: 'ESG Portfolio Integration',
      status: 'active'
    },
    {
      id: 'HSBC',
      name: 'HSBC Climate Solutions',
      type: 'Banking',
      tier: 'Gold',
      investment: 45000000,
      projects: 12,
      since: '2025-02',
      focus: 'Green Bonds & Carbon Credits',
      status: 'active'
    },
    {
      id: 'Vanguard',
      name: 'Vanguard ESG Funds',
      type: 'Asset Management',
      tier: 'Gold',
      investment: 38000000,
      projects: 9,
      since: '2025-04',
      focus: 'Biodiversity Investment',
      status: 'active'
    },
  ];

  // Investment pipeline
  const pipeline = [
    {
      stage: 'Closed Deals',
      count: 18,
      value: 524000000,
      prospects: ['BlackRock', 'Green Climate Fund', 'IFC']
    },
    {
      stage: 'Final Negotiation',
      count: 12,
      value: 287000000,
      prospects: ['Deutsche Bank ESG', 'AXA Climate', 'Prudential Impact']
    },
    {
      stage: 'Due Diligence',
      count: 23,
      value: 412000000,
      prospects: ['Goldman Sachs Sustainable', 'Citi Green Banking', 'BNP Paribas']
    },
    {
      stage: 'Initial Discussions',
      count: 34,
      value: 156000000,
      prospects: ['Morgan Stanley ESG', 'UBS Wealth', 'Credit Suisse Impact']
    },
  ];

  // Partnership growth
  const partnershipGrowth = [
    { quarter: 'Q1 2025', partners: 12, aum: 145000000 },
    { quarter: 'Q2 2025', partners: 28, aum: 298000000 },
    { quarter: 'Q3 2025', partners: 54, aum: 467000000 },
    { quarter: 'Q4 2025', partners: 92, aum: 724000000 },
  ];

  // Partner type distribution
  const partnerTypes = [
    { name: 'Asset Managers', value: 35, count: 32, color: '#10b981' },
    { name: 'Banks', value: 25, count: 23, color: '#3b82f6' },
    { name: 'Development Finance', value: 15, count: 14, color: '#8b5cf6' },
    { name: 'Insurance', value: 12, count: 11, color: '#f59e0b' },
    { name: 'Pension Funds', value: 8, count: 7, color: '#ec4899' },
    { name: 'Others', value: 5, count: 5, color: '#64748b' },
  ];

  // Custody solutions
  const custodySolutions = [
    {
      provider: 'Fireblocks Enterprise',
      aum: 324000000,
      clients: 12,
      features: ['Multi-sig', 'Cold storage', 'Insurance', 'Audit trail']
    },
    {
      provider: 'Copper Custody',
      aum: 218000000,
      clients: 8,
      features: ['Institutional-grade', 'Offline signing', 'Real-time monitoring']
    },
    {
      provider: 'Anchorage Digital',
      aum: 182000000,
      clients: 6,
      features: ['Bank-grade security', 'Regulatory compliance', 'Delegated staking']
    },
  ];

  // Service offerings
  const services = [
    {
      icon: Building2,
      title: 'Custom Integration',
      description: 'Tailored API and data feeds for institutional systems',
      clients: 18,
      satisfaction: 98
    },
    {
      icon: Shield,
      title: 'Institutional Custody',
      description: 'Bank-grade security and insurance for digital assets',
      clients: 32,
      satisfaction: 99
    },
    {
      icon: Briefcase,
      title: 'Compliance & Reporting',
      description: 'Automated regulatory reporting and audit trails',
      clients: 45,
      satisfaction: 97
    },
    {
      icon: Users,
      title: 'Dedicated Support',
      description: '24/7 support team with SLA guarantees',
      clients: 28,
      satisfaction: 96
    },
  ];

  const totalAUM = institutions.reduce((sum, inst) => sum + inst.investment, 0);
  const totalPartners = partnerTiers.reduce((sum, tier) => sum + tier.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white mb-2">Institutional Partnerships</h2>
        <p className="text-emerald-300/70">Enterprise-grade solutions for institutional investors and financial institutions</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Total Partners</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">{totalPartners}</div>
          <div className="text-emerald-400 text-sm">Across 4 tiers</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">AUM</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">${(totalAUM / 1000000).toFixed(0)}M</div>
          <div className="text-emerald-400 text-sm">Assets under management</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Pipeline Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">$855M</div>
          <div className="text-emerald-400 text-sm">In active negotiations</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Satisfaction</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">97.5%</div>
          <div className="text-emerald-400 text-sm">Client satisfaction rate</div>
        </Card>
      </div>

      {/* Partner Tiers */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Partnership Tiers</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {partnerTiers.map((tier) => (
            <div key={tier.tier} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tier.color }}
                />
                <h4 className="text-white font-medium">{tier.tier}</h4>
              </div>
              
              <div className="mb-3">
                <div className="text-emerald-300/70 text-xs">Partners</div>
                <div className="text-white text-2xl font-medium">{tier.count}</div>
              </div>

              <div className="mb-3">
                <div className="text-emerald-300/70 text-xs">Min Investment</div>
                <div className="text-white font-medium">
                  ${(tier.minInvestment / 1000000).toFixed(0)}M+
                </div>
              </div>

              <div>
                <div className="text-emerald-300/70 text-xs mb-2">Benefits</div>
                <div className="space-y-1">
                  {tier.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-white text-xs">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Featured Institutional Partners */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Featured Institutional Partners</h3>
        
        <div className="space-y-3">
          {institutions.map((institution) => (
            <div
              key={institution.id}
              className={`bg-slate-900/50 border rounded-lg p-4 cursor-pointer transition-all ${
                selectedPartner === institution.id
                  ? 'border-emerald-400 bg-emerald-400/10'
                  : 'border-emerald-500/20 hover:border-emerald-400/50'
              }`}
              onClick={() => setSelectedPartner(institution.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <Building2 className="w-6 h-6 text-emerald-400 mt-1" />
                  <div>
                    <h4 className="text-white font-medium">{institution.name}</h4>
                    <div className="text-emerald-300/70 text-sm mt-1">{institution.type}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge 
                    className={
                      institution.tier === 'Platinum'
                        ? 'bg-gray-400/20 text-gray-200 border-gray-400/30'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }
                  >
                    {institution.tier}
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    {institution.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-3">
                <div>
                  <div className="text-emerald-300/70 text-xs">Investment</div>
                  <div className="text-white font-medium">${(institution.investment / 1000000).toFixed(0)}M</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Projects</div>
                  <div className="text-white font-medium">{institution.projects}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Partner Since</div>
                  <div className="text-white font-medium">{institution.since}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Focus Area</div>
                  <div className="text-white font-medium text-sm">{institution.focus}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Partnership Growth */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Partnership & AUM Growth</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={partnershipGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="quarter" stroke="#6ee7b7" />
            <YAxis yAxisId="left" stroke="#6ee7b7" />
            <YAxis yAxisId="right" orientation="right" stroke="#6ee7b7" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b98150' }}
              labelStyle={{ color: '#6ee7b7' }}
            />
            <Bar yAxisId="left" dataKey="partners" fill="#10b981" name="Partners" />
            <Bar yAxisId="right" dataKey="aum" fill="#3b82f6" name="AUM ($M)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Partner Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">Partner Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={partnerTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {partnerTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b98150' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Investment Pipeline */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">Investment Pipeline</h3>
          <div className="space-y-3">
            {pipeline.map((stage, index) => (
              <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{stage.stage}</h4>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    {stage.count} deals
                  </Badge>
                </div>
                <div className="text-emerald-400 font-medium text-lg mb-2">
                  ${(stage.value / 1000000).toFixed(0)}M
                </div>
                <div className="text-emerald-300/70 text-sm">
                  Top prospects: {stage.prospects.slice(0, 2).join(', ')}...
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Custody Solutions */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Institutional Custody Solutions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {custodySolutions.map((solution, index) => (
            <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h4 className="text-white font-medium">{solution.provider}</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-emerald-300/70 text-xs">AUM</div>
                  <div className="text-white font-medium">${(solution.aum / 1000000).toFixed(0)}M</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Clients</div>
                  <div className="text-white font-medium">{solution.clients}</div>
                </div>
              </div>

              <div>
                <div className="text-emerald-300/70 text-xs mb-2">Features</div>
                <div className="flex flex-wrap gap-1">
                  {solution.features.map((feature, fIndex) => (
                    <Badge key={fIndex} className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Service Offerings */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Institutional Services</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
                <div className="bg-emerald-500/20 p-3 rounded-lg w-fit mb-3">
                  <Icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-white font-medium mb-2">{service.title}</h4>
                <p className="text-emerald-300/70 text-sm mb-4">{service.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-emerald-300/70 text-xs">Clients</div>
                    <div className="text-white font-medium">{service.clients}</div>
                  </div>
                  <div>
                    <div className="text-emerald-300/70 text-xs">Satisfaction</div>
                    <div className="text-emerald-400 font-medium">{service.satisfaction}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Contact CTA */}
      <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-white mb-2">Interested in an Institutional Partnership?</h3>
          <p className="text-emerald-300/70 mb-6">
            Our team is ready to discuss custom solutions for your organization
          </p>
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
            Schedule a Consultation
          </Button>
        </div>
      </Card>
    </div>
  );
}
