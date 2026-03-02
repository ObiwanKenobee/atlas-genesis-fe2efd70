import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { User, Shield, Key, CheckCircle2, AlertCircle, Fingerprint, Globe, Lock, QrCode, Smartphone } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export function DecentralizedIdentity() {
  const [selectedDID, setSelectedDID] = useState<string | null>(null);

  // DID Methods supported
  const didMethods = [
    {
      method: 'did:ethr',
      name: 'Ethereum DID',
      standard: 'W3C',
      users: 45234,
      verifications: 128456,
      status: 'active',
      description: 'Ethereum-based decentralized identifiers'
    },
    {
      method: 'did:web',
      name: 'Web DID',
      standard: 'W3C',
      users: 23156,
      verifications: 67823,
      status: 'active',
      description: 'Web-based DID method using domain names'
    },
    {
      method: 'did:key',
      name: 'Key DID',
      standard: 'W3C',
      users: 18942,
      verifications: 45621,
      status: 'active',
      description: 'Cryptographic key-based identifiers'
    },
    {
      method: 'did:ceramic',
      name: 'Ceramic Network',
      standard: 'IPFS',
      users: 12478,
      verifications: 34209,
      status: 'active',
      description: 'Decentralized data network for verifiable credentials'
    },
  ];

  // Verifiable Credentials
  const credentials = [
    {
      id: 'VC-8472',
      type: 'Custodian Certification',
      issuer: 'RVE Governance',
      holder: '0x742d...3f91',
      issued: '2025-12-15',
      expires: '2026-12-15',
      status: 'active',
      verified: true
    },
    {
      id: 'VC-8471',
      type: 'Carbon Credit Verifier',
      issuer: 'Environmental DAO',
      holder: '0x923a...8c42',
      issued: '2025-11-28',
      expires: '2026-11-28',
      status: 'active',
      verified: true
    },
    {
      id: 'VC-8470',
      type: 'Indigenous Knowledge Keeper',
      issuer: 'Traditional Knowledge Graph',
      holder: '0x456b...2d83',
      issued: '2025-10-03',
      expires: '2027-10-03',
      status: 'active',
      verified: true
    },
    {
      id: 'VC-8469',
      type: 'Impact Reporter',
      issuer: 'RVE Oracle Network',
      holder: '0x189c...7f23',
      issued: '2025-09-12',
      expires: '2026-09-12',
      status: 'active',
      verified: true
    },
  ];

  // Identity growth data
  const growthData = [
    { month: 'Jan', dids: 12500, credentials: 34200 },
    { month: 'Feb', dids: 18400, credentials: 48600 },
    { month: 'Mar', dids: 24800, credentials: 67800 },
    { month: 'Apr', dids: 32100, credentials: 89200 },
    { month: 'May', dids: 41500, credentials: 115400 },
    { month: 'Jun', dids: 52300, credentials: 148900 },
  ];

  // Credential types distribution
  const credentialDistribution = [
    { name: 'Custodian', value: 35, color: '#10b981' },
    { name: 'Verifier', value: 28, color: '#3b82f6' },
    { name: 'Knowledge Keeper', value: 18, color: '#8b5cf6' },
    { name: 'Impact Reporter', value: 12, color: '#f59e0b' },
    { name: 'Other', value: 7, color: '#64748b' },
  ];

  // Authentication methods
  const authMethods = [
    {
      icon: Fingerprint,
      name: 'Biometric Auth',
      description: 'Fingerprint, Face ID, or other biometric methods',
      enabled: true,
      usage: 45
    },
    {
      icon: Key,
      name: 'Hardware Key',
      description: 'YubiKey, Ledger, or other hardware security keys',
      enabled: true,
      usage: 28
    },
    {
      icon: QrCode,
      name: 'QR Code',
      description: 'Scan QR code for quick authentication',
      enabled: true,
      usage: 18
    },
    {
      icon: Smartphone,
      name: 'Mobile Wallet',
      description: 'MetaMask, WalletConnect, or other wallet apps',
      enabled: true,
      usage: 62
    },
  ];

  // Privacy features
  const privacyFeatures = [
    {
      title: 'Selective Disclosure',
      description: 'Share only necessary information from credentials',
      implemented: true
    },
    {
      title: 'Zero-Knowledge Proofs',
      description: 'Prove attributes without revealing actual data',
      implemented: true
    },
    {
      title: 'Decentralized Storage',
      description: 'User controls where identity data is stored',
      implemented: true
    },
    {
      title: 'Revocation Registry',
      description: 'Real-time credential revocation checking',
      implemented: true
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white mb-2">Decentralized Identity (DID)</h2>
        <p className="text-emerald-300/70">Self-sovereign identity system based on W3C DID standards</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Total DIDs</span>
            <User className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">52,347</div>
          <div className="text-emerald-400 text-sm">+8.2% from last month</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Credentials Issued</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">148,942</div>
          <div className="text-emerald-400 text-sm">+15.7% from last month</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Verifications (24h)</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">12,456</div>
          <div className="text-emerald-400 text-sm">99.8% success rate</div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300/70 text-sm">Active Issuers</span>
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white text-2xl mb-1">234</div>
          <div className="text-emerald-400 text-sm">Trusted organizations</div>
        </Card>
      </div>

      {/* DID Methods */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Supported DID Methods</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {didMethods.map((method, index) => (
            <div 
              key={index}
              className={`bg-slate-900/50 border rounded-lg p-4 cursor-pointer transition-all ${
                selectedDID === method.method
                  ? 'border-emerald-400 bg-emerald-400/10'
                  : 'border-emerald-500/20 hover:border-emerald-400/50'
              }`}
              onClick={() => setSelectedDID(method.method)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{method.name}</h4>
                  <div className="text-emerald-300/70 text-sm mt-1">{method.method}</div>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                    {method.standard}
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    {method.status}
                  </Badge>
                </div>
              </div>
              
              <p className="text-emerald-300/70 text-sm mb-4">{method.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-emerald-300/70 text-xs">Users</div>
                  <div className="text-white font-medium">{method.users.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Verifications</div>
                  <div className="text-white font-medium">{method.verifications.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identity Growth */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">Identity System Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="month" stroke="#6ee7b7" />
              <YAxis stroke="#6ee7b7" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b98150' }}
                labelStyle={{ color: '#6ee7b7' }}
              />
              <Line type="monotone" dataKey="dids" stroke="#10b981" name="DIDs Created" strokeWidth={2} />
              <Line type="monotone" dataKey="credentials" stroke="#3b82f6" name="Credentials Issued" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Credential Distribution */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
          <h3 className="text-white mb-4">Credential Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={credentialDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {credentialDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b98150' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Verifiable Credentials */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Recent Verifiable Credentials</h3>
        
        <div className="space-y-2">
          {credentials.map((credential, index) => (
            <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {credential.verified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                  )}
                  <div>
                    <div className="text-white font-medium">{credential.type}</div>
                    <div className="text-emerald-300/70 text-sm">{credential.id}</div>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  {credential.status}
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-3">
                <div>
                  <div className="text-emerald-300/70 text-xs">Issuer</div>
                  <div className="text-white text-sm">{credential.issuer}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Holder</div>
                  <div className="text-white text-sm font-mono">{credential.holder}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Issued</div>
                  <div className="text-white text-sm">{credential.issued}</div>
                </div>
                <div>
                  <div className="text-emerald-300/70 text-xs">Expires</div>
                  <div className="text-white text-sm">{credential.expires}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Authentication Methods */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Authentication Methods</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {authMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-emerald-500/20 p-2 rounded-lg">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  {method.enabled && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                      enabled
                    </Badge>
                  )}
                </div>
                <h4 className="text-white font-medium mb-1">{method.name}</h4>
                <p className="text-emerald-300/70 text-sm mb-3">{method.description}</p>
                <div className="text-emerald-300/70 text-xs">Usage</div>
                <div className="text-white font-medium">{method.usage}% of users</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Privacy Features */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Privacy & Security Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {privacyFeatures.map((feature, index) => (
            <div key={index} className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-medium">{feature.title}</h4>
                {feature.implemented && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <p className="text-emerald-300/70 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* DID Document Example */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Example DID Document</h3>
        
        <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
          <pre className="text-emerald-300/70 text-sm overflow-x-auto">
{`{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:ethr:0x742d35Cc6634C0532925a3b844Bc9e7595f9e3f91",
  "verificationMethod": [{
    "id": "did:ethr:0x742d...3f91#keys-1",
    "type": "EcdsaSecp256k1VerificationKey2019",
    "controller": "did:ethr:0x742d...3f91",
    "publicKeyHex": "027560af3387d375e3342a6968179fab..."
  }],
  "authentication": [
    "did:ethr:0x742d...3f91#keys-1"
  ],
  "service": [{
    "id": "did:ethr:0x742d...3f91#vc-repository",
    "type": "VerifiableCredentialRepository",
    "serviceEndpoint": "https://ceramic.network/api/v1/..."
  }]
}`}
          </pre>
        </div>

        <Button className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
          Create Your DID
        </Button>
      </Card>

      {/* Use Cases */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-emerald-900/30 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">RVE Identity Use Cases</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
            <Shield className="w-8 h-8 text-emerald-400 mb-3" />
            <h4 className="text-white font-medium mb-2">Custodian Certification</h4>
            <p className="text-emerald-300/70 text-sm">
              Verifiable credentials for land stewards and ecosystem custodians
            </p>
          </div>

          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
            <User className="w-8 h-8 text-blue-400 mb-3" />
            <h4 className="text-white font-medium mb-2">Traditional Knowledge</h4>
            <p className="text-emerald-300/70 text-sm">
              Indigenous knowledge keepers with verified cultural credentials
            </p>
          </div>

          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
            <CheckCircle2 className="w-8 h-8 text-purple-400 mb-3" />
            <h4 className="text-white font-medium mb-2">Impact Verification</h4>
            <p className="text-emerald-300/70 text-sm">
              Certified impact reporters with tamper-proof credentials
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
