import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Code, Play, Copy, Check, ChevronRight, ChevronDown, Book, Zap, Database, Lock, Globe } from 'lucide-react';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface APIEndpoint {
  method: HTTPMethod;
  path: string;
  description: string;
  category: string;
  authentication: boolean;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    location: 'path' | 'query' | 'body';
  }>;
  requestExample?: any;
  responseExample?: any;
  responseSchema?: any;
}

export function APIExplorer() {
  const [selectedCategory, setSelectedCategory] = useState('assets');
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [requestBody, setRequestBody] = useState('');
  const [responseData, setResponseData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['assets']);

  const categories = [
    { id: 'assets', label: 'Environmental Assets', icon: Globe, count: 12 },
    { id: 'verifications', label: 'Verifications', icon: Check, count: 8 },
    { id: 'governance', label: 'Governance', icon: Database, count: 10 },
    { id: 'trading', label: 'Trading', icon: Zap, count: 15 },
    { id: 'tokens', label: 'Token Economics', icon: Code, count: 7 },
    { id: 'custodians', label: 'Custodians', icon: Lock, count: 6 },
  ];

  const endpoints: APIEndpoint[] = [
    // Assets Endpoints
    {
      method: 'GET',
      path: '/api/v1/assets',
      description: 'List all environmental, cultural, and social assets',
      category: 'assets',
      authentication: false,
      parameters: [
        { name: 'type', type: 'string', required: false, description: 'Filter by asset type (environmental, cultural, health_social)', location: 'query' },
        { name: 'status', type: 'string', required: false, description: 'Filter by status (active, pending, verified)', location: 'query' },
        { name: 'limit', type: 'number', required: false, description: 'Number of results per page (default: 20)', location: 'query' },
        { name: 'offset', type: 'number', required: false, description: 'Pagination offset', location: 'query' },
      ],
      responseExample: {
        data: [
          {
            id: 'asset_4821',
            type: 'environmental',
            name: 'Amazon Rainforest Restoration Project',
            category: 'carbon_sequestration',
            status: 'verified',
            location: {
              country: 'Brazil',
              region: 'Amazon Basin',
              coordinates: { lat: -3.4653, lng: -62.2159 }
            },
            metrics: {
              carbon_sequestered_tons: 142500,
              area_hectares: 5800,
              biodiversity_score: 94.2
            },
            custodian: {
              id: 'cust_af_089',
              name: 'Amazon Conservation Alliance'
            },
            verification: {
              status: 'verified',
              last_verified: '2024-12-09T14:32:18Z',
              oracle_consensus: 98.4,
              verification_count: 847
            },
            token_value: {
              rve_locked: 2847000,
              market_value_usd: 122142900
            },
            created_at: '2023-06-15T08:23:11Z',
            updated_at: '2024-12-09T14:32:18Z'
          }
        ],
        pagination: {
          total: 12847,
          limit: 20,
          offset: 0,
          has_more: true
        }
      },
      responseSchema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Asset' }
          },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v1/assets/{id}',
      description: 'Get detailed information about a specific asset',
      category: 'assets',
      authentication: false,
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Asset ID', location: 'path' },
      ],
      responseExample: {
        id: 'asset_4821',
        type: 'environmental',
        name: 'Amazon Rainforest Restoration Project',
        description: 'Large-scale reforestation and ecosystem restoration project in the Brazilian Amazon',
        category: 'carbon_sequestration',
        status: 'verified',
        location: {
          country: 'Brazil',
          region: 'Amazon Basin',
          coordinates: { lat: -3.4653, lng: -62.2159 },
          area_hectares: 5800
        },
        metrics: {
          carbon_sequestered_tons: 142500,
          carbon_rate_tons_per_year: 18400,
          biodiversity_score: 94.2,
          species_count: 1247,
          soil_health_index: 87.3
        },
        custodian: {
          id: 'cust_af_089',
          name: 'Amazon Conservation Alliance',
          wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7'
        },
        verification: {
          status: 'verified',
          last_verified: '2024-12-09T14:32:18Z',
          next_verification: '2024-12-16T14:32:18Z',
          oracle_consensus: 98.4,
          verification_count: 847,
          verifying_oracles: ['oracle_na_427', 'oracle_sa_189', 'oracle_eu_334']
        },
        token_value: {
          rve_locked: 2847000,
          market_value_usd: 122142900,
          price_per_token: 42.87
        },
        impact_history: [
          { date: '2024-11-01', carbon_tons: 138200, biodiversity: 93.1 },
          { date: '2024-12-01', carbon_tons: 142500, biodiversity: 94.2 }
        ],
        created_at: '2023-06-15T08:23:11Z',
        updated_at: '2024-12-09T14:32:18Z'
      }
    },
    {
      method: 'POST',
      path: '/api/v1/assets',
      description: 'Create a new asset (requires custodian authentication)',
      category: 'assets',
      authentication: true,
      parameters: [
        { name: 'type', type: 'string', required: true, description: 'Asset type (environmental, cultural, health_social)', location: 'body' },
        { name: 'name', type: 'string', required: true, description: 'Asset name', location: 'body' },
        { name: 'category', type: 'string', required: true, description: 'Asset category', location: 'body' },
        { name: 'location', type: 'object', required: true, description: 'Location information', location: 'body' },
        { name: 'metrics', type: 'object', required: true, description: 'Initial metrics', location: 'body' },
      ],
      requestExample: {
        type: 'environmental',
        name: 'Kenyan Soil Regeneration Initiative',
        description: 'Community-led soil health restoration across 3,200 hectares',
        category: 'soil_regeneration',
        location: {
          country: 'Kenya',
          region: 'Rift Valley',
          coordinates: { lat: -0.0236, lng: 37.9062 },
          area_hectares: 3200
        },
        metrics: {
          soil_health_index: 72.5,
          carbon_sequestered_tons: 8400,
          water_retention_improvement: 34.2
        },
        custodian_id: 'cust_af_201'
      },
      responseExample: {
        id: 'asset_9234',
        status: 'pending_verification',
        message: 'Asset created successfully. Verification process initiated.',
        verification_eta: '2024-12-16T10:00:00Z'
      }
    },
    {
      method: 'PATCH',
      path: '/api/v1/assets/{id}/metrics',
      description: 'Update asset metrics (triggers verification)',
      category: 'assets',
      authentication: true,
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Asset ID', location: 'path' },
        { name: 'metrics', type: 'object', required: true, description: 'Updated metrics', location: 'body' },
      ],
      requestExample: {
        metrics: {
          carbon_sequestered_tons: 145200,
          biodiversity_score: 94.8,
          soil_health_index: 88.1
        },
        evidence: {
          sensor_data_url: 'https://sensors.rve.io/data/asset_4821/2024-12-09',
          satellite_imagery_url: 'https://imagery.rve.io/asset_4821/2024-12-09',
          field_report_hash: '0x8f3b2c1d...'
        }
      },
      responseExample: {
        status: 'verification_pending',
        verification_id: 'verify_8821',
        estimated_completion: '2024-12-10T14:00:00Z'
      }
    },

    // Verifications Endpoints
    {
      method: 'GET',
      path: '/api/v1/verifications',
      description: 'List all verification records',
      category: 'verifications',
      authentication: false,
      parameters: [
        { name: 'asset_id', type: 'string', required: false, description: 'Filter by asset ID', location: 'query' },
        { name: 'status', type: 'string', required: false, description: 'Filter by status (pending, verified, failed)', location: 'query' },
        { name: 'oracle_id', type: 'string', required: false, description: 'Filter by oracle node', location: 'query' },
      ],
      responseExample: {
        data: [
          {
            id: 'verify_8821',
            asset_id: 'asset_4821',
            asset_name: 'Amazon Rainforest Restoration Project',
            status: 'verified',
            oracle_consensus: 98.4,
            participating_oracles: [
              {
                oracle_id: 'oracle_na_427',
                region: 'North America',
                vote: 'verified',
                confidence: 99.1,
                timestamp: '2024-12-09T14:30:12Z'
              },
              {
                oracle_id: 'oracle_sa_189',
                region: 'South America',
                vote: 'verified',
                confidence: 98.2,
                timestamp: '2024-12-09T14:30:18Z'
              },
              {
                oracle_id: 'oracle_eu_334',
                region: 'Europe',
                vote: 'verified',
                confidence: 97.9,
                timestamp: '2024-12-09T14:30:23Z'
              }
            ],
            verification_data: {
              carbon_sequestered_tons: 142500,
              verification_method: 'multi_oracle_consensus',
              sensor_readings: 847,
              satellite_confirmations: 12,
              field_validations: 3
            },
            evidence_hash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
            blockchain_tx: '0x8f3b2c1d4e5a6789bcdef...',
            started_at: '2024-12-09T14:28:00Z',
            completed_at: '2024-12-09T14:32:18Z'
          }
        ],
        pagination: {
          total: 30542,
          limit: 20,
          offset: 0,
          has_more: true
        }
      }
    },
    {
      method: 'POST',
      path: '/api/v1/verifications',
      description: 'Request verification for an asset or metric update',
      category: 'verifications',
      authentication: true,
      requestExample: {
        asset_id: 'asset_4821',
        verification_type: 'metric_update',
        priority: 'normal',
        evidence: {
          sensor_data_url: 'https://sensors.rve.io/data/asset_4821/2024-12-09',
          satellite_imagery_url: 'https://imagery.rve.io/asset_4821/2024-12-09'
        }
      },
      responseExample: {
        verification_id: 'verify_8822',
        status: 'pending',
        estimated_oracles: 5,
        estimated_completion: '2024-12-09T15:30:00Z'
      }
    },

    // Governance Endpoints
    {
      method: 'GET',
      path: '/api/v1/governance/proposals',
      description: 'List all governance proposals',
      category: 'governance',
      authentication: false,
      parameters: [
        { name: 'status', type: 'string', required: false, description: 'Filter by status (active, passed, rejected, pending)', location: 'query' },
        { name: 'category', type: 'string', required: false, description: 'Filter by category', location: 'query' },
      ],
      responseExample: {
        data: [
          {
            id: 'prop_892',
            title: 'Allocate 150M RVE to Amazon Restoration Fund',
            description: 'Proposal to allocate treasury funds to accelerate Amazon rainforest restoration projects',
            category: 'treasury_allocation',
            proposer: {
              address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
              name: 'Environmental DAO Coalition'
            },
            status: 'active',
            voting: {
              start_time: '2024-12-01T00:00:00Z',
              end_time: '2024-12-15T23:59:59Z',
              quorum_required: 15000000,
              current_votes: 18234500,
              quorum_reached: true,
              votes_for: 15920340,
              votes_against: 2314160,
              approval_percentage: 87.3
            },
            requested_amount: {
              rve_tokens: 150000000,
              usd_value: 6430500000
            },
            impact_forecast: {
              hectares_restored: 45000,
              carbon_tons_projected: 580000,
              communities_benefited: 127
            },
            created_at: '2024-12-01T00:00:00Z',
            updated_at: '2024-12-09T14:45:00Z'
          }
        ],
        pagination: {
          total: 234,
          limit: 20,
          offset: 0,
          has_more: true
        }
      }
    },
    {
      method: 'POST',
      path: '/api/v1/governance/proposals',
      description: 'Create a new governance proposal',
      category: 'governance',
      authentication: true,
      requestExample: {
        title: 'Increase Oracle Node Rewards',
        description: 'Proposal to increase oracle node operator rewards from 8% to 12% APY to improve network security',
        category: 'protocol_parameter',
        requested_change: {
          parameter: 'oracle_reward_apy',
          current_value: 8,
          proposed_value: 12
        },
        rationale: 'Current rewards are not competitive with similar networks, risking oracle node participation',
        voting_duration_days: 14
      },
      responseExample: {
        proposal_id: 'prop_893',
        status: 'pending_deposit',
        deposit_required: {
          rve_tokens: 10000,
          usd_value: 428700
        },
        deposit_address: '0x8f3b2c1d4e5a6789bcdef...'
      }
    },
    {
      method: 'POST',
      path: '/api/v1/governance/proposals/{id}/vote',
      description: 'Vote on a governance proposal',
      category: 'governance',
      authentication: true,
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Proposal ID', location: 'path' },
        { name: 'vote', type: 'string', required: true, description: 'Vote choice (for, against, abstain)', location: 'body' },
        { name: 'voting_power', type: 'number', required: true, description: 'RVE tokens to vote with', location: 'body' },
      ],
      requestExample: {
        vote: 'for',
        voting_power: 50000,
        reason: 'This proposal aligns with our environmental restoration goals'
      },
      responseExample: {
        vote_id: 'vote_19283',
        proposal_id: 'prop_892',
        vote: 'for',
        voting_power: 50000,
        transaction_hash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
        timestamp: '2024-12-09T15:00:00Z'
      }
    },

    // Trading Endpoints
    {
      method: 'GET',
      path: '/api/v1/trading/markets',
      description: 'List all trading markets and pairs',
      category: 'trading',
      authentication: false,
      responseExample: {
        data: [
          {
            market_id: 'ENV_RVE',
            base_asset: 'environmental_assets',
            quote_asset: 'RVE',
            status: 'active',
            price_24h: {
              current: 42.87,
              open: 38.42,
              high: 44.21,
              low: 38.15,
              change_percent: 11.6
            },
            volume_24h: {
              base: 5847200,
              quote: 250694640,
              usd: 250694640
            },
            liquidity: {
              total_usd: 1247000000,
              depth_2_percent: 8400000
            },
            order_book: {
              bids: 1847,
              asks: 2134,
              spread_percent: 0.12
            }
          }
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/v1/trading/orderbook/{market_id}',
      description: 'Get order book for a specific market',
      category: 'trading',
      authentication: false,
      parameters: [
        { name: 'market_id', type: 'string', required: true, description: 'Market ID', location: 'path' },
        { name: 'depth', type: 'number', required: false, description: 'Order book depth (default: 50)', location: 'query' },
      ],
      responseExample: {
        market_id: 'ENV_RVE',
        timestamp: '2024-12-09T15:10:00Z',
        bids: [
          { price: 42.85, quantity: 15000, total: 642750, orders: 12 },
          { price: 42.84, quantity: 22000, total: 942480, orders: 18 },
          { price: 42.83, quantity: 18500, total: 792355, orders: 15 }
        ],
        asks: [
          { price: 42.88, quantity: 12000, total: 514560, orders: 9 },
          { price: 42.89, quantity: 19000, total: 814910, orders: 14 },
          { price: 42.90, quantity: 16500, total: 707850, orders: 11 }
        ],
        spread: {
          absolute: 0.03,
          percentage: 0.07
        }
      }
    },
    {
      method: 'POST',
      path: '/api/v1/trading/orders',
      description: 'Place a new trading order',
      category: 'trading',
      authentication: true,
      requestExample: {
        market_id: 'ENV_RVE',
        side: 'buy',
        order_type: 'limit',
        price: 42.50,
        quantity: 1000,
        time_in_force: 'GTC'
      },
      responseExample: {
        order_id: 'order_83921',
        status: 'open',
        filled_quantity: 0,
        remaining_quantity: 1000,
        average_price: 0,
        created_at: '2024-12-09T15:15:00Z'
      }
    },
    {
      method: 'DELETE',
      path: '/api/v1/trading/orders/{order_id}',
      description: 'Cancel an open order',
      category: 'trading',
      authentication: true,
      parameters: [
        { name: 'order_id', type: 'string', required: true, description: 'Order ID', location: 'path' },
      ],
      responseExample: {
        order_id: 'order_83921',
        status: 'cancelled',
        filled_quantity: 250,
        cancelled_quantity: 750,
        cancelled_at: '2024-12-09T15:20:00Z'
      }
    },
    {
      method: 'GET',
      path: '/api/v1/trading/orders',
      description: 'Get user trading orders',
      category: 'trading',
      authentication: true,
      parameters: [
        { name: 'status', type: 'string', required: false, description: 'Filter by status (open, filled, cancelled)', location: 'query' },
        { name: 'market_id', type: 'string', required: false, description: 'Filter by market', location: 'query' },
      ],
      responseExample: {
        data: [
          {
            order_id: 'order_83921',
            market_id: 'ENV_RVE',
            side: 'buy',
            order_type: 'limit',
            price: 42.50,
            quantity: 1000,
            filled_quantity: 650,
            remaining_quantity: 350,
            status: 'partially_filled',
            average_price: 42.48,
            created_at: '2024-12-09T15:15:00Z',
            updated_at: '2024-12-09T15:18:00Z'
          }
        ],
        pagination: {
          total: 47,
          limit: 20,
          offset: 0,
          has_more: true
        }
      }
    },

    // Token Economics Endpoints
    {
      method: 'GET',
      path: '/api/v1/tokens/stats',
      description: 'Get RVE token statistics',
      category: 'tokens',
      authentication: false,
      responseExample: {
        token: 'RVE',
        price_usd: 42.87,
        market_cap: 847300000000,
        circulating_supply: 19800000000,
        total_supply: 21000000000,
        max_supply: 21000000000,
        total_staked: 8400000000,
        staking_ratio: 42.4,
        price_change_24h: 12.4,
        volume_24h: 234000000,
        all_time_high: 58.92,
        all_time_low: 8.34,
        updated_at: '2024-12-09T15:25:00Z'
      }
    },
    {
      method: 'GET',
      path: '/api/v1/tokens/staking/pools',
      description: 'Get all staking pools',
      category: 'tokens',
      authentication: false,
      responseExample: {
        data: [
          {
            pool_id: 'pool_env_001',
            name: 'Environmental Assets Pool',
            total_staked: 3420000000,
            apy: 12.4,
            participants: 18923,
            rewards_distributed: 425000000,
            lock_period_days: 30,
            min_stake: 100,
            status: 'active'
          },
          {
            pool_id: 'pool_cul_001',
            name: 'Cultural Heritage Pool',
            total_staked: 1890000000,
            apy: 15.2,
            participants: 12847,
            rewards_distributed: 287000000,
            lock_period_days: 60,
            min_stake: 100,
            status: 'active'
          }
        ]
      }
    },
    {
      method: 'POST',
      path: '/api/v1/tokens/staking/stake',
      description: 'Stake RVE tokens in a pool',
      category: 'tokens',
      authentication: true,
      requestExample: {
        pool_id: 'pool_env_001',
        amount: 5000,
        lock_period_days: 30
      },
      responseExample: {
        stake_id: 'stake_92847',
        pool_id: 'pool_env_001',
        amount: 5000,
        apy: 12.4,
        estimated_rewards_annual: 620,
        unlock_date: '2025-01-09T15:30:00Z',
        transaction_hash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
        staked_at: '2024-12-09T15:30:00Z'
      }
    },

    // Custodians Endpoints
    {
      method: 'GET',
      path: '/api/v1/custodians',
      description: 'List all registered custodians',
      category: 'custodians',
      authentication: false,
      parameters: [
        { name: 'region', type: 'string', required: false, description: 'Filter by region', location: 'query' },
        { name: 'status', type: 'string', required: false, description: 'Filter by status (active, inactive)', location: 'query' },
      ],
      responseExample: {
        data: [
          {
            id: 'cust_af_089',
            name: 'Amazon Conservation Alliance',
            type: 'environmental',
            region: 'South America',
            country: 'Brazil',
            status: 'active',
            verified: true,
            assets_managed: 47,
            total_value_locked: {
              rve_tokens: 134700000,
              usd_value: 5774490000
            },
            performance: {
              verification_success_rate: 98.7,
              uptime_percentage: 99.4,
              response_time_ms: 45
            },
            contact: {
              email: 'contact@amazonalliance.org',
              website: 'https://amazonalliance.org'
            },
            wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
            registered_at: '2023-03-15T10:00:00Z'
          }
        ],
        pagination: {
          total: 1823,
          limit: 20,
          offset: 0,
          has_more: true
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v1/custodians/{id}/assets',
      description: 'Get assets managed by a specific custodian',
      category: 'custodians',
      authentication: false,
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Custodian ID', location: 'path' },
      ],
      responseExample: {
        custodian_id: 'cust_af_089',
        custodian_name: 'Amazon Conservation Alliance',
        assets: [
          {
            asset_id: 'asset_4821',
            name: 'Amazon Rainforest Restoration Project',
            type: 'environmental',
            status: 'verified',
            value_locked_rve: 2847000,
            last_verification: '2024-12-09T14:32:18Z'
          }
        ],
        total_assets: 47,
        total_value_usd: 5774490000
      }
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectEndpoint = (endpoint: APIEndpoint) => {
    setSelectedEndpoint(endpoint);
    setRequestBody(endpoint.requestExample ? JSON.stringify(endpoint.requestExample, null, 2) : '');
    setResponseData('');
  };

  const testEndpoint = async () => {
    if (!selectedEndpoint) return;
    
    setIsLoading(true);
    setResponseData('');
    
    // Simulate API call
    setTimeout(() => {
      setResponseData(JSON.stringify(selectedEndpoint.responseExample, null, 2));
      setIsLoading(false);
    }, 1000);
  };

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getMethodColor = (method: HTTPMethod) => {
    switch (method) {
      case 'GET': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'POST': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'PUT': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'PATCH': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'DELETE': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const generateCurlExample = (endpoint: APIEndpoint) => {
    let curl = `curl -X ${endpoint.method} 'https://api.rve.io${endpoint.path}'`;
    
    if (endpoint.authentication) {
      curl += ` \\\n  -H 'Authorization: Bearer YOUR_API_KEY'`;
    }
    
    curl += ` \\\n  -H 'Content-Type: application/json'`;
    
    if (endpoint.requestExample) {
      curl += ` \\\n  -d '${JSON.stringify(endpoint.requestExample)}'`;
    }
    
    return curl;
  };

  const generateJavaScriptExample = (endpoint: APIEndpoint) => {
    return `const response = await fetch('https://api.rve.io${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Content-Type': 'application/json',${endpoint.authentication ? '\n    \'Authorization\': \'Bearer YOUR_API_KEY\',' : ''}
  },${endpoint.requestExample ? `\n  body: JSON.stringify(${JSON.stringify(endpoint.requestExample, null, 4).replace(/\n/g, '\n  ')})` : ''}
});

const data = await response.json();
console.log(data);`;
  };

  const generatePythonExample = (endpoint: APIEndpoint) => {
    return `import requests

url = 'https://api.rve.io${endpoint.path}'
headers = {
    'Content-Type': 'application/json',${endpoint.authentication ? '\n    \'Authorization\': \'Bearer YOUR_API_KEY\',' : ''}
}
${endpoint.requestExample ? `data = ${JSON.stringify(endpoint.requestExample, null, 4).replace(/\n/g, '\n    ')}\n\n` : ''}response = requests.${endpoint.method.toLowerCase()}(url, headers=headers${endpoint.requestExample ? ', json=data' : ''})
print(response.json())`;
  };

  const filteredEndpoints = endpoints.filter(e => e.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl">API Explorer & Developer Portal</h2>
          <p className="text-emerald-300/70 mt-1">Interactive API documentation with live testing</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            <Code className="w-3 h-3 mr-1" />
            REST API v1
          </Badge>
          <Button variant="outline" className="bg-slate-900/90 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10">
            <Book className="w-4 h-4 mr-2" />
            Full Documentation
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Endpoints', value: endpoints.length, icon: Code },
          { label: 'Categories', value: categories.length, icon: Database },
          { label: 'API Version', value: 'v1.0', icon: Zap },
          { label: 'Uptime', value: '99.9%', icon: Check },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-white text-xl">{stat.value}</div>
                  <div className="text-emerald-300/70 text-sm">{stat.label}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Endpoint Categories */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6 lg:col-span-1">
          <h3 className="text-white mb-4">API Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategories.includes(category.id);
              const categoryEndpoints = endpoints.filter(e => e.category === category.id);
              
              return (
                <div key={category.id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(category.id);
                      toggleCategory(category.id);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-emerald-500/20 border border-emerald-500/30'
                        : 'bg-black/30 border border-emerald-500/10 hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-emerald-400" />
                      <span className="text-white text-sm">{category.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                        {category.count}
                      </Badge>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-emerald-300/70" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-emerald-300/70" />
                      )}
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-4 mt-2 space-y-1">
                      {categoryEndpoints.map((endpoint) => (
                        <button
                          key={endpoint.path}
                          onClick={() => selectEndpoint(endpoint)}
                          className={`w-full flex items-center gap-2 p-2 rounded text-left transition-colors ${
                            selectedEndpoint?.path === endpoint.path
                              ? 'bg-emerald-500/10 text-emerald-300'
                              : 'text-emerald-300/70 hover:bg-black/20 hover:text-emerald-300'
                          }`}
                        >
                          <Badge className={`${getMethodColor(endpoint.method)} text-xs px-2`}>
                            {endpoint.method}
                          </Badge>
                          <span className="text-xs font-mono truncate">{endpoint.path}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Main Content - Endpoint Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedEndpoint ? (
            <>
              {/* Endpoint Header */}
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getMethodColor(selectedEndpoint.method)}>
                        {selectedEndpoint.method}
                      </Badge>
                      <code className="text-emerald-300 text-lg font-mono">{selectedEndpoint.path}</code>
                    </div>
                    <p className="text-emerald-300/70">{selectedEndpoint.description}</p>
                  </div>
                  {selectedEndpoint.authentication && (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 ml-4">
                      <Lock className="w-3 h-3 mr-1" />
                      Auth Required
                    </Badge>
                  )}
                </div>

                {/* Parameters */}
                {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-white text-sm mb-3">Parameters</h4>
                    <div className="space-y-2">
                      {selectedEndpoint.parameters.map((param) => (
                        <div key={param.name} className="bg-black/30 rounded p-3 border border-emerald-500/10">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <code className="text-emerald-300 text-sm">{param.name}</code>
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                {param.type}
                              </Badge>
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                                {param.location}
                              </Badge>
                            </div>
                            {param.required && (
                              <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-emerald-300/70 text-xs mt-1">{param.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Interactive Tester */}
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white">Try It Out</h3>
                  <Button
                    onClick={testEndpoint}
                    disabled={isLoading}
                    className="bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isLoading ? 'Testing...' : 'Test Endpoint'}
                  </Button>
                </div>

                <Tabs defaultValue="request" className="w-full">
                  <TabsList className="bg-black/30 border border-emerald-500/10">
                    <TabsTrigger value="request" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
                      Request
                    </TabsTrigger>
                    <TabsTrigger value="response" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
                      Response
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="request" className="mt-4 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-emerald-300/70 text-sm">Base URL</label>
                      </div>
                      <Input
                        value="https://api.rve.io"
                        disabled
                        className="bg-black/30 border-emerald-500/10 text-emerald-300/70"
                      />
                    </div>

                    {selectedEndpoint.authentication && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-emerald-300/70 text-sm">Authorization Header</label>
                        </div>
                        <Input
                          placeholder="Bearer YOUR_API_KEY"
                          className="bg-black/30 border-emerald-500/10 text-emerald-300"
                        />
                      </div>
                    )}

                    {selectedEndpoint.requestExample && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-emerald-300/70 text-sm">Request Body (JSON)</label>
                        </div>
                        <Textarea
                          value={requestBody}
                          onChange={(e) => setRequestBody(e.target.value)}
                          className="bg-black/30 border-emerald-500/10 text-emerald-300 font-mono text-sm min-h-[200px]"
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="response" className="mt-4">
                    {responseData ? (
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(responseData, 'response')}
                          className="absolute top-2 right-2 bg-black/50 border-emerald-500/20"
                        >
                          {copiedCode === 'response' ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                        <pre className="bg-black/30 border border-emerald-500/10 rounded-lg p-4 overflow-auto max-h-[400px]">
                          <code className="text-emerald-300 text-sm">{responseData}</code>
                        </pre>
                      </div>
                    ) : (
                      <div className="bg-black/30 border border-emerald-500/10 rounded-lg p-8 text-center">
                        <Play className="w-12 h-12 text-emerald-300/30 mx-auto mb-3" />
                        <p className="text-emerald-300/70">Click "Test Endpoint" to see the response</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Code Examples */}
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
                <h3 className="text-white mb-4">Code Examples</h3>
                <Tabs defaultValue="curl" className="w-full">
                  <TabsList className="bg-black/30 border border-emerald-500/10">
                    <TabsTrigger value="curl" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
                      cURL
                    </TabsTrigger>
                    <TabsTrigger value="javascript" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
                      JavaScript
                    </TabsTrigger>
                    <TabsTrigger value="python" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
                      Python
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="curl" className="mt-4 relative">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generateCurlExample(selectedEndpoint), 'curl')}
                      className="absolute top-2 right-2 bg-black/50 border-emerald-500/20"
                    >
                      {copiedCode === 'curl' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                    <pre className="bg-black/30 border border-emerald-500/10 rounded-lg p-4 overflow-auto">
                      <code className="text-emerald-300 text-sm">{generateCurlExample(selectedEndpoint)}</code>
                    </pre>
                  </TabsContent>

                  <TabsContent value="javascript" className="mt-4 relative">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generateJavaScriptExample(selectedEndpoint), 'js')}
                      className="absolute top-2 right-2 bg-black/50 border-emerald-500/20"
                    >
                      {copiedCode === 'js' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                    <pre className="bg-black/30 border border-emerald-500/10 rounded-lg p-4 overflow-auto">
                      <code className="text-emerald-300 text-sm">{generateJavaScriptExample(selectedEndpoint)}</code>
                    </pre>
                  </TabsContent>

                  <TabsContent value="python" className="mt-4 relative">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatePythonExample(selectedEndpoint), 'python')}
                      className="absolute top-2 right-2 bg-black/50 border-emerald-500/20"
                    >
                      {copiedCode === 'python' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                    <pre className="bg-black/30 border border-emerald-500/10 rounded-lg p-4 overflow-auto">
                      <code className="text-emerald-300 text-sm">{generatePythonExample(selectedEndpoint)}</code>
                    </pre>
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Response Schema */}
              {selectedEndpoint.responseExample && (
                <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white">Example Response</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(JSON.stringify(selectedEndpoint.responseExample, null, 2), 'example')}
                      className="bg-black/50 border-emerald-500/20"
                    >
                      {copiedCode === 'example' ? (
                        <Check className="w-3 h-3 mr-1" />
                      ) : (
                        <Copy className="w-3 h-3 mr-1" />
                      )}
                      Copy
                    </Button>
                  </div>
                  <pre className="bg-black/30 border border-emerald-500/10 rounded-lg p-4 overflow-auto max-h-[400px]">
                    <code className="text-emerald-300 text-sm">
                      {JSON.stringify(selectedEndpoint.responseExample, null, 2)}
                    </code>
                  </pre>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-12 text-center">
              <Code className="w-16 h-16 text-emerald-300/30 mx-auto mb-4" />
              <h3 className="text-white text-xl mb-2">Select an Endpoint</h3>
              <p className="text-emerald-300/70">Choose an endpoint from the sidebar to view details and test it</p>
            </Card>
          )}
        </div>
      </div>

      {/* Authentication Guide */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/20 p-6">
        <h3 className="text-white mb-4">Authentication</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-emerald-300 text-sm mb-2">API Key Authentication</h4>
            <p className="text-emerald-300/70 text-sm mb-3">
              Include your API key in the Authorization header for authenticated endpoints.
            </p>
            <pre className="bg-black/30 border border-emerald-500/10 rounded-lg p-3 text-sm">
              <code className="text-emerald-300">
                {`Authorization: Bearer YOUR_API_KEY`}
              </code>
            </pre>
          </div>
          <div>
            <h4 className="text-emerald-300 text-sm mb-2">Rate Limits</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-emerald-300/70">Free Tier:</span>
                <span className="text-white">1,000 requests/hour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300/70">Pro Tier:</span>
                <span className="text-white">10,000 requests/hour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300/70">Enterprise:</span>
                <span className="text-white">Unlimited</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
