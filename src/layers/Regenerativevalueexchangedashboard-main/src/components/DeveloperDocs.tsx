import { useState } from 'react';
import { Code, Database, Zap, Lock, Layers, GitBranch, Server, Radio } from 'lucide-react';

type Section = 'principles' | 'resources' | 'architecture' | 'flows' | 'security' | 'events';

const apiResources = [
  {
    name: 'Asset',
    path: '/api/v1/assets',
    description: 'Quantified, verified regenerative units (carbon, biodiversity, cultural milestones)',
    endpoints: [
      { method: 'POST', path: '/api/v1/assets', description: 'Create asset (draft/originate)' },
      { method: 'GET', path: '/api/v1/assets', description: 'List assets (filter, paginate)' },
      { method: 'GET', path: '/api/v1/assets/{assetId}', description: 'Read single asset' },
      { method: 'PATCH', path: '/api/v1/assets/{assetId}', description: 'Update metadata' },
      { method: 'DELETE', path: '/api/v1/assets/{assetId}', description: 'Retire/revoke asset' },
    ],
    schema: {
      id: 'asset_v1:uuid',
      type: 'carbon_sequestration',
      quantity: 242.5,
      unit: 'tCO2',
      projectId: 'project_v1:uuid',
      location: { lat: -1.2921, lng: 36.8219 },
      status: 'verified',
      createdAt: '2025-12-01T12:34:56Z',
      metadata: {
        measurementMethod: 'flux_data_model_v2',
        sensorIds: ['sensor:...'],
        evidenceHash: 'sha256:...',
      },
      onchain: { proofTx: '0x...', proofHash: 'sha256:...' },
    },
  },
  {
    name: 'Project',
    path: '/api/v1/projects',
    description: 'Restoration initiatives and deployment programs',
    endpoints: [
      { method: 'POST', path: '/api/v1/projects', description: 'Create project' },
      { method: 'GET', path: '/api/v1/projects', description: 'List projects' },
      { method: 'GET', path: '/api/v1/projects/{projectId}', description: 'Read project' },
      { method: 'PATCH', path: '/api/v1/projects/{projectId}', description: 'Update project' },
    ],
    schema: {
      id: 'project_v1:uuid',
      name: 'Kisii Watershed Revival',
      ownerId: 'custodian:uuid',
      region: 'Kisii',
      startDate: '2024-06-01',
      assets: ['asset_v1:...'],
      status: 'active',
      impactGoals: [
        { metric: 'tCO2', target: 10000 },
        { metric: 'ha_restored', target: 350 },
      ],
    },
  },
  {
    name: 'Custodian',
    path: '/api/v1/custodians',
    description: 'Stewardship entities (cooperatives, conservation groups, institutions)',
    endpoints: [
      { method: 'POST', path: '/api/v1/custodians', description: 'Register custodian' },
      { method: 'GET', path: '/api/v1/custodians', description: 'List custodians' },
      { method: 'GET', path: '/api/v1/custodians/{id}', description: 'Read custodian' },
      { method: 'PATCH', path: '/api/v1/custodians/{id}', description: 'Update custodian' },
    ],
    schema: {
      id: 'custodian:uuid',
      type: 'community_cooperative',
      name: 'Ngare Community Trust',
      wallets: { eth: '0xabc...', rve: 'rve_vk...' },
      jurisdiction: 'KE',
      governance: { constitutionDoc: 'ipfs://...' },
    },
  },
  {
    name: 'Verification',
    path: '/api/v1/verifications',
    description: 'Evidence and third-party attestation records',
    endpoints: [
      { method: 'POST', path: '/api/v1/verifications', description: 'Create verification' },
      { method: 'GET', path: '/api/v1/verifications', description: 'List verifications' },
      { method: 'GET', path: '/api/v1/verifications/{id}', description: 'Read verification' },
    ],
    schema: {
      id: 'verification:uuid',
      assetId: 'asset_v1:uuid',
      verifierId: 'verifier:uuid',
      method: 'satellite_change_detection_v3',
      evidence: ['ipfs://...'],
      score: 0.92,
      status: 'passed',
      verifiedAt: '2025-11-20T08:00:00Z',
      proofHash: 'sha256:...',
    },
  },
  {
    name: 'Token',
    path: '/api/v1/tokens',
    description: 'Tokenized representation of assets for trading',
    endpoints: [
      { method: 'POST', path: '/api/v1/tokens', description: 'Mint token from asset' },
      { method: 'GET', path: '/api/v1/tokens/{tokenId}', description: 'Read token' },
      { method: 'GET', path: '/api/v1/tokens', description: 'List tokens by owner' },
      { method: 'POST', path: '/api/v1/tokens/{tokenId}/transfer', description: 'Transfer token' },
    ],
    schema: {
      id: 'token:erc1155:0x...:123',
      assetId: 'asset_v1:uuid',
      supply: 100,
      decimals: 6,
      status: 'minted',
      onchain: { contract: '0x...', txHash: '0x...' },
    },
  },
  {
    name: 'Order',
    path: '/api/v1/orders',
    description: 'Trading orders for regenerative tokens',
    endpoints: [
      { method: 'POST', path: '/api/v1/orders', description: 'Place order' },
      { method: 'GET', path: '/api/v1/orders/{orderId}', description: 'Read order' },
      { method: 'DELETE', path: '/api/v1/orders/{orderId}', description: 'Cancel order' },
    ],
    schema: {
      id: 'order:uuid',
      marketId: 'market:uuid',
      type: 'limit',
      side: 'sell',
      tokenId: 'token:...',
      price: 12.5,
      quantity: 10,
      status: 'open',
    },
  },
  {
    name: 'Governance',
    path: '/api/v1/governance',
    description: 'On-chain/off-chain governance proposals and voting',
    endpoints: [
      { method: 'POST', path: '/api/v1/governance/proposals', description: 'Create proposal' },
      { method: 'GET', path: '/api/v1/governance/proposals', description: 'List proposals' },
      { method: 'POST', path: '/api/v1/governance/votes', description: 'Cast vote' },
    ],
    schema: {
      id: 'gov:proposal:uuid',
      title: 'Amend verification standards v2',
      proposer: 'custodian:uuid',
      details: 'ipfs://...',
      startAt: '2025-12-10T00:00:00Z',
      endAt: '2025-12-20T00:00:00Z',
    },
  },
];

export function DeveloperDocs() {
  const [activeSection, setActiveSection] = useState<Section>('principles');
  const [selectedResource, setSelectedResource] = useState(apiResources[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
        <h2 className="text-white mb-2">RVE Technical Architecture & API Documentation</h2>
        <p className="text-emerald-300/80">
          Comprehensive platform architecture, REST APIs, event streaming, and on-chain/off-chain integration patterns.
        </p>
      </div>

      {/* Section Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setActiveSection('principles')}
          className={`p-4 rounded-lg transition-all ${
            activeSection === 'principles'
              ? 'bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400'
              : 'bg-black/30 border-2 border-emerald-500/10 text-emerald-300/70 hover:border-emerald-500/30'
          }`}
        >
          <Layers className="w-6 h-6 mx-auto mb-2" />
          <div className="text-sm">Principles</div>
        </button>
        <button
          onClick={() => setActiveSection('resources')}
          className={`p-4 rounded-lg transition-all ${
            activeSection === 'resources'
              ? 'bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400'
              : 'bg-black/30 border-2 border-emerald-500/10 text-emerald-300/70 hover:border-emerald-500/30'
          }`}
        >
          <Database className="w-6 h-6 mx-auto mb-2" />
          <div className="text-sm">Resources</div>
        </button>
        <button
          onClick={() => setActiveSection('architecture')}
          className={`p-4 rounded-lg transition-all ${
            activeSection === 'architecture'
              ? 'bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400'
              : 'bg-black/30 border-2 border-emerald-500/10 text-emerald-300/70 hover:border-emerald-500/30'
          }`}
        >
          <Server className="w-6 h-6 mx-auto mb-2" />
          <div className="text-sm">Architecture</div>
        </button>
        <button
          onClick={() => setActiveSection('flows')}
          className={`p-4 rounded-lg transition-all ${
            activeSection === 'flows'
              ? 'bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400'
              : 'bg-black/30 border-2 border-emerald-500/10 text-emerald-300/70 hover:border-emerald-500/30'
          }`}
        >
          <GitBranch className="w-6 h-6 mx-auto mb-2" />
          <div className="text-sm">Flows</div>
        </button>
        <button
          onClick={() => setActiveSection('events')}
          className={`p-4 rounded-lg transition-all ${
            activeSection === 'events'
              ? 'bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400'
              : 'bg-black/30 border-2 border-emerald-500/10 text-emerald-300/70 hover:border-emerald-500/30'
          }`}
        >
          <Radio className="w-6 h-6 mx-auto mb-2" />
          <div className="text-sm">Events</div>
        </button>
        <button
          onClick={() => setActiveSection('security')}
          className={`p-4 rounded-lg transition-all ${
            activeSection === 'security'
              ? 'bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400'
              : 'bg-black/30 border-2 border-emerald-500/10 text-emerald-300/70 hover:border-emerald-500/30'
          }`}
        >
          <Lock className="w-6 h-6 mx-auto mb-2" />
          <div className="text-sm">Security</div>
        </button>
      </div>

      {/* Content Sections */}
      {activeSection === 'principles' && <DesignPrinciples />}
      {activeSection === 'resources' && (
        <APIResources selectedResource={selectedResource} setSelectedResource={setSelectedResource} />
      )}
      {activeSection === 'architecture' && <SystemArchitecture />}
      {activeSection === 'flows' && <WorkflowFlows />}
      {activeSection === 'events' && <EventStreaming />}
      {activeSection === 'security' && <SecurityCompliance />}
    </div>
  );
}

function DesignPrinciples() {
  const principles = [
    {
      title: 'First-Class Resources',
      icon: Database,
      color: 'emerald',
      description: 'Model regenerative value as core domain resources: assets, projects, tokens, verifications, custodians, markets, orders, and governance.',
      details: [
        'RESTful resource modeling with clear ownership',
        'Immutable core fields with versioned updates',
        'Strong type system and schema validation',
      ],
    },
    {
      title: 'On-Chain/Off-Chain Separation',
      icon: Layers,
      color: 'blue',
      description: 'Keep on-chain data minimal (verifiable pointers, proofs, hashes); keep heavy data off-chain (satellite imagery, sensor streams).',
      details: [
        'Blockchain for finality and immutability',
        'IPFS/object storage for evidence bundles',
        'Hash anchoring for verification',
      ],
    },
    {
      title: 'CRUD + Events',
      icon: Zap,
      color: 'amber',
      description: 'Each CRUD operation emits domain events creating an immutable audit trail for compliance and transparency.',
      details: [
        'CloudEvents standard for all events',
        'Append-only event store',
        'Event sourcing for critical operations',
      ],
    },
    {
      title: 'Multiple API Surfaces',
      icon: Server,
      color: 'purple',
      description: 'Support REST for simplicity, GraphQL for flexible queries, WebSockets/SSE for live updates, and gRPC for internal services.',
      details: [
        'REST for standard operations',
        'GraphQL for complex queries',
        'Real-time streaming for live data',
      ],
    },
    {
      title: 'Idempotency & Versioning',
      icon: GitBranch,
      color: 'pink',
      description: 'Design for safe retries, API versioning, and backward compatibility with extensible plugin architecture.',
      details: [
        'Idempotency-Key header support',
        'Semantic versioning for APIs',
        'Plugin system for extensibility',
      ],
    },
    {
      title: 'Security by Design',
      icon: Lock,
      color: 'red',
      description: 'OAuth2.0, DIDs, multi-sig, HSM key management, and comprehensive audit logging from the ground up.',
      details: [
        'Zero-trust architecture',
        'End-to-end encryption',
        'Regulatory compliance built-in',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">Core Design Principles</h3>
        <p className="text-emerald-300/80 mb-6">
          The RVE platform is built on six foundational principles that ensure scalability, security, 
          and extensibility while maintaining the integrity of regenerative value tracking.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {principles.map((principle, idx) => {
            const Icon = principle.icon;
            return (
              <div key={idx} className="bg-emerald-900/10 border border-emerald-500/10 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${principle.color}-500 to-${principle.color}-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white mb-2">{principle.title}</h4>
                    <p className="text-emerald-300/70 text-sm mb-3">{principle.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {principle.details.map((detail, detailIdx) => (
                    <li key={detailIdx} className="flex items-start gap-2 text-emerald-300/60 text-sm">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Base URL & Conventions */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">API Conventions</h3>
        <div className="space-y-4">
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-400 mb-2">Base URL</div>
            <code className="text-emerald-300 bg-black/40 px-3 py-1 rounded">https://api.rve.org/api/v1</code>
          </div>
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-400 mb-2">Sandbox/Testnet</div>
            <code className="text-emerald-300 bg-black/40 px-3 py-1 rounded">https://api.sandbox.rve.org/api/v1</code>
          </div>
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-400 mb-2">Content Type</div>
            <code className="text-emerald-300 bg-black/40 px-3 py-1 rounded">application/json</code>
          </div>
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-400 mb-2">Authentication</div>
            <code className="text-emerald-300 bg-black/40 px-3 py-1 rounded">Authorization: Bearer {'<'}JWT{'>'}</code>
          </div>
        </div>
      </div>
    </div>
  );
}

interface APIResourcesProps {
  selectedResource: typeof apiResources[0];
  setSelectedResource: (resource: typeof apiResources[0]) => void;
}

function APIResources({ selectedResource, setSelectedResource }: APIResourcesProps) {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Resource Selector */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">Core API Resources</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {apiResources.map((resource) => (
            <button
              key={resource.name}
              onClick={() => setSelectedResource(resource)}
              className={`p-3 rounded-lg transition-all text-sm ${
                selectedResource.name === resource.name
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                  : 'bg-emerald-900/10 border border-emerald-500/10 text-emerald-300/70 hover:border-emerald-500/30'
              }`}
            >
              {resource.name}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endpoints */}
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <h3 className="text-white mb-4">{selectedResource.name} Endpoints</h3>
          <p className="text-emerald-300/70 text-sm mb-6">{selectedResource.description}</p>
          <div className="space-y-3">
            {selectedResource.endpoints.map((endpoint, idx) => {
              const methodColors: Record<string, string> = {
                GET: 'bg-blue-500/20 text-blue-400',
                POST: 'bg-emerald-500/20 text-emerald-400',
                PATCH: 'bg-amber-500/20 text-amber-400',
                DELETE: 'bg-red-500/20 text-red-400',
              };

              return (
                <div key={idx} className="bg-emerald-900/10 border border-emerald-500/10 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`px-2 py-1 rounded text-xs ${methodColors[endpoint.method]}`}>
                      {endpoint.method}
                    </div>
                    <div className="flex-1">
                      <code className="text-emerald-300 text-sm break-all">{endpoint.path}</code>
                    </div>
                  </div>
                  <p className="text-emerald-300/60 text-sm">{endpoint.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schema */}
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white">JSON Schema</h3>
            <button
              onClick={() => copyToClipboard(JSON.stringify(selectedResource.schema, null, 2), selectedResource.name)}
              className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-2"
            >
              <Code className="w-4 h-4" />
              {copiedEndpoint === selectedResource.name ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="bg-black/40 rounded-lg p-4 overflow-x-auto">
            <pre className="text-emerald-300 text-sm">
              <code>{JSON.stringify(selectedResource.schema, null, 2)}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Example Request */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">Example: Create {selectedResource.name}</h3>
        <div className="bg-black/40 rounded-lg p-4 overflow-x-auto">
          <pre className="text-emerald-300 text-sm">
            <code>{`curl -X POST ${selectedResource.path} \\
  -H "Authorization: Bearer <JWT>" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: <uuid>" \\
  -d '${JSON.stringify(selectedResource.schema, null, 2)}'`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

function SystemArchitecture() {
  return (
    <div className="space-y-6">
      {/* Architecture Diagram */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-6">System Architecture Overview</h3>
        <div className="bg-emerald-900/10 rounded-lg p-8">
          {/* Client Layer */}
          <div className="mb-6">
            <div className="text-emerald-400 mb-3">Client Layer</div>
            <div className="grid grid-cols-4 gap-3">
              {['Web App', 'Mobile App', 'SDKs', 'Third-Party'].map((item, idx) => (
                <div key={idx} className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-3 text-center text-blue-300 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* API Gateway */}
          <div className="mb-6">
            <div className="text-center mb-3">
              <div className="inline-block bg-purple-500/20 border-2 border-purple-500/40 rounded-lg px-6 py-3">
                <div className="text-purple-300">API Gateway</div>
                <div className="text-purple-300/60 text-xs mt-1">Rate Limiting • Auth • Routing</div>
              </div>
            </div>
          </div>

          {/* Service Layer */}
          <div className="mb-6">
            <div className="text-emerald-400 mb-3">Microservices Layer</div>
            <div className="grid grid-cols-3 gap-3">
              {[
                'Asset Service',
                'Verification Service',
                'Trading Service',
                'Custodian Service',
                'Governance Service',
                'Analytics Service',
              ].map((service, idx) => (
                <div key={idx} className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg p-3 text-center text-emerald-300 text-sm">
                  {service}
                </div>
              ))}
            </div>
          </div>

          {/* Event Bus */}
          <div className="mb-6">
            <div className="text-center">
              <div className="inline-block bg-amber-500/20 border-2 border-amber-500/40 rounded-lg px-6 py-3">
                <div className="text-amber-300">Event Streaming (Kafka/Pulsar)</div>
                <div className="text-amber-300/60 text-xs mt-1">CloudEvents • Pub/Sub • Audit Trail</div>
              </div>
            </div>
          </div>

          {/* Data Layer */}
          <div className="mb-6">
            <div className="text-emerald-400 mb-3">Data Layer</div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { name: 'PostgreSQL', desc: 'Relational' },
                { name: 'ElasticSearch', desc: 'Search' },
                { name: 'TimescaleDB', desc: 'Time-series' },
                { name: 'Redis', desc: 'Cache' },
              ].map((db, idx) => (
                <div key={idx} className="bg-pink-500/20 border border-pink-500/40 rounded-lg p-3 text-center">
                  <div className="text-pink-300 text-sm">{db.name}</div>
                  <div className="text-pink-300/60 text-xs">{db.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Storage & Blockchain */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-emerald-400 mb-3">Off-Chain Storage</div>
              <div className="space-y-2">
                <div className="bg-teal-500/20 border border-teal-500/40 rounded-lg p-3 text-center text-teal-300 text-sm">
                  IPFS (Evidence)
                </div>
                <div className="bg-teal-500/20 border border-teal-500/40 rounded-lg p-3 text-center text-teal-300 text-sm">
                  S3 (Sensor Data)
                </div>
              </div>
            </div>
            <div>
              <div className="text-emerald-400 mb-3">On-Chain Layer</div>
              <div className="space-y-2">
                <div className="bg-violet-500/20 border border-violet-500/40 rounded-lg p-3 text-center text-violet-300 text-sm">
                  Smart Contracts
                </div>
                <div className="bg-violet-500/20 border border-violet-500/40 rounded-lg p-3 text-center text-violet-300 text-sm">
                  Hash Anchoring
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* On-Chain vs Off-Chain */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <h3 className="text-white mb-4">On-Chain Data (Minimal)</h3>
          <ul className="space-y-3">
            {[
              'Asset proof hashes',
              'Token contracts (ERC-1155)',
              'Verification signatures',
              'Governance votes',
              'Multi-sig custody',
              'Minting/burning events',
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5"></div>
                <span className="text-emerald-300/80 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <h3 className="text-white mb-4">Off-Chain Data (Heavy)</h3>
          <ul className="space-y-3">
            {[
              'Satellite imagery',
              'Sensor time-series',
              'Evidence bundles',
              'Legal documents',
              'Cultural artifacts',
              'Analytics & reporting',
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <span className="text-emerald-300/80 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function WorkflowFlows() {
  const flows = [
    {
      name: 'Asset Creation to Trading',
      steps: [
        { num: 1, title: 'Create Asset', desc: 'POST /api/v1/assets (draft)', color: 'blue' },
        { num: 2, title: 'Emit Event', desc: 'asset.created → Event Bus', color: 'amber' },
        { num: 3, title: 'Verification', desc: 'POST /api/v1/verifications', color: 'purple' },
        { num: 4, title: 'Anchor Proof', desc: 'Smart contract anchorEvidence()', color: 'violet' },
        { num: 5, title: 'Update Status', desc: 'PATCH /api/v1/assets/{id} → verified', color: 'emerald' },
        { num: 6, title: 'Mint Token', desc: 'POST /api/v1/tokens with assetId', color: 'pink' },
        { num: 7, title: 'List on Market', desc: 'POST /api/v1/orders (sell order)', color: 'teal' },
        { num: 8, title: 'Trade Settlement', desc: 'On-chain transfer + escrow', color: 'cyan' },
      ],
    },
    {
      name: 'Dispute & Remediation',
      steps: [
        { num: 1, title: 'Raise Dispute', desc: 'POST /api/v1/disputes with evidence', color: 'red' },
        { num: 2, title: 'Governance Proposal', desc: 'POST /api/v1/governance/proposals', color: 'amber' },
        { num: 3, title: 'Community Vote', desc: 'POST /api/v1/governance/votes', color: 'blue' },
        { num: 4, title: 'Resolution', desc: 'If passed, create correction record', color: 'purple' },
        { num: 5, title: 'Update Asset', desc: 'PATCH /api/v1/assets/{id} → disputed', color: 'red' },
        { num: 6, title: 'Token Adjustment', desc: 'Burn/lock/fractional adjustments', color: 'violet' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {flows.map((flow, flowIdx) => (
        <div key={flowIdx} className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
          <h3 className="text-white mb-6">{flow.name}</h3>
          <div className="relative">
            {flow.steps.map((step, stepIdx) => (
              <div key={stepIdx} className="flex items-start gap-4 mb-6 last:mb-0">
                <div className={`w-10 h-10 bg-${step.color}-500/20 border-2 border-${step.color}-500/40 rounded-full flex items-center justify-center text-${step.color}-300 flex-shrink-0`}>
                  {step.num}
                </div>
                <div className="flex-1 pt-1">
                  <div className="text-white mb-1">{step.title}</div>
                  <div className="text-emerald-300/70 text-sm">{step.desc}</div>
                </div>
                {stepIdx < flow.steps.length - 1 && (
                  <div className="absolute left-5 w-0.5 bg-emerald-500/30 h-6" style={{ top: `${stepIdx * 72 + 40}px` }}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Verification Pipeline */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">Verification Pipeline Architecture</h3>
        <div className="space-y-4">
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-400 mb-2">1. Job Enqueue</div>
            <code className="text-emerald-300 text-sm bg-black/40 px-3 py-1 rounded block">
              POST /api/v1/verifications/start {'{'}assetId, method, datasetRefs{'}'}
            </code>
          </div>
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-400 mb-2">2. Worker Processing</div>
            <p className="text-emerald-300/70 text-sm">
              Verification worker pulls job, runs ML algorithms or human review
            </p>
          </div>
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-400 mb-2">3. Evidence Storage</div>
            <p className="text-emerald-300/70 text-sm">
              Store immutable evidence bundle in IPFS/S3, compute hash
            </p>
          </div>
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-400 mb-2">4. Complete Verification</div>
            <code className="text-emerald-300 text-sm bg-black/40 px-3 py-1 rounded block">
              POST /api/v1/verifications/{'{'}id{'}'}/complete {'{'}signedEvidence, proofHash{'}'}
            </code>
          </div>
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-400 mb-2">5. Blockchain Anchor</div>
            <p className="text-emerald-300/70 text-sm">
              Write proofHash to ledger with multi-sig verification
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventStreaming() {
  return (
    <div className="space-y-6">
      {/* CloudEvents Standard */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">CloudEvents Standard</h3>
        <p className="text-emerald-300/80 mb-6">
          All domain events use the CloudEvents specification for consistent event structure across the platform.
        </p>
        <div className="bg-black/40 rounded-lg p-4 overflow-x-auto">
          <pre className="text-emerald-300 text-sm">
            <code>{`{
  "specversion": "1.0",
  "type": "asset.verified.v1",
  "source": "/api/assets",
  "id": "evt-abc123-uuid",
  "time": "2025-12-01T12:35:00Z",
  "datacontenttype": "application/json",
  "data": {
    "assetId": "asset_v1:uuid-123",
    "verifier": "verifier:uuid-456",
    "proofHash": "sha256:abc...",
    "score": 0.92
  }
}`}</code>
          </pre>
        </div>
      </div>

      {/* Event Types */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">Domain Event Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { type: 'asset.created.v1', desc: 'New asset draft created' },
            { type: 'asset.verified.v1', desc: 'Asset verification completed' },
            { type: 'asset.tokenized.v1', desc: 'Asset minted as token' },
            { type: 'asset.retired.v1', desc: 'Asset retired or revoked' },
            { type: 'verification.started.v1', desc: 'Verification job started' },
            { type: 'verification.completed.v1', desc: 'Verification result ready' },
            { type: 'token.minted.v1', desc: 'Token minted on-chain' },
            { type: 'token.transferred.v1', desc: 'Token ownership changed' },
            { type: 'order.placed.v1', desc: 'New market order placed' },
            { type: 'order.matched.v1', desc: 'Order matched and filled' },
            { type: 'governance.proposed.v1', desc: 'New proposal created' },
            { type: 'governance.voted.v1', desc: 'Vote cast on proposal' },
          ].map((event, idx) => (
            <div key={idx} className="bg-emerald-900/10 border border-emerald-500/10 rounded-lg p-4">
              <code className="text-emerald-400 text-sm">{event.type}</code>
              <p className="text-emerald-300/70 text-sm mt-2">{event.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Streaming */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">Real-Time Event Streaming</h3>
        <div className="space-y-4">
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-400 mb-2">Server-Sent Events (SSE)</div>
            <code className="text-emerald-300 text-sm bg-black/40 px-3 py-1 rounded block">
              GET /api/v1/stream?topic=project:uuid
            </code>
            <p className="text-emerald-300/60 text-sm mt-2">
              Subscribe to real-time updates for specific resources
            </p>
          </div>
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-400 mb-2">WebSocket Connection</div>
            <code className="text-emerald-300 text-sm bg-black/40 px-3 py-1 rounded block">
              wss://api.rve.org/ws?token={'<'}JWT{'>'}
            </code>
            <p className="text-emerald-300/60 text-sm mt-2">
              Bi-directional real-time communication for trading and live updates
            </p>
          </div>
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-400 mb-2">Webhooks</div>
            <code className="text-emerald-300 text-sm bg-black/40 px-3 py-1 rounded block">
              POST /api/v1/webhooks {'{'}url, events: ['asset.verified.v1']{'}'}
            </code>
            <p className="text-emerald-300/60 text-sm mt-2">
              Configure webhooks for external system integration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityCompliance() {
  return (
    <div className="space-y-6">
      {/* Authentication & Authorization */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">Authentication & Authorization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-400 mb-3">OAuth 2.0 / JWT</div>
            <ul className="space-y-2 text-emerald-300/70 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></div>
                <span>Standard OAuth2.0 flows for third-party apps</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></div>
                <span>JWT tokens for service-to-service auth</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></div>
                <span>Short-lived access tokens with refresh flow</span>
              </li>
            </ul>
          </div>
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-400 mb-3">Decentralized Identity (DID)</div>
            <ul className="space-y-2 text-emerald-300/70 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></div>
                <span>Self-sovereign identity for custodians</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></div>
                <span>Verifiable credentials for verifiers</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></div>
                <span>Community governance through DIDs</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Encryption & Transport */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">Encryption & Transport Security</h3>
        <div className="space-y-3">
          <div className="bg-emerald-900/10 border border-emerald-500/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-emerald-400">TLS 1.3 Enforced</div>
              <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs">Required</div>
            </div>
            <p className="text-emerald-300/60 text-sm">All API endpoints enforce TLS 1.3 with HSTS headers</p>
          </div>
          <div className="bg-emerald-900/10 border border-emerald-500/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-emerald-400">mTLS for Internal Services</div>
              <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs">Required</div>
            </div>
            <p className="text-emerald-300/60 text-sm">Mutual TLS authentication for microservice communication</p>
          </div>
          <div className="bg-emerald-900/10 border border-emerald-500/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-emerald-400">End-to-End Encryption</div>
              <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs">Optional</div>
            </div>
            <p className="text-emerald-300/60 text-sm">Client-side encryption available for sensitive documents</p>
          </div>
        </div>
      </div>

      {/* Key Management */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">Key Management & Custody</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-900/20 rounded-lg p-4">
            <div className="text-purple-400 mb-2">KMS for Signing</div>
            <p className="text-emerald-300/70 text-sm">
              Cloud KMS for signing proof anchors and verification attestations
            </p>
          </div>
          <div className="bg-purple-900/20 rounded-lg p-4">
            <div className="text-purple-400 mb-2">HSM for Custody</div>
            <p className="text-emerald-300/70 text-sm">
              Hardware Security Modules for custodial on-chain key storage
            </p>
          </div>
          <div className="bg-purple-900/20 rounded-lg p-4">
            <div className="text-purple-400 mb-2">Multi-Party Computation</div>
            <p className="text-emerald-300/70 text-sm">
              MPC for distributed key generation and signing ceremonies
            </p>
          </div>
        </div>
      </div>

      {/* Compliance & Auditing */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">Compliance & Auditing</h3>
        <div className="space-y-4">
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-400 mb-2">Append-Only Audit Log</div>
            <p className="text-emerald-300/70 text-sm mb-3">
              Immutable event store recording all CRUD operations and state transitions
            </p>
            <code className="text-emerald-300 text-xs bg-black/40 px-3 py-1 rounded">
              Tamper-proof • Cryptographically verifiable • Long-term retention
            </code>
          </div>
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-400 mb-2">KYC/AML Integration</div>
            <p className="text-emerald-300/70 text-sm">
              Pluggable KYC/AML flows for institutional participants with regional compliance adapters
            </p>
          </div>
          <div className="bg-emerald-900/20 rounded-lg p-4">
            <div className="text-emerald-400 mb-2">Data Sovereignty & GDPR</div>
            <p className="text-emerald-300/70 text-sm">
              Regional data residency, right-to-erasure for PII, consent management built-in
            </p>
          </div>
        </div>
      </div>

      {/* Rate Limiting & Protection */}
      <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white mb-4">Rate Limiting & DDoS Protection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-900/20 rounded-lg p-4">
            <div className="text-red-400 mb-3">API Rate Limits</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-emerald-300/70">
                <span>Free Tier</span>
                <code className="bg-black/40 px-2 py-1 rounded text-xs">100 req/min</code>
              </div>
              <div className="flex items-center justify-between text-emerald-300/70">
                <span>Standard</span>
                <code className="bg-black/40 px-2 py-1 rounded text-xs">1000 req/min</code>
              </div>
              <div className="flex items-center justify-between text-emerald-300/70">
                <span>Enterprise</span>
                <code className="bg-black/40 px-2 py-1 rounded text-xs">Custom</code>
              </div>
            </div>
          </div>
          <div className="bg-red-900/20 rounded-lg p-4">
            <div className="text-red-400 mb-3">DDoS Mitigation</div>
            <ul className="space-y-2 text-emerald-300/70 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5"></div>
                <span>CDN edge protection</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5"></div>
                <span>Adaptive rate limiting</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5"></div>
                <span>Geographic filtering</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
