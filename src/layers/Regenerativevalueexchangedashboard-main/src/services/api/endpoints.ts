/**
 * RVE API Endpoints
 * Type-safe API endpoint definitions with validation
 * Connected to Atlas Genesis backend at /api/rve
 */

import { apiClient, PaginatedResponse, APIResponse } from './client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface RVEAssetClass {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  total_value: number;
  token_supply: number;
  price_per_unit: number;
  verification_status: string;
  impact_score: number;
  environmental_benefits: Record<string, any>;
  social_benefits: Record<string, any>;
  governance_details: Record<string, any>;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface RVETokenEconomics {
  id: string;
  token_symbol: string;
  token_name: string;
  total_supply: number;
  circulating_supply: number;
  reserved_supply: number;
  burn_rate: number;
  inflation_rate: number;
  staking_rewards_rate: number;
  governance_weight: number;
  utility_score: number;
  market_cap: number;
  price: number;
  price_change_24h: number;
  volume_24h: number;
  distribution_json: Record<string, number>;
  vesting_schedule: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RVECustodian {
  id: string;
  name: string;
  type: string;
  description: string;
  logo_url: string;
  website: string;
  jurisdiction: string;
  regulatory_status: string;
  total_assets_custodied: number;
  coverage_percentage: number;
  insurance_coverage: number;
  verification_score: number;
  contact_info: Record<string, string>;
  certifications: string[];
  audit_history: Record<string, any>[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RVEOralceNetwork {
  id: string;
  name: string;
  network_type: string;
  description: string;
  data_sources: string[];
  update_frequency: string;
  accuracy_score: number;
  reliability_score: number;
  latency_ms: number;
  verification_protocols: string[];
  api_endpoint: string;
  documentation_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RVEImpactMetric {
  id: string;
  metric_type: string;
  category: string;
  label: string;
  value: number;
  unit: string;
  change_percentage: number;
  change_direction: string;
  timeframe: string;
  verified: boolean;
  data_sources: string[];
  last_verified_at: string;
  created_at: string;
  updated_at: string;
}

export interface RVEGoveranceProposal {
  id: string;
  title: string;
  description: string;
  proposal_type: string;
  status: string;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  total_votes: number;
  voting_power_for: number;
  voting_power_against: number;
  voting_power_abstain: number;
  quorum_required: number;
  quorum_reached: boolean;
  proposer_id: string;
  proposer_name: string;
  voting_start: string;
  voting_end: string;
  execution_delay: number;
  executed_at: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RVETransaction {
  id: string;
  transaction_hash: string;
  asset_class_id: string;
  from_address: string;
  to_address: string;
  transaction_type: string;
  amount: number;
  token_symbol: string;
  price_at_execution: number;
  status: string;
  carbon_offset: number;
  water_conserved: number;
  biodiversity_impact: number;
  community_impact: Record<string, any>;
  oracle_feeds: Record<string, any>;
  verification_proof: string;
  executed_by: string;
  executed_at: string;
  created_at: string;
}

export interface RVEAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  source: string;
  affected_entity_id: string;
  affected_entity_type: string;
  metadata: Record<string, any>;
  is_read: boolean;
  is_dismissed: boolean;
  triggered_at: string;
  expires_at: string;
  created_at: string;
}

export interface RVEDashboardSummary {
  assetClasses: RVEAssetClass[];
  tokenEconomics: RVETokenEconomics | null;
  custodiansCount: number;
  oracleNetworksCount: number;
  impactMetrics: {
    totalCarbonSequestered: number;
    totalWaterConserved: number;
    totalBiodiversityScore: number;
    totalCommunityImpact: number;
    totalProjectsFunded: number;
    environmentalMetrics: RVEImpactMetric[];
    socialMetrics: RVEImpactMetric[];
    culturalMetrics: RVEImpactMetric[];
  };
  recentProposals: RVEGoveranceProposal[];
  activeAlerts: number;
  alerts: RVEAlert[];
  totalMarketValue: number;
  totalTokenSupply: number;
  averageImpactScore: number;
}

export interface RVEMarketData {
  id: string;
  asset_class_id: string;
  timestamp: string;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  volume: number;
  number_of_trades: number;
  bid_depth: number;
  ask_depth: number;
  volatility: number;
  oracle_price: number;
  created_at: string;
}

// ============================================================================
// DASHBOARD ENDPOINTS
// ============================================================================

export const rveDashboardAPI = {
  getSummary: () => 
    apiClient.get<APIResponse<RVEDashboardSummary>>('/rve/dashboard'),
};

// ============================================================================
// ASSET CLASS ENDPOINTS
// ============================================================================

export const rveAssetAPI = {
  list: (params?: { category?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    return apiClient.get<APIResponse<RVEAssetClass[]>>(`/rve/assets?${searchParams.toString()}`);
  },

  getById: (id: string) => 
    apiClient.get<APIResponse<RVEAssetClass>>(`/rve/assets/${id}`),

  create: (data: Partial<RVEAssetClass>) =>
    apiClient.post<APIResponse<RVEAssetClass>>('/rve/assets', data),
};

// ============================================================================
// TOKEN ECONOMICS ENDPOINTS
// ============================================================================

export const rveTokenEconomicsAPI = {
  get: () => 
    apiClient.get<APIResponse<RVETokenEconomics>>('/rve/token-economics'),

  update: (id: string, data: Partial<RVETokenEconomics>) =>
    apiClient.put<APIResponse<RVETokenEconomics>>(`/rve/token-economics/${id}`, data),
};

// ============================================================================
// CUSTODIAN ENDPOINTS
// ============================================================================

export const rveCustodianAPI = {
  list: (type?: string) => {
    const params = type ? `?type=${type}` : '';
    return apiClient.get<APIResponse<RVECustodian[]>>(`/rve/custodians${params}`);
  },

  getById: (id: string) =>
    apiClient.get<APIResponse<RVECustodian>>(`/rve/custodians/${id}`),
};

// ============================================================================
// ORACLE NETWORK ENDPOINTS
// ============================================================================

export const rveOracleAPI = {
  list: (type?: string) => {
    const params = type ? `?type=${type}` : '';
    return apiClient.get<APIResponse<RVEOralceNetwork[]>>(`/rve/oracle-networks${params}`);
  },

  getById: (id: string) =>
    apiClient.get<APIResponse<RVEOralceNetwork>>(`/rve/oracle-networks/${id}`),
};

// ============================================================================
// IMPACT METRICS ENDPOINTS
// ============================================================================

export const rveImpactAPI = {
  list: (category?: string) => {
    const params = category ? `?category=${category}` : '';
    return apiClient.get<APIResponse<RVEImpactMetric[]>>(`/rve/impact-metrics${params}`);
  },

  getAggregated: () =>
    apiClient.get<APIResponse<RVEDashboardSummary['impactMetrics']>>('/rve/impact-metrics/aggregated'),
};

// ============================================================================
// GOVERNANCE ENDPOINTS
// ============================================================================

export const rveGovernanceAPI = {
  listProposals: (status?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (limit) params.set('limit', limit.toString());
    return apiClient.get<APIResponse<RVEGoveranceProposal[]>>(`/rve/governance/proposals?${params.toString()}`);
  },

  getProposal: (id: string) =>
    apiClient.get<APIResponse<RVEGoveranceProposal>>(`/rve/governance/proposals/${id}`),

  createProposal: (data: Partial<RVEGoveranceProposal>) =>
    apiClient.post<APIResponse<RVEGoveranceProposal>>('/rve/governance/proposals', data),

  vote: (id: string, vote: 'for' | 'against' | 'abstain', votingPower: number = 0) =>
    apiClient.post<APIResponse<RVEGoveranceProposal>>(`/rve/governance/proposals/${id}/vote`, {
      vote,
      votingPower,
    }),
};

// ============================================================================
// TRANSACTION ENDPOINTS
// ============================================================================

export const rveTransactionAPI = {
  list: (assetClassId?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (assetClassId) params.set('assetClassId', assetClassId);
    if (limit) params.set('limit', limit.toString());
    return apiClient.get<APIResponse<RVETransaction[]>>(`/rve/transactions?${params.toString()}`);
  },

  create: (data: Partial<RVETransaction>) =>
    apiClient.post<APIResponse<RVETransaction>>('/rve/transactions', data),
};

// ============================================================================
// COMPLIANCE ENDPOINTS
// ============================================================================

export const rveComplianceAPI = {
  list: (entityType?: string) => {
    const params = entityType ? `?entityType=${entityType}` : '';
    return apiClient.get<APIResponse<any[]>>(`/rve/compliance${params}`);
  },
};

// ============================================================================
// ALERTS ENDPOINTS
// ============================================================================

export const rveAlertAPI = {
  list: (severity?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (severity) params.set('severity', severity);
    if (limit) params.set('limit', limit.toString());
    return apiClient.get<APIResponse<RVEAlert[]>>(`/rve/alerts?${params.toString()}`);
  },

  create: (data: Partial<RVEAlert>) =>
    apiClient.post<APIResponse<RVEAlert>>('/rve/alerts', data),

  dismiss: (id: string) =>
    apiClient.put<APIResponse<void>>(`/rve/alerts/${id}/dismiss`),
};

// ============================================================================
// MARKET DATA ENDPOINTS
// ============================================================================

export const rveMarketDataAPI = {
  get: (assetClassId: string, limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    return apiClient.get<APIResponse<RVEMarketData[]>>(`/rve/market-data/${assetClassId}${params}`);
  },
};

// ============================================================================
// ORIGINAL ASSET ENDPOINTS (for backward compatibility)
// ============================================================================

export const assetAPI = {
  list: (params?: {
    category?: string;
    verified?: boolean;
    page?: number;
    pageSize?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.verified !== undefined) searchParams.set('verified', params.verified.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
    return apiClient.get<APIResponse<RVEAssetClass[]>>(`/rve/assets?${searchParams.toString()}`);
  },

  getById: (id: string) => 
    apiClient.get<APIResponse<RVEAssetClass>>(`/rve/assets/${id}`),
};

// ============================================================================
// CUSTODIAN ENDPOINTS (for backward compatibility)
// ============================================================================

export const custodianAPI = {
  list: (params?: {
    type?: string;
    verified?: boolean;
    page?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.verified !== undefined) searchParams.set('verified', params.verified.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    return apiClient.get<APIResponse<RVECustodian[]>>(`/rve/custodians?${searchParams.toString()}`);
  },

  getById: (id: string) =>
    apiClient.get<APIResponse<RVECustodian>>(`/rve/custodians/${id}`),
};

// ============================================================================
// GOVERNANCE ENDPOINTS (for backward compatibility)
// ============================================================================

export const governanceAPI = {
  listProposals: (params?: {
    status?: string;
    category?: string;
    page?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.page) searchParams.set('page', params.page.toString());
    return apiClient.get<APIResponse<RVEGoveranceProposal[]>>(`/rve/governance/proposals?${searchParams.toString()}`);
  },

  getProposal: (id: string) =>
    apiClient.get<APIResponse<RVEGoveranceProposal>>(`/rve/governance/proposals/${id}`),

  createProposal: (data: Partial<RVEGoveranceProposal>) =>
    apiClient.post<APIResponse<RVEGoveranceProposal>>('/rve/governance/proposals', data),

  vote: (proposalId: string, vote: 'for' | 'against' | 'abstain', amount: number) =>
    apiClient.post<APIResponse<{ txHash: string }>>(`/rve/governance/proposals/${proposalId}/vote`, {
      vote,
      votingPower: amount,
    }),
};
