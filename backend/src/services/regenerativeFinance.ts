import { query } from '../db';

export interface RegenerativeFinanceProduct {
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

export interface RegenerativeFinanceCaseStudy {
  id: number;
  name: string;
  description: string;
  outcome: string;
  investment: string;
  impact: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface RegenerativeFinanceTestimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  impact: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface FinancialReport {
  id: number;
  title: string;
  description: string;
  file_url: string;
  visibility: string;
  created_by: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

class RegenerativeFinanceService {
  static async getProducts(): Promise<RegenerativeFinanceProduct[]> {
    try {
      const result = await query(`
        SELECT 
          rfp.*,
          COALESCE(rfp.price_range, 'Outcome-dependent') as price_range,
          COALESCE(rfp.pricing_mechanism, 'Pay-for-success / results-based payments') as pricing_mechanism,
          COALESCE(rfp.value_justification, 'Capital only pays when reality improves') as value_justification
        FROM regenerative_finance_products rfp
        WHERE rfp.is_active = true
        ORDER BY rfp.display_order ASC
      `);
      return result.rows as RegenerativeFinanceProduct[];
    } catch (error) {
      console.error('Get regenerative finance products error:', error);
      throw new Error('Failed to fetch regenerative finance products');
    }
  }

  static async getProductById(id: number): Promise<RegenerativeFinanceProduct | null> {
    try {
      const result = await query(`
        SELECT 
          rfp.*,
          COALESCE(rfp.price_range, 'Outcome-dependent') as price_range,
          COALESCE(rfp.pricing_mechanism, 'Pay-for-success / results-based payments') as pricing_mechanism,
          COALESCE(rfp.value_justification, 'Capital only pays when reality improves') as value_justification
        FROM regenerative_finance_products rfp
        WHERE rfp.id = $1 AND rfp.is_active = true
      `, [id]);
      
      return result.rows.length > 0 ? (result.rows[0] as RegenerativeFinanceProduct) : null;
    } catch (error) {
      console.error('Get regenerative finance product error:', error);
      throw new Error('Failed to fetch regenerative finance product');
    }
  }

  static async getCaseStudies(): Promise<RegenerativeFinanceCaseStudy[]> {
    try {
      const result = await query(`
        SELECT * FROM regenerative_finance_case_studies 
        WHERE is_active = true 
        ORDER BY display_order ASC
      `);
      return result.rows as RegenerativeFinanceCaseStudy[];
    } catch (error) {
      console.error('Get regenerative finance case studies error:', error);
      throw new Error('Failed to fetch regenerative finance case studies');
    }
  }

  static async getTestimonials(): Promise<RegenerativeFinanceTestimonial[]> {
    try {
      const result = await query(`
        SELECT * FROM regenerative_finance_testimonials 
        WHERE is_active = true 
        ORDER BY display_order ASC
      `);
      return result.rows as RegenerativeFinanceTestimonial[];
    } catch (error) {
      console.error('Get regenerative finance testimonials error:', error);
      throw new Error('Failed to fetch regenerative finance testimonials');
    }
  }

  static async getFinancialReports(userId?: number): Promise<FinancialReport[]> {
    try {
      if (userId) {
        const result = await query(`
          SELECT * FROM financial_reports 
          WHERE is_active = true 
          AND (visibility = 'public' OR (visibility = 'private' AND created_by = $1))
          ORDER BY created_at DESC
        `, [userId]);
        return result.rows as FinancialReport[];
      } else {
        const result = await query(`
          SELECT * FROM financial_reports 
          WHERE is_active = true AND visibility = 'public'
          ORDER BY created_at DESC
        `);
        return result.rows as FinancialReport[];
      }
    } catch (error) {
      console.error('Get financial reports error:', error);
      throw new Error('Failed to fetch financial reports');
    }
  }
}

export default RegenerativeFinanceService;
