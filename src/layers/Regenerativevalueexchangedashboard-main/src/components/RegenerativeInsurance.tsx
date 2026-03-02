import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  Shield, 
  Umbrella,
  AlertTriangle,
  TrendingUp,
  FileCheck,
  Calendar,
  DollarSign,
  Users,
  Zap,
  CheckCircle2,
  Clock,
  Award,
  Target,
  BarChart3
} from 'lucide-react';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';

interface InsuranceProduct {
  id: string;
  name: string;
  type: 'parametric' | 'traditional' | 'peer-to-peer';
  coverage: string;
  premium: number;
  payout: number;
  duration: string;
  coverageAreas: string[];
  riskScore: number;
  participants: number;
}

interface Claim {
  id: string;
  policyId: string;
  type: string;
  amount: number;
  status: 'pending' | 'under_review' | 'approved' | 'paid' | 'rejected';
  filedDate: Date;
  evidence: string[];
  aiVerification: number;
}

interface Policy {
  id: string;
  product: string;
  coverage: number;
  premium: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
  claimsCount: number;
}

const insuranceProducts: InsuranceProduct[] = [
  {
    id: 'CROP-001',
    name: 'Regenerative Agriculture Insurance',
    type: 'parametric',
    coverage: 'Crop failure, soil degradation, extreme weather',
    premium: 2500,
    payout: 50000,
    duration: '12 months',
    coverageAreas: ['Drought', 'Flood', 'Soil Health', 'Biodiversity Loss'],
    riskScore: 32,
    participants: 145
  },
  {
    id: 'FOREST-001',
    name: 'Forest Carbon Insurance',
    type: 'parametric',
    coverage: 'Wildfire, deforestation, carbon credit reversal',
    premium: 5000,
    payout: 100000,
    duration: '24 months',
    coverageAreas: ['Wildfire', 'Illegal Logging', 'Carbon Reversal', 'Pest Outbreak'],
    riskScore: 45,
    participants: 87
  },
  {
    id: 'BIO-001',
    name: 'Biodiversity Protection Insurance',
    type: 'peer-to-peer',
    coverage: 'Species extinction, habitat loss',
    premium: 1500,
    payout: 30000,
    duration: '12 months',
    coverageAreas: ['Habitat Destruction', 'Poaching', 'Disease Outbreak'],
    riskScore: 28,
    participants: 203
  },
  {
    id: 'CLIMATE-001',
    name: 'Climate Impact Insurance',
    type: 'traditional',
    coverage: 'Sea level rise, extreme weather events',
    premium: 7500,
    payout: 200000,
    duration: '36 months',
    coverageAreas: ['Hurricane', 'Flooding', 'Heat Wave', 'Storm Surge'],
    riskScore: 52,
    participants: 64
  }
];

const mockClaims: Claim[] = [
  {
    id: 'CLM-001',
    policyId: 'POL-12345',
    type: 'Drought Damage',
    amount: 25000,
    status: 'approved',
    filedDate: new Date('2026-01-28'),
    evidence: ['Satellite imagery', 'Soil moisture data', 'Weather records'],
    aiVerification: 94
  },
  {
    id: 'CLM-002',
    policyId: 'POL-67890',
    type: 'Wildfire',
    amount: 80000,
    status: 'under_review',
    filedDate: new Date('2026-01-30'),
    evidence: ['Satellite imagery', 'Local reports', 'Carbon assessment'],
    aiVerification: 87
  }
];

const mockPolicies: Policy[] = [
  {
    id: 'POL-12345',
    product: 'Regenerative Agriculture Insurance',
    coverage: 50000,
    premium: 2500,
    startDate: new Date('2025-08-01'),
    endDate: new Date('2026-08-01'),
    status: 'active',
    claimsCount: 1
  },
  {
    id: 'POL-67890',
    product: 'Forest Carbon Insurance',
    coverage: 100000,
    premium: 5000,
    startDate: new Date('2025-06-15'),
    endDate: new Date('2027-06-15'),
    status: 'active',
    claimsCount: 1
  }
];

export function RegenerativeInsurance() {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [coverageAmount, setCoverageAmount] = useState<string>('');
  const [autoRenewal, setAutoRenewal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
      case 'active':
        return 'text-emerald-400 bg-emerald-500/20';
      case 'under_review':
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'rejected':
      case 'cancelled':
        return 'text-red-400 bg-red-500/20';
      case 'expired':
        return 'text-gray-400 bg-gray-500/20';
      default:
        return 'text-blue-400 bg-blue-500/20';
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-emerald-400';
    if (score < 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white mb-2">Regenerative Insurance</h2>
        <p className="text-emerald-300/70">
          Parametric and peer-to-peer insurance for regenerative projects
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Shield, label: 'Total Coverage', value: '$380K', color: 'emerald' },
          { icon: DollarSign, label: 'Pool Reserves', value: '$2.4M', color: 'blue' },
          { icon: FileCheck, label: 'Active Policies', value: '499', color: 'purple' },
          { icon: Users, label: 'Protected Projects', value: '312', color: 'amber' }
        ].map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx} className="bg-emerald-900/20 border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg bg-${metric.color}-400/10 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${metric.color}-400`} />
                  </div>
                </div>
                <div className="text-sm text-emerald-300/70 mb-1">{metric.label}</div>
                <div className="text-white text-2xl">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="bg-emerald-900/20 border border-emerald-500/20">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="purchase">Purchase</TabsTrigger>
          <TabsTrigger value="policies">My Policies</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="pool">Insurance Pool</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {insuranceProducts.map((product) => (
              <Card key={product.id} className="bg-emerald-900/20 border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white">{product.name}</h3>
                        <Badge className={product.type === 'parametric' ? 'bg-blue-500/20 text-blue-400 border-0' : product.type === 'peer-to-peer' ? 'bg-purple-500/20 text-purple-400 border-0' : 'bg-emerald-500/20 text-emerald-400 border-0'}>
                          {product.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-emerald-300/70 mb-4">{product.coverage}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-emerald-300/50 mb-1">Premium</div>
                          <div className="text-white">${product.premium.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-emerald-300/50 mb-1">Max Payout</div>
                          <div className="text-white">${product.payout.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-emerald-300/50 mb-1">Duration</div>
                          <div className="text-white">{product.duration}</div>
                        </div>
                        <div>
                          <div className="text-xs text-emerald-300/50 mb-1">Participants</div>
                          <div className="text-white">{product.participants}</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-xs text-emerald-300/50 mb-2">Coverage Areas</div>
                        <div className="flex flex-wrap gap-2">
                          {product.coverageAreas.map((area, idx) => (
                            <Badge key={idx} variant="outline" className="border-emerald-500/30 text-emerald-300/70">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-emerald-300/50">Risk Score</span>
                            <span className={getRiskColor(product.riskScore)}>{product.riskScore}/100</span>
                          </div>
                          <Progress value={product.riskScore} className="h-1.5" />
                        </div>
                        <Button 
                          className="bg-emerald-500 hover:bg-emerald-600 text-white"
                          onClick={() => setSelectedProduct(product.id)}
                        >
                          Get Quote
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* How It Works */}
          <Card className="bg-emerald-900/20 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-white">How Regenerative Insurance Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Shield,
                    title: 'Parametric Triggers',
                    description: 'Automatic payouts based on verifiable data from oracles (satellite, IoT sensors, weather stations)'
                  },
                  {
                    icon: Zap,
                    title: 'Instant Claims',
                    description: 'AI-powered verification processes claims in minutes, not weeks or months'
                  },
                  {
                    icon: Users,
                    title: 'Peer-to-Peer Pools',
                    description: 'Community-funded insurance pools where members share risk and rewards'
                  }
                ].map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div key={idx} className="text-center">
                      <div className="w-12 h-12 rounded-lg bg-emerald-400/10 flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h4 className="text-white mb-2">{feature.title}</h4>
                      <p className="text-sm text-emerald-300/70">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Tab */}
        <TabsContent value="purchase" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-emerald-900/20 border-emerald-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Purchase Insurance Policy</CardTitle>
                  <CardDescription className="text-emerald-300/70">
                    Configure your coverage and protection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-emerald-300/90">Select Insurance Product</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger className="bg-emerald-950/50 border-emerald-500/30 text-white">
                        <SelectValue placeholder="Choose a product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {insuranceProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedProduct && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-emerald-300/90">Coverage Amount</Label>
                        <Input
                          type="number"
                          placeholder="Enter coverage amount"
                          value={coverageAmount}
                          onChange={(e) => setCoverageAmount(e.target.value)}
                          className="bg-emerald-950/50 border-emerald-500/30 text-white"
                        />
                        <p className="text-xs text-emerald-300/50">
                          Maximum: ${insuranceProducts.find(p => p.id === selectedProduct)?.payout.toLocaleString()}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-emerald-300/90">Project Location</Label>
                        <Input
                          type="text"
                          placeholder="Enter coordinates or address"
                          className="bg-emerald-950/50 border-emerald-500/30 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-emerald-300/90">Project Type</Label>
                        <Select>
                          <SelectTrigger className="bg-emerald-950/50 border-emerald-500/30 text-white">
                            <SelectValue placeholder="Select project type..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="forest">Forest Restoration</SelectItem>
                            <SelectItem value="agriculture">Regenerative Agriculture</SelectItem>
                            <SelectItem value="marine">Marine Conservation</SelectItem>
                            <SelectItem value="grassland">Grassland Management</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-emerald-300/90">Project Description</Label>
                        <Textarea
                          placeholder="Describe your regenerative project..."
                          className="bg-emerald-950/50 border-emerald-500/30 text-white"
                          rows={4}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-emerald-950/30 rounded-lg border border-emerald-500/20">
                        <div>
                          <Label className="text-emerald-300/90">Auto-renewal</Label>
                          <p className="text-xs text-emerald-300/50">Automatically renew policy when it expires</p>
                        </div>
                        <Switch checked={autoRenewal} onCheckedChange={setAutoRenewal} />
                      </div>

                      <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                        Get Quote & Purchase
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              {selectedProduct && (
                <>
                  <Card className="bg-emerald-900/20 border-emerald-500/20">
                    <CardHeader>
                      <CardTitle className="text-white">Quote Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-300/70">Base Premium</span>
                          <span className="text-white">
                            ${insuranceProducts.find(p => p.id === selectedProduct)?.premium.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-300/70">Risk Adjustment</span>
                          <span className="text-white">$350</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-300/70">Pool Fee (5%)</span>
                          <span className="text-white">$125</span>
                        </div>
                        <div className="border-t border-emerald-500/20 pt-3">
                          <div className="flex justify-between">
                            <span className="text-emerald-300/90">Total Annual Premium</span>
                            <span className="text-emerald-400 text-lg">$2,975</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-emerald-500/20">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-emerald-300/70">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Instant coverage activation</span>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-300/70">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>AI-powered claims processing</span>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-300/70">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Parametric triggers verified</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-emerald-900/20 border-emerald-500/20 mt-4">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Coverage Details</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-emerald-300/70 space-y-2">
                      <p>Maximum payout: ${insuranceProducts.find(p => p.id === selectedProduct)?.payout.toLocaleString()}</p>
                      <p>Duration: {insuranceProducts.find(p => p.id === selectedProduct)?.duration}</p>
                      <p>Claim processing: 24-48 hours</p>
                      <p>Deductible: None (parametric)</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* My Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <Card className="bg-emerald-900/20 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-white">Active Insurance Policies</CardTitle>
              <CardDescription className="text-emerald-300/70">
                Manage your coverage and protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPolicies.map((policy) => (
                  <div
                    key={policy.id}
                    className="p-4 bg-emerald-950/30 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white">{policy.product}</h4>
                          <Badge className={getStatusColor(policy.status) + ' border-0'}>
                            {policy.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-emerald-300/50">{policy.id}</p>
                      </div>
                      <Umbrella className="w-5 h-5 text-emerald-400" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <div className="text-emerald-300/50 mb-1">Coverage</div>
                        <div className="text-white">${policy.coverage.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-emerald-300/50 mb-1">Premium</div>
                        <div className="text-white">${policy.premium.toLocaleString()}/year</div>
                      </div>
                      <div>
                        <div className="text-emerald-300/50 mb-1">Expires</div>
                        <div className="text-white">{policy.endDate.toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-emerald-300/50 mb-1">Claims Filed</div>
                        <div className="text-white">{policy.claimsCount}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10">
                        View Details
                      </Button>
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                        File Claim
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claims Tab */}
        <TabsContent value="claims" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-white">Insurance Claims</h3>
              <p className="text-sm text-emerald-300/70">Track and manage your claims</p>
            </div>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              File New Claim
            </Button>
          </div>

          <div className="space-y-4">
            {mockClaims.map((claim) => (
              <Card key={claim.id} className="bg-emerald-900/20 border-emerald-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-white">{claim.type}</h4>
                        <Badge className={getStatusColor(claim.status) + ' border-0'}>
                          {claim.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-emerald-300/50 mb-3">
                        Claim ID: {claim.id} • Policy: {claim.policyId}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <div className="text-emerald-300/50 mb-1">Claim Amount</div>
                          <div className="text-white">${claim.amount.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-emerald-300/50 mb-1">Filed Date</div>
                          <div className="text-white">{claim.filedDate.toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-emerald-300/50 mb-1">AI Verification</div>
                          <div className={claim.aiVerification >= 90 ? 'text-emerald-400' : 'text-yellow-400'}>
                            {claim.aiVerification}%
                          </div>
                        </div>
                        <div>
                          <div className="text-emerald-300/50 mb-1">Evidence Items</div>
                          <div className="text-white">{claim.evidence.length}</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-xs text-emerald-300/50 mb-2">Supporting Evidence</div>
                        <div className="flex flex-wrap gap-2">
                          {claim.evidence.map((item, idx) => (
                            <Badge key={idx} variant="outline" className="border-emerald-500/30 text-emerald-300/70">
                              <FileCheck className="w-3 h-3 mr-1" />
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {claim.status === 'under_review' && (
                        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                          <div className="flex items-center gap-2 text-blue-400 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>Estimated processing time: 24-48 hours</span>
                          </div>
                        </div>
                      )}

                      {claim.status === 'approved' && (
                        <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                          <div className="flex items-center gap-2 text-emerald-400 text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Claim approved. Payout will be transferred within 24 hours.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insurance Pool Tab */}
        <TabsContent value="pool" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-emerald-900/20 border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div className="text-sm text-emerald-300/70 mb-1">Pool Reserves</div>
                <div className="text-white text-2xl">$2.4M</div>
                <div className="text-sm text-emerald-300/50 mt-1">85% capitalization ratio</div>
              </CardContent>
            </Card>

            <Card className="bg-emerald-900/20 border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div className="text-sm text-emerald-300/70 mb-1">Claims Paid</div>
                <div className="text-white text-2xl">$385K</div>
                <div className="text-sm text-emerald-300/50 mt-1">32 claims this year</div>
              </CardContent>
            </Card>

            <Card className="bg-emerald-900/20 border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-400/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
                <div className="text-sm text-emerald-300/70 mb-1">Avg. APY</div>
                <div className="text-white text-2xl">8.5%</div>
                <div className="text-sm text-emerald-300/50 mt-1">For liquidity providers</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-emerald-900/20 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-white">Become a Liquidity Provider</CardTitle>
              <CardDescription className="text-emerald-300/70">
                Earn yield by providing capital to the insurance pool
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-emerald-300/90">Deposit Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount in USDC"
                    className="bg-emerald-950/50 border-emerald-500/30 text-white mt-2"
                  />
                </div>
                <div>
                  <Label className="text-emerald-300/90">Lock Period</Label>
                  <Select>
                    <SelectTrigger className="bg-emerald-950/50 border-emerald-500/30 text-white mt-2">
                      <SelectValue placeholder="Select lock period..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days (6% APY)</SelectItem>
                      <SelectItem value="90">90 days (8% APY)</SelectItem>
                      <SelectItem value="180">180 days (10% APY)</SelectItem>
                      <SelectItem value="365">365 days (12% APY)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-emerald-950/30 rounded-lg border border-emerald-500/20">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-emerald-300/70">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Your capital helps protect regenerative projects</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300/70">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Earn passive income from premiums</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300/70">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Risk is pooled across all participants</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                Deposit & Start Earning
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
