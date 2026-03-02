/**
 * RVE (Regenerative Value Exchange) Service
 * Handles all operations for the regenerative value exchange dashboard
 */

import { query } from '../db';
import { Request } from 'express';

interface SecurityContext {
  userId?: string;
  ip?: string;
  userAgent?: string;
}

// Security event logger mock
const logSecurityEvent = async (
  event: { type: string; userId?: string; details: Record<string, any> },
  _req?: Request,
  _context?: SecurityContext
) => {
  console.log('RVE Security Event:', event);
};

// Types for RVE
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
  created_at: Date;
  updated_at: Date;
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
  distribution_json: Record<string, any>;
  vesting_schedule: Record<string, any>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
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
  contact_info: Record<string, any>;
  certifications: string[];
  audit_history: Record<string, any>[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
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
  created_at: Date;
  updated_at: Date;
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
  last_verified_at: Date;
  created_at: Date;
  updated_at: Date;
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
  voting_start: Date;
  voting_end: Date;
  execution_delay: number;
  executed_at: Date;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
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
  executed_at: Date;
  created_at: Date;
}

export interface RVEComplianceRecord {
  id: string;
  entity_name: string;
  entity_type: string;
  compliance_type: string;
  standard: string;
  status: string;
  certificate_number: string;
  certificate_url: string;
  issued_at: Date;
  expires_at: Date;
  auditor_name: string;
  audit_report_url: string;
  notes: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
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
  triggered_at: Date;
  expires_at: Date;
  created_at: Date;
}

export interface RVEMarketData {
  id: string;
  asset_class_id: string;
  timestamp: Date;
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
  created_at: Date;
}

// RVE Service
export const rveService = {
  // Asset Classes
  async getAssetClasses(limit: number = 50, offset: number = 0): Promise<RVEAssetClass[]> {
    try {
      const result = await query(
        `SELECT * FROM rve_asset_classes WHERE is_active = true ORDER BY display_order ASC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching RVE asset classes:', error);
      throw error;
    }
  },

  async getAssetClassById(id: string): Promise<RVEAssetClass | null> {
    try {
      const result = await query(
        'SELECT * FROM rve_asset_classes WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching RVE asset class:', error);
      throw error;
    }
  },

  async getAssetClassesByCategory(category: string): Promise<RVEAssetClass[]> {
    try {
      const result = await query(
        `SELECT * FROM rve_asset_classes WHERE category = $1 AND is_active = true ORDER BY display_order ASC`,
        [category]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching RVE asset classes by category:', error);
      throw error;
    }
  },

  async createAssetClass(asset: Partial<RVEAssetClass>): Promise<RVEAssetClass> {
    try {
      const result = await query(
        `INSERT INTO rve_asset_classes (name, description, category, icon, total_value, token_supply, price_per_unit, impact_score, environmental_benefits, social_benefits, governance_details)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          asset.name,
          asset.description,
          asset.category,
          asset.icon,
          asset.total_value || 0,
          asset.token_supply || 0,
          asset.price_per_unit || 0,
          asset.impact_score || 0,
          JSON.stringify(asset.environmental_benefits || {}),
          JSON.stringify(asset.social_benefits || {}),
          JSON.stringify(asset.governance_details || {})
        ]
      );

      await logSecurityEvent(
        { type: 'RVE_ASSET_CLASS_CREATED', userId: asset.name, details: { assetId: result.rows[0].id } }
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating RVE asset class:', error);
      throw error;
    }
  },

  // Token Economics
  async getTokenEconomics(): Promise<RVETokenEconomics | null> {
    try {
      const result = await query(
        `SELECT * FROM rve_token_economics WHERE is_active = true ORDER BY created_at DESC LIMIT 1`
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching RVE token economics:', error);
      throw error;
    }
  },

  async updateTokenEconomics(id: string, updates: Partial<RVETokenEconomics>): Promise<RVETokenEconomics | null> {
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.price !== undefined) {
        setClauses.push(`price = $${paramIndex++}`);
        values.push(updates.price);
      }
      if (updates.price_change_24h !== undefined) {
        setClauses.push(`price_change_24h = $${paramIndex++}`);
        values.push(updates.price_change_24h);
      }
      if (updates.volume_24h !== undefined) {
        setClauses.push(`volume_24h = $${paramIndex++}`);
        values.push(updates.volume_24h);
      }
      if (updates.market_cap !== undefined) {
        setClauses.push(`market_cap = $${paramIndex++}`);
        values.push(updates.market_cap);
      }

      if (setClauses.length === 0) return null;

      setClauses.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const result = await query(
        `UPDATE rve_token_economics SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating RVE token economics:', error);
      throw error;
    }
  },

  // Custodians
  async getCustodians(type?: string): Promise<RVECustodian[]> {
    try {
      let queryText = 'SELECT * FROM rve_custodians WHERE is_active = true';
      const params: any[] = [];

      if (type) {
        queryText += ' AND type = $1';
        params.push(type);
      }

      queryText += ' ORDER BY verification_score DESC';

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching RVE custodians:', error);
      throw error;
    }
  },

  async getCustodianById(id: string): Promise<RVECustodian | null> {
    try {
      const result = await query(
        'SELECT * FROM rve_custodians WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching RVE custodian:', error);
      throw error;
    }
  },

  // Oracle Networks
  async getOracleNetworks(networkType?: string): Promise<RVEOralceNetwork[]> {
    try {
      let queryText = 'SELECT * FROM rve_oracle_networks WHERE is_active = true';
      const params: any[] = [];

      if (networkType) {
        queryText += ' AND network_type = $1';
        params.push(networkType);
      }

      queryText += ' ORDER BY accuracy_score DESC';

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching RVE oracle networks:', error);
      throw error;
    }
  },

  async getOracleNetworkById(id: string): Promise<RVEOralceNetwork | null> {
    try {
      const result = await query(
        'SELECT * FROM rve_oracle_networks WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching RVE oracle network:', error);
      throw error;
    }
  },

  // Impact Metrics
  async getImpactMetrics(category?: string): Promise<RVEImpactMetric[]> {
    try {
      let queryText = 'SELECT * FROM rve_impact_metrics';
      const params: any[] = [];

      if (category) {
        queryText += ' WHERE category = $1';
        params.push(category);
      }

      queryText += ' ORDER BY category, label';

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching RVE impact metrics:', error);
      throw error;
    }
  },

  async getAggregatedImpactMetrics(): Promise<Record<string, any>> {
    try {
      const metrics = await this.getImpactMetrics();

      const aggregated = {
        totalCarbonSequestered: 0,
        totalWaterConserved: 0,
        totalBiodiversityScore: 0,
        totalCommunityImpact: 0,
        totalProjectsFunded: 0,
        environmentalMetrics: [] as RVEImpactMetric[],
        socialMetrics: [] as RVEImpactMetric[],
        culturalMetrics: [] as RVEImpactMetric[]
      };

      metrics.forEach((metric) => {
        if (metric.category === 'carbon') {
          aggregated.totalCarbonSequestered += parseFloat(String(metric.value));
        } else if (metric.category === 'water') {
          aggregated.totalWaterConserved += parseFloat(String(metric.value));
        } else if (metric.category === 'biodiversity') {
          aggregated.totalBiodiversityScore += parseFloat(String(metric.value));
        } else if (metric.category === 'community') {
          aggregated.totalCommunityImpact += parseFloat(String(metric.value));
        }

        if (metric.category === 'environmental') {
          aggregated.environmentalMetrics.push(metric);
        } else if (metric.category === 'social') {
          aggregated.socialMetrics.push(metric);
        } else if (metric.category === 'cultural') {
          aggregated.culturalMetrics.push(metric);
        }
      });

      return aggregated;
    } catch (error) {
      console.error('Error aggregating RVE impact metrics:', error);
      throw error;
    }
  },

  // Governance Proposals
  async getGovernanceProposals(status?: string, limit: number = 20): Promise<RVEGoveranceProposal[]> {
    try {
      let queryText = 'SELECT * FROM rve_governance_proposals';
      const params: any[] = [];

      if (status) {
        queryText += ' WHERE status = $1';
        params.push(status);
      }

      queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching RVE governance proposals:', error);
      throw error;
    }
  },

  async getGovernanceProposalById(id: string): Promise<RVEGoveranceProposal | null> {
    try {
      const result = await query(
        'SELECT * FROM rve_governance_proposals WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching RVE governance proposal:', error);
      throw error;
    }
  },

  async createGovernanceProposal(proposal: Partial<RVEGoveranceProposal>): Promise<RVEGoveranceProposal> {
    try {
      const result = await query(
        `INSERT INTO rve_governance_proposals (title, description, proposal_type, proposer_id, proposer_name, voting_start, voting_end, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          proposal.title,
          proposal.description,
          proposal.proposal_type,
          proposal.proposer_id,
          proposal.proposer_name,
          proposal.voting_start,
          proposal.voting_end,
          JSON.stringify(proposal.metadata || {})
        ]
      );

      await logSecurityEvent(
        { type: 'RVE_PROPOSAL_CREATED', userId: proposal.proposer_id, details: { proposalId: result.rows[0].id } }
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating RVE governance proposal:', error);
      throw error;
    }
  },

  async voteOnProposal(proposalId: string, vote: 'for' | 'against' | 'abstain', votingPower: number): Promise<RVEGoveranceProposal | null> {
    try {
      const column = vote === 'for' ? 'votes_for' : vote === 'against' ? 'votes_against' : 'votes_abstain';
      const powerColumn = vote === 'for' ? 'voting_power_for' : vote === 'against' ? 'voting_power_against' : 'voting_power_abstain';

      const result = await query(
        `UPDATE rve_governance_proposals 
         SET ${column} = ${column} + 1,
             ${powerColumn} = ${powerColumn} + $1,
             total_votes = total_votes + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [votingPower, proposalId]
      );

      await logSecurityEvent(
        { type: 'RVE_PROPOSAL_VOTED', details: { proposalId, vote } }
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error voting on RVE proposal:', error);
      throw error;
    }
  },

  // Transactions
  async getTransactions(assetClassId?: string, limit: number = 50): Promise<RVETransaction[]> {
    try {
      let queryText = 'SELECT * FROM rve_transactions';
      const params: any[] = [];

      if (assetClassId) {
        queryText += ' WHERE asset_class_id = $1';
        params.push(assetClassId);
      }

      queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching RVE transactions:', error);
      throw error;
    }
  },

  async createTransaction(transaction: Partial<RVETransaction>): Promise<RVETransaction> {
    try {
      const result = await query(
        `INSERT INTO rve_transactions (transaction_hash, asset_class_id, from_address, to_address, transaction_type, amount, token_symbol, price_at_execution, carbon_offset, water_conserved, biodiversity_impact, executed_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          transaction.transaction_hash,
          transaction.asset_class_id,
          transaction.from_address,
          transaction.to_address,
          transaction.transaction_type,
          transaction.amount,
          transaction.token_symbol,
          transaction.price_at_execution,
          transaction.carbon_offset || 0,
          transaction.water_conserved || 0,
          transaction.biodiversity_impact || 0,
          transaction.executed_by
        ]
      );

      await logSecurityEvent(
        { type: 'RVE_TRANSACTION_CREATED', userId: transaction.executed_by, details: { txHash: transaction.transaction_hash } }
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating RVE transaction:', error);
      throw error;
    }
  },

  // Compliance Records
  async getComplianceRecords(entityType?: string): Promise<RVEComplianceRecord[]> {
    try {
      let queryText = 'SELECT * FROM rve_compliance_records WHERE is_active = true';
      const params: any[] = [];

      if (entityType) {
        queryText += ' AND entity_type = $1';
        params.push(entityType);
      }

      queryText += ' ORDER BY created_at DESC';

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching RVE compliance records:', error);
      throw error;
    }
  },

  // Alerts
  async getAlerts(severity?: string, limit: number = 50): Promise<RVEAlert[]> {
    try {
      let queryText = 'SELECT * FROM rve_alerts WHERE is_dismissed = false';
      const params: any[] = [];

      if (severity) {
        queryText += ' AND severity = $1';
        params.push(severity);
      }

      queryText += ` ORDER BY triggered_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching RVE alerts:', error);
      throw error;
    }
  },

  async createAlert(alert: Partial<RVEAlert>): Promise<RVEAlert> {
    try {
      const result = await query(
        `INSERT INTO rve_alerts (alert_type, severity, title, message, source, affected_entity_id, affected_entity_type, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          alert.alert_type,
          alert.severity || 'info',
          alert.title,
          alert.message,
          alert.source,
          alert.affected_entity_id,
          alert.affected_entity_type,
          JSON.stringify(alert.metadata || {})
        ]
      );

      await logSecurityEvent(
        { type: 'RVE_ALERT_TRIGGERED', details: { alertType: alert.alert_type, severity: alert.severity } }
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating RVE alert:', error);
      throw error;
    }
  },

  async dismissAlert(alertId: string): Promise<boolean> {
    try {
      const result = await query(
        'UPDATE rve_alerts SET is_dismissed = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
        [alertId]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error dismissing RVE alert:', error);
      throw error;
    }
  },

  // Market Data
  async getMarketData(assetClassId: string, limit: number = 100): Promise<RVEMarketData[]> {
    try {
      const result = await query(
        `SELECT * FROM rve_market_data WHERE asset_class_id = $1 ORDER BY timestamp DESC LIMIT $2`,
        [assetClassId, limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching RVE market data:', error);
      throw error;
    }
  },

  // Dashboard Summary
  async getDashboardSummary(): Promise<Record<string, any>> {
    try {
      const [assetClasses, tokenEconomics, custodians, oracleNetworks, impactMetrics, proposals, alerts] = await Promise.all([
        this.getAssetClasses(8, 0),
        this.getTokenEconomics(),
        this.getCustodians(),
        this.getOracleNetworks(),
        this.getImpactMetrics(),
        this.getGovernanceProposals(undefined, 5),
        this.getAlerts(undefined, 10)
      ]);

      const aggregatedImpact = await this.getAggregatedImpactMetrics();

      return {
        assetClasses,
        tokenEconomics,
        custodiansCount: custodians.length,
        oracleNetworksCount: oracleNetworks.length,
        impactMetrics: aggregatedImpact,
        recentProposals: proposals,
        activeAlerts: alerts.filter(a => !a.is_read).length,
        alerts: alerts.slice(0, 5),
        totalMarketValue: assetClasses.reduce((sum, ac) => sum + parseFloat(String(ac.total_value || 0)), 0),
        totalTokenSupply: assetClasses.reduce((sum, ac) => sum + parseFloat(String(ac.token_supply || 0)), 0),
        averageImpactScore: assetClasses.length > 0 
          ? assetClasses.reduce((sum, ac) => sum + parseFloat(String(ac.impact_score || 0)), 0) / assetClasses.length 
          : 0
      };
    } catch (error) {
      console.error('Error fetching RVE dashboard summary:', error);
      throw error;
    }
  }
};

export default rveService;
