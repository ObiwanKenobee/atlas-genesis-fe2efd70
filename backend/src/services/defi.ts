import { query } from '../db';

export interface DeFiProduct {
  id: number;
  name: string;
  description: string;
  price_range: string;
  pricing_mechanism: string;
  value_justification: string;
  features: string[];
  benefits: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DeFiSegment {
  id: number;
  name: string;
  description: string;
  primary_customers: string;
  what_is_being_priced: string;
  pricing_mechanism: string;
  price_range: string;
  value_justification: string;
  features: string[];
  benefits: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DeFiTechnicalInfrastructure {
  id: number;
  name: string;
  description: string;
  features: string[];
  technology: string;
  security_rating: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlockchainNetwork {
  id: number;
  name: string;
  chain_id: string;
  symbol: string;
  average_block_time: string;
  transaction_fee: string;
  network_type: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SmartContract {
  id: number;
  name: string;
  description: string;
  contract_address: string;
  abi: string;
  network: string;
  verified: boolean;
  visibility: string;
  created_by: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface OracleFeed {
  id: number;
  name: string;
  description: string;
  oracle_provider: string;
  update_frequency: string;
  data_sources: string;
  network: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DeFiStatistics {
  id: number;
  total_value_locked: number;
  daily_volume: number;
  active_addresses: number;
  average_apy: number;
  total_transactions: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

class DeFiService {
  static async getProducts(): Promise<DeFiProduct[]> {
    try {
      const result = await query(`
        SELECT 
          dp.*,
          COALESCE(dp.price_range, 'Low per unit, high volume') as price_range,
          COALESCE(dp.pricing_mechanism, 'Protocol, custody & usage fees') as pricing_mechanism,
          COALESCE(dp.value_justification, 'Enables new financial instruments safely') as value_justification
        FROM defi_products dp
        WHERE dp.is_active = true
        ORDER BY dp.display_order ASC
      `);
      return result.rows as DeFiProduct[];
    } catch (error) {
      console.error('Get DeFi products error:', error);
      throw new Error('Failed to fetch DeFi products');
    }
  }

  static async getProductById(id: number): Promise<DeFiProduct | null> {
    try {
      const result = await query(`
        SELECT 
          dp.*,
          COALESCE(dp.price_range, 'Low per unit, high volume') as price_range,
          COALESCE(dp.pricing_mechanism, 'Protocol, custody & usage fees') as pricing_mechanism,
          COALESCE(dp.value_justification, 'Enables new financial instruments safely') as value_justification
        FROM defi_products dp
        WHERE dp.id = $1 AND dp.is_active = true
      `, [id]);
      
      return result.rows.length > 0 ? (result.rows[0] as DeFiProduct) : null;
    } catch (error) {
      console.error('Get DeFi product error:', error);
      throw new Error('Failed to fetch DeFi product');
    }
  }

  static async getSegments(): Promise<DeFiSegment[]> {
    try {
      const result = await query(`
        SELECT * FROM defi_segments 
        WHERE is_active = true 
        ORDER BY display_order ASC
      `);
      return result.rows as DeFiSegment[];
    } catch (error) {
      console.error('Get DeFi segments error:', error);
      throw new Error('Failed to fetch DeFi segments');
    }
  }

  static async getTechnicalInfrastructure(): Promise<DeFiTechnicalInfrastructure[]> {
    try {
      const result = await query(`
        SELECT * FROM defi_technical_infrastructure 
        WHERE is_active = true 
        ORDER BY display_order ASC
      `);
      return result.rows as DeFiTechnicalInfrastructure[];
    } catch (error) {
      console.error('Get DeFi technical infrastructure error:', error);
      throw new Error('Failed to fetch DeFi technical infrastructure');
    }
  }

  static async getBlockchainNetworks(): Promise<BlockchainNetwork[]> {
    try {
      const result = await query(`
        SELECT 
          bn.*,
          COALESCE(bn.average_block_time, '12 seconds') as average_block_time,
          COALESCE(bn.transaction_fee, 'Variable') as transaction_fee
        FROM blockchain_networks bn
        WHERE bn.is_active = true
        ORDER BY bn.display_order ASC
      `);
      return result.rows as BlockchainNetwork[];
    } catch (error) {
      console.error('Get blockchain networks error:', error);
      throw new Error('Failed to fetch blockchain networks');
    }
  }

  static async getSmartContracts(userId?: number): Promise<SmartContract[]> {
    try {
      if (userId) {
        const result = await query(`
          SELECT 
            sc.*,
            COALESCE(sc.verified, false) as verified
          FROM smart_contracts sc
          WHERE sc.is_active = true
          AND (sc.visibility = 'public' OR (sc.visibility = 'private' AND created_by = $1))
          ORDER BY sc.display_order ASC
        `, [userId]);
        return result.rows as SmartContract[];
      } else {
        const result = await query(`
          SELECT 
            sc.*,
            COALESCE(sc.verified, false) as verified
          FROM smart_contracts sc
          WHERE sc.is_active = true AND sc.visibility = 'public'
          ORDER BY sc.display_order ASC
        `);
        return result.rows as SmartContract[];
      }
    } catch (error) {
      console.error('Get smart contracts error:', error);
      throw new Error('Failed to fetch smart contracts');
    }
  }

  static async getOracleFeeds(): Promise<OracleFeed[]> {
    try {
      const result = await query(`
        SELECT 
          of.*,
          COALESCE(of.update_frequency, 'Real-time') as update_frequency,
          COALESCE(of.data_sources, 'Multiple verified sources') as data_sources
        FROM oracle_feeds of
        WHERE of.is_active = true
        ORDER BY of.display_order ASC
      `);
      return result.rows as OracleFeed[];
    } catch (error) {
      console.error('Get oracle feeds error:', error);
      throw new Error('Failed to fetch oracle feeds');
    }
  }

  static async getStatistics(): Promise<DeFiStatistics | null> {
    try {
      const result = await query(`
        SELECT * FROM defi_statistics 
        WHERE id = 1
      `);
      
      return result.rows.length > 0 ? (result.rows[0] as DeFiStatistics) : null;
    } catch (error) {
      console.error('Get DeFi statistics error:', error);
      throw new Error('Failed to fetch DeFi statistics');
    }
  }
}

export default DeFiService;
