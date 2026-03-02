import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  Palette, 
  Code, 
  Globe, 
  Zap,
  Shield,
  Sparkles,
  Download,
  Copy,
  CheckCircle2,
  Settings,
  Eye,
  Smartphone,
  Monitor,
  Users,
  CreditCard,
  BarChart3,
  Lock
} from 'lucide-react';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface WhiteLabelClient {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'pending' | 'suspended';
  plan: 'starter' | 'professional' | 'enterprise';
  users: number;
  monthlyVolume: number;
  createdAt: Date;
  customization: {
    primaryColor: string;
    logo: string;
    features: string[];
  };
}

const mockClients: WhiteLabelClient[] = [
  {
    id: 'WL-001',
    name: 'Amazon Basin Conservation Alliance',
    domain: 'abca.regen',
    status: 'active',
    plan: 'enterprise',
    users: 1250,
    monthlyVolume: 5600000,
    createdAt: new Date('2025-09-15'),
    customization: {
      primaryColor: '#10b981',
      logo: 'abca-logo.png',
      features: ['Trading', 'Impact Tracking', 'Custom Tokens', 'API Access']
    }
  },
  {
    id: 'WL-002',
    name: 'Pacific Island Climate Initiative',
    domain: 'pici.regen',
    status: 'active',
    plan: 'professional',
    users: 450,
    monthlyVolume: 1200000,
    createdAt: new Date('2025-11-03'),
    customization: {
      primaryColor: '#06b6d4',
      logo: 'pici-logo.png',
      features: ['Trading', 'Impact Tracking', 'Reports']
    }
  },
  {
    id: 'WL-003',
    name: 'African Grasslands Restoration Fund',
    domain: 'agrf.regen',
    status: 'pending',
    plan: 'starter',
    users: 120,
    monthlyVolume: 350000,
    createdAt: new Date('2026-01-20'),
    customization: {
      primaryColor: '#f59e0b',
      logo: 'agrf-logo.png',
      features: ['Trading', 'Impact Tracking']
    }
  }
];

const plans = [
  {
    name: 'Starter',
    price: 499,
    features: [
      'Custom branding',
      'Up to 500 users',
      'Basic trading features',
      'Impact tracking',
      'Email support',
      '10 API calls/sec'
    ],
    limits: {
      users: 500,
      volume: 1000000,
      apiCalls: 10
    }
  },
  {
    name: 'Professional',
    price: 1999,
    features: [
      'Full branding customization',
      'Up to 2,000 users',
      'Advanced trading features',
      'Custom impact metrics',
      'Priority support',
      '50 API calls/sec',
      'Custom domain',
      'White-label mobile app'
    ],
    limits: {
      users: 2000,
      volume: 10000000,
      apiCalls: 50
    }
  },
  {
    name: 'Enterprise',
    price: 7999,
    features: [
      'Unlimited customization',
      'Unlimited users',
      'Full platform features',
      'Custom integrations',
      'Dedicated support team',
      'Unlimited API calls',
      'Custom domains',
      'Native mobile apps',
      'On-premise deployment option',
      'SLA guarantee'
    ],
    limits: {
      users: -1,
      volume: -1,
      apiCalls: -1
    }
  }
];

export function WhiteLabelSolutions() {
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [brandName, setBrandName] = useState('');
  const [domain, setDomain] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    const code = `<!-- RVE White-Label Integration -->
<script src="https://cdn.rve.network/embed/v1/rve-embed.js"></script>
<script>
  RVE.init({
    clientId: 'your_client_id',
    theme: {
      primary: '${primaryColor}',
      brandName: '${brandName || 'Your Brand'}'
    },
    features: ['trading', 'impact', 'governance']
  });
</script>`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'suspended':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-500/20 text-purple-400';
      case 'professional':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-emerald-500/20 text-emerald-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white mb-2">White-Label Solutions</h2>
        <p className="text-emerald-300/70">
          Launch your own branded regenerative finance platform
        </p>
      </div>

      {/* Key Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Zap, label: 'Launch in Days', value: 'Deploy instantly', color: 'emerald' },
          { icon: Palette, label: 'Full Customization', value: 'Your brand identity', color: 'blue' },
          { icon: Shield, label: 'Enterprise Security', value: 'Bank-grade protection', color: 'purple' },
          { icon: Code, label: 'API Access', value: 'Complete integration', color: 'amber' }
        ].map((benefit, idx) => {
          const Icon = benefit.icon;
          return (
            <Card key={idx} className="bg-emerald-900/20 border-emerald-500/20">
              <CardContent className="pt-6">
                <div className={`w-10 h-10 rounded-lg bg-${benefit.color}-400/10 flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 text-${benefit.color}-400`} />
                </div>
                <div className="text-sm text-emerald-300/70 mb-1">{benefit.label}</div>
                <div className="text-white">{benefit.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="bg-emerald-900/20 border border-emerald-500/20">
          <TabsTrigger value="builder">Platform Builder</TabsTrigger>
          <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
          <TabsTrigger value="clients">Active Clients</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        {/* Platform Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-emerald-900/20 border-emerald-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Brand Configuration</CardTitle>
                  <CardDescription className="text-emerald-300/70">
                    Customize your platform appearance and identity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-emerald-300/90">Platform Name</Label>
                    <Input
                      type="text"
                      placeholder="Your Organization Name"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="bg-emerald-950/50 border-emerald-500/30 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-emerald-300/90">Custom Domain</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="yourdomain"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="bg-emerald-950/50 border-emerald-500/30 text-white"
                      />
                      <div className="flex items-center px-4 bg-emerald-950/50 border border-emerald-500/30 rounded-md text-emerald-300/70">
                        .regen
                      </div>
                    </div>
                    <p className="text-xs text-emerald-300/50">
                      Custom domains available on Professional and Enterprise plans
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-emerald-300/90">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-20 h-10 bg-emerald-950/50 border-emerald-500/30"
                      />
                      <Input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 bg-emerald-950/50 border-emerald-500/30 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-emerald-300/90">Logo Upload</Label>
                    <div className="border-2 border-dashed border-emerald-500/30 rounded-lg p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-emerald-300/70 text-sm">Click to upload or drag and drop</p>
                      <p className="text-emerald-300/50 text-xs mt-1">SVG, PNG, JPG (max. 2MB)</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-emerald-300/90">Tagline</Label>
                    <Textarea
                      placeholder="Brief description of your platform..."
                      className="bg-emerald-950/50 border-emerald-500/30 text-white"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-emerald-900/20 border-emerald-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Feature Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: 'trading', label: 'Asset Trading', desc: 'Enable buying and selling of regenerative assets' },
                    { id: 'governance', label: 'DAO Governance', desc: 'Community voting and proposals' },
                    { id: 'impact', label: 'Impact Tracking', desc: 'Real-time environmental metrics' },
                    { id: 'staking', label: 'Token Staking', desc: 'Earn rewards by staking tokens' },
                    { id: 'nft', label: 'NFT Marketplace', desc: 'Trade biodiversity and cultural NFTs' },
                    { id: 'defi', label: 'DeFi Features', desc: 'Yield farming and liquidity pools' }
                  ].map((feature) => (
                    <div key={feature.id} className="flex items-center justify-between p-4 bg-emerald-950/30 rounded-lg border border-emerald-500/20">
                      <div className="flex-1">
                        <div className="text-white mb-1">{feature.label}</div>
                        <p className="text-sm text-emerald-300/50">{feature.desc}</p>
                      </div>
                      <Switch />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Live Preview */}
            <div>
              <Card className="bg-emerald-900/20 border-emerald-500/20 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Desktop Preview */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-emerald-300/70">Desktop View</span>
                    </div>
                    <div 
                      className="border-2 border-emerald-500/30 rounded-lg p-4"
                      style={{ backgroundColor: `${primaryColor}10` }}
                    >
                      <div className="bg-white/10 backdrop-blur-sm rounded-t-lg p-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: primaryColor }}
                          />
                          <div className="text-white text-sm">{brandName || 'Your Platform'}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white/5 rounded h-20" />
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white/5 rounded h-12" />
                          <div className="bg-white/5 rounded h-12" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Preview */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-emerald-300/70">Mobile View</span>
                    </div>
                    <div className="max-w-[200px] mx-auto">
                      <div 
                        className="border-2 border-emerald-500/30 rounded-2xl p-2"
                        style={{ backgroundColor: `${primaryColor}10` }}
                      >
                        <div className="bg-white/10 backdrop-blur-sm rounded-t-lg p-2 mb-2">
                          <div 
                            className="w-6 h-6 rounded mx-auto"
                            style={{ backgroundColor: primaryColor }}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="bg-white/5 rounded h-12" />
                          <div className="bg-white/5 rounded h-8" />
                          <div className="bg-white/5 rounded h-8" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Deploy Platform
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Plans & Pricing Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, idx) => (
              <Card 
                key={idx} 
                className={`bg-emerald-900/20 border-emerald-500/20 hover:border-emerald-500/40 transition-all ${
                  plan.name.toLowerCase() === selectedPlan ? 'ring-2 ring-emerald-400' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-white">{plan.name}</CardTitle>
                    {plan.name === 'Enterprise' && (
                      <Badge className="bg-purple-500/20 text-purple-400 border-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl text-white">${plan.price}</span>
                    <span className="text-emerald-300/70">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, fidx) => (
                      <div key={fidx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-emerald-300/90">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className={`w-full ${
                      plan.name.toLowerCase() === selectedPlan
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : 'bg-emerald-900/50 hover:bg-emerald-900/70'
                    } text-white`}
                    onClick={() => setSelectedPlan(plan.name.toLowerCase())}
                  >
                    {plan.name.toLowerCase() === selectedPlan ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Table */}
          <Card className="bg-emerald-900/20 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-white">Feature Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-emerald-500/20">
                      <th className="text-left py-3 text-emerald-300/90">Feature</th>
                      {plans.map((plan, idx) => (
                        <th key={idx} className="text-center py-3 text-emerald-300/90">{plan.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'Monthly Users', values: ['500', '2,000', 'Unlimited'] },
                      { feature: 'Monthly Volume', values: ['$1M', '$10M', 'Unlimited'] },
                      { feature: 'API Calls/sec', values: ['10', '50', 'Unlimited'] },
                      { feature: 'Custom Branding', values: ['✓', '✓', '✓'] },
                      { feature: 'Mobile Apps', values: ['✗', '✓', '✓'] },
                      { feature: 'Custom Domain', values: ['✗', '✓', '✓'] },
                      { feature: 'SLA Guarantee', values: ['✗', '✗', '✓'] },
                      { feature: 'On-premise', values: ['✗', '✗', '✓'] }
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-emerald-500/10">
                        <td className="py-3 text-emerald-300/70">{row.feature}</td>
                        {row.values.map((value, vidx) => (
                          <td key={vidx} className="py-3 text-center text-white">{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Clients Tab */}
        <TabsContent value="clients" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white">Active White-Label Clients</h3>
              <p className="text-sm text-emerald-300/70">Manage deployed platforms</p>
            </div>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Deploy New Platform
            </Button>
          </div>

          <div className="space-y-4">
            {mockClients.map((client) => (
              <Card key={client.id} className="bg-emerald-900/20 border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white">{client.name}</h4>
                        <Badge className={getStatusColor(client.status) + ' border-0'}>
                          {client.status}
                        </Badge>
                        <Badge className={getPlanColor(client.plan) + ' border-0'}>
                          {client.plan}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-emerald-300/50">
                        <Globe className="w-4 h-4" />
                        <span>{client.domain}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <div className="text-emerald-300/50 mb-1">Active Users</div>
                      <div className="text-white">{client.users.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-emerald-300/50 mb-1">Monthly Volume</div>
                      <div className="text-white">${(client.monthlyVolume / 1000000).toFixed(1)}M</div>
                    </div>
                    <div>
                      <div className="text-emerald-300/50 mb-1">Deployed</div>
                      <div className="text-white">{client.createdAt.toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-emerald-300/50 mb-1">Features</div>
                      <div className="text-white">{client.customization.features.length}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {client.customization.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="border-emerald-500/30 text-emerald-300/70">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Embed Code */}
            <Card className="bg-emerald-900/20 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white">Embed Code</CardTitle>
                <CardDescription className="text-emerald-300/70">
                  Add RVE to your existing website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-lg p-4 relative">
                  <pre className="text-xs text-emerald-300 overflow-x-auto">
{`<!-- RVE White-Label Integration -->
<script src="https://cdn.rve.network/embed/v1/rve-embed.js"></script>
<script>
  RVE.init({
    clientId: 'your_client_id',
    theme: {
      primary: '${primaryColor}',
      brandName: '${brandName || 'Your Brand'}'
    },
    features: ['trading', 'impact', 'governance']
  });
</script>`}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                    onClick={handleCopyCode}
                  >
                    {copiedCode ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-emerald-300/90">Integration Type</Label>
                  <Select defaultValue="embed">
                    <SelectTrigger className="bg-emerald-950/50 border-emerald-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="embed">Embedded Widget</SelectItem>
                      <SelectItem value="iframe">iFrame Integration</SelectItem>
                      <SelectItem value="api">API Integration</SelectItem>
                      <SelectItem value="sdk">React/Vue SDK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Download SDK
                </Button>
              </CardContent>
            </Card>

            {/* API Documentation */}
            <Card className="bg-emerald-900/20 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white">API Documentation</CardTitle>
                <CardDescription className="text-emerald-300/70">
                  Build custom integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    method: 'POST',
                    endpoint: '/api/v1/assets',
                    desc: 'Create new regenerative asset',
                    color: 'emerald'
                  },
                  {
                    method: 'GET',
                    endpoint: '/api/v1/trades',
                    desc: 'Fetch trading history',
                    color: 'blue'
                  },
                  {
                    method: 'PUT',
                    endpoint: '/api/v1/impact',
                    desc: 'Update impact metrics',
                    color: 'amber'
                  },
                  {
                    method: 'DELETE',
                    endpoint: '/api/v1/orders/:id',
                    desc: 'Cancel trading order',
                    color: 'red'
                  }
                ].map((api, idx) => (
                  <div key={idx} className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`bg-${api.color}-500/20 text-${api.color}-400 border-0`}>
                        {api.method}
                      </Badge>
                      <code className="text-sm text-emerald-300 font-mono">{api.endpoint}</code>
                    </div>
                    <p className="text-sm text-emerald-300/70">{api.desc}</p>
                  </div>
                ))}

                <Button variant="outline" className="w-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10">
                  <Code className="w-4 h-4 mr-2" />
                  View Full Documentation
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Security & Compliance */}
          <Card className="bg-emerald-900/20 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-white">Security & Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Shield,
                    title: 'Enterprise Security',
                    desc: 'SOC 2 Type II, ISO 27001, GDPR compliant'
                  },
                  {
                    icon: Lock,
                    title: 'Data Protection',
                    desc: 'End-to-end encryption, secure key management'
                  },
                  {
                    icon: Users,
                    title: 'Access Control',
                    desc: 'Role-based permissions, audit logging'
                  }
                ].map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div key={idx} className="text-center">
                      <div className="w-12 h-12 rounded-lg bg-emerald-400/10 flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h4 className="text-white mb-2">{feature.title}</h4>
                      <p className="text-sm text-emerald-300/70">{feature.desc}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Upload component icon import
function Upload({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}
