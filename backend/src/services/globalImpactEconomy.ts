import { query } from '../db';
import { cacheWithRedis, invalidateCache } from '../redisClient';
import { logger } from '../utils/logger';

export interface ImpactMetric {
  id: string;
  project_id: string;
  metric_type: string;
  value: number;
  unit: string;
  timestamp: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  impact_category: string;
  impact_score: number;
  carbon_credits: number;
  value_generated: number;
  status: string;
  location?: string;
  beneficiaries_count?: number;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ImpactBond {
  id: string;
  name: string;
  issuer: string;
  face_value: number;
  current_price: number;
  impact_targets: string[];
  return_rate: number;
  maturity_date: Date;
  status: string;
  created_at: Date;
}

export interface MicrofinanceOpportunity {
  id: string;
  borrower_name: string;
  sector: string;
  loan_amount: number;
  repayment_term: number;
  interest_rate: number;
  impact_score: number;
  description?: string;
  status: string;
  created_by?: string;
  created_at: Date;
}

export interface UserImpact {
  user_id: string;
  project_id: string;
  support_type: string;
  amount: number;
  impact_score: number;
  created_at: Date;
}

class GlobalImpactEconomyService {
  /**
   * Get dashboard metrics with caching
   */
  async getDashboardMetrics(userId?: string): Promise<any> {
    const cacheKey = `gie:dashboard:${userId || 'public'}`;
    
    return cacheWithRedis(cacheKey, 300, async () => {
      const result = await query(`
        SELECT 
          COUNT(DISTINCT p.id) as total_projects,
          COALESCE(SUM(p.impact_score), 0) as total_impact_score,
          COALESCE(SUM(p.carbon_credits), 0) as total_carbon_credits,
          COALESCE(SUM(p.value_generated), 0) as total_value_generated,
          COALESCE(SUM(p.beneficiaries_count), 0) as total_beneficiaries,
          COUNT(DISTINCT cc.id) as total_contributors
        FROM projects p
        LEFT JOIN community_contributions cc ON cc.project_id = p.id AND cc.verified = true
        WHERE p.status = 'active'
      `);

      return result.rows[0];
    });
  }

  /**
   * Get projects with filtering and pagination
   */
  async getProjects(options: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ projects: Project[]; total: number }> {
    const { page = 1, limit = 20, category, status, sortBy = 'created_at', sortOrder = 'DESC' } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = ["p.status = 'active'"];
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`p.impact_category = $${paramIndex++}`);
      params.push(category);
    }

    if (status) {
      conditions.push(`p.status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const validSortColumns = ['name', 'impact_score', 'created_at', 'value_generated'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';

    const [countResult, projectsResult] = await Promise.all([
      query(`SELECT COUNT(*) FROM projects p ${whereClause}`, params),
      query(`
        SELECT p.*, u.name as creator_name
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        ${whereClause}
        ORDER BY p.${sortColumn} ${sortOrder}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, [...params, limit, offset])
    ]);

    return {
      projects: projectsResult.rows,
      total: parseInt(countResult.rows[0]?.count || '0')
    };
  }

  /**
   * Get single project by ID
   */
  async getProjectById(id: string): Promise<Project | null> {
    const cacheKey = `gie:project:${id}`;
    
    return cacheWithRedis(cacheKey, 600, async () => {
      const result = await query(`
        SELECT p.*, u.name as creator_name
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        WHERE p.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      // Get impact metrics for the project
      const metricsResult = await query(`
        SELECT * FROM impact_metrics
        WHERE project_id = $1
        ORDER BY timestamp DESC
      `, [id]);

      return {
        ...result.rows[0],
        impact_metrics: metricsResult.rows
      };
    });
  }

  /**
   * Create new project
   */
  async createProject(data: {
    name: string;
    description: string;
    impact_category: string;
    location?: string;
    beneficiaries_count?: number;
    created_by: string;
  }): Promise<Project> {
    const result = await query(`
      INSERT INTO projects (
        name, description, impact_category, location, beneficiaries_count,
        created_by, status, impact_score, carbon_credits, value_generated
      ) VALUES ($1, $2, $3, $4, $5, $6, 'active', 0, 0, 0)
      RETURNING *
    `, [data.name, data.description, data.impact_category, data.location, data.beneficiaries_count, data.created_by]);

    // Invalidate dashboard cache
    await invalidateCache('gie:dashboard:*');

    return result.rows[0];
  }

  /**
   * Update project
   */
  async updateProject(id: string, data: Partial<Project>, userId: string): Promise<Project | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (['name', 'description', 'impact_category', 'location', 'beneficiaries_count', 'status'].includes(key)) {
        updates.push(`${key} = $${paramIndex++}`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      return this.getProjectById(id);
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const result = await query(`
      UPDATE projects
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, params);

    await invalidateCache(`gie:project:${id}`);
    await invalidateCache('gie:dashboard:*');

    return result.rows[0] || null;
  }

  /**
   * Get impact bonds
   */
  async getImpactBonds(options: { page?: number; limit?: number } = {}): Promise<ImpactBond[]> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const result = await query(`
      SELECT * FROM impact_bonds
      WHERE status = 'active'
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    return result.rows;
  }

  /**
   * Create impact bond
   */
  async createImpactBond(data: Omit<ImpactBond, 'id' | 'created_at'>): Promise<ImpactBond> {
    const result = await query(`
      INSERT INTO impact_bonds (
        name, issuer, face_value, current_price, impact_targets,
        return_rate, maturity_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [data.name, data.issuer, data.face_value, data.current_price, 
        JSON.stringify(data.impact_targets), data.return_rate, data.maturity_date, data.status]);

    return result.rows[0];
  }

  /**
   * Get microfinance opportunities
   */
  async getMicrofinanceOpportunities(options: {
    page?: number;
    limit?: number;
    sector?: string;
  } = {}): Promise<MicrofinanceOpportunity[]> {
    const { page = 1, limit = 20, sector } = options;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT * FROM microfinance_opportunities
      WHERE status = 'active'
    `;
    const params: any[] = [];

    if (sector) {
      queryText += ` AND sector = $1`;
      params.push(sector);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Create microfinance opportunity
   */
  async createMicrofinanceOpportunity(data: {
    borrower_name: string;
    sector: string;
    loan_amount: number;
    repayment_term?: number;
    interest_rate?: number;
    description?: string;
    created_by: string;
  }): Promise<MicrofinanceOpportunity> {
    const result = await query(`
      INSERT INTO microfinance_opportunities (
        borrower_name, sector, loan_amount, repayment_term,
        interest_rate, description, created_by, status, impact_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', 0)
      RETURNING *
    `, [data.borrower_name, data.sector, data.loan_amount, 
        data.repayment_term, data.interest_rate, data.description, data.created_by]);

    return result.rows[0];
  }

  /**
   * Get analytics data
   */
  async getAnalytics(period: string = '30d'): Promise<{
    timeSeries: any[];
    categories: any[];
  }> {
    let interval: string;
    switch (period) {
      case '7d': interval = '7 days'; break;
      case '30d': interval = '30 days'; break;
      case '90d': interval = '90 days'; break;
      case '1y': interval = '1 year'; break;
      default: interval = '30 days';
    }

    const cacheKey = `gie:analytics:${period}`;

    return cacheWithRedis(cacheKey, 900, async () => {
      const [timeSeriesResult, categoryResult] = await Promise.all([
        query(`
          SELECT 
            DATE_TRUNC('day', created_at) as date,
            COUNT(*) as project_count,
            COALESCE(SUM(impact_score), 0) as total_impact,
            COALESCE(SUM(carbon_credits), 0) as total_carbon,
            COALESCE(SUM(value_generated), 0) as total_value
          FROM projects
          WHERE created_at >= NOW() - INTERVAL '${interval}'
          GROUP BY DATE_TRUNC('day', created_at)
          ORDER BY date
        `),
        query(`
          SELECT 
            COALESCE(impact_category, 'Uncategorized') as category,
            COUNT(*) as project_count,
            AVG(impact_score) as avg_impact_score,
            COALESCE(SUM(value_generated), 0) as total_value,
            COALESCE(SUM(carbon_credits), 0) as total_carbon
          FROM projects
          WHERE status = 'active'
          GROUP BY impact_category
          ORDER BY total_value DESC
        `)
      ]);

      return {
        timeSeries: timeSeriesResult.rows,
        categories: categoryResult.rows
      };
    });
  }

  /**
   * Get user impact summary
   */
  async getUserImpact(userId: string): Promise<{
    summary: any;
    projects: Project[];
  }> {
    const [summaryResult, projectsResult] = await Promise.all([
      query(`
        SELECT 
          COALESCE(SUM(ui.impact_score), 0) as total_impact_score,
          COALESCE(SUM(ui.amount), 0) as total_contributions,
          COUNT(DISTINCT ui.project_id) as projects_supported,
          COALESCE(SUM(p.carbon_credits), 0) as carbon_credits_impact
        FROM user_impact ui
        LEFT JOIN projects p ON ui.project_id = p.id
        WHERE ui.user_id = $1
      `, [userId]),
      query(`
        SELECT DISTINCT p.*
        FROM projects p
        INNER JOIN user_impact ui ON p.id = ui.project_id
        WHERE ui.user_id = $1
        ORDER BY ui.created_at DESC
        LIMIT 10
      `, [userId])
    ]);

    return {
      summary: summaryResult.rows[0] || {},
      projects: projectsResult.rows
    };
  }

  /**
   * Support a project
   */
  async supportProject(userId: string, projectId: string, supportType: string, amount: number): Promise<UserImpact> {
    const impactScore = amount * 0.1; // 10% of amount as impact score

    const result = await query(`
      INSERT INTO user_impact (
        user_id, project_id, support_type, amount, impact_score
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userId, projectId, supportType, amount, impactScore]);

    // Update project metrics
    await query(`
      UPDATE projects
      SET 
        impact_score = impact_score + $1,
        value_generated = value_generated + $2
      WHERE id = $3
    `, [impactScore, amount, projectId]);

    await invalidateCache(`gie:project:${projectId}`);
    await invalidateCache('gie:dashboard:*');

    logger.info('Project support recorded', { userId, projectId, supportType, amount });

    return result.rows[0];
  }

  /**
   * Get impact categories
   */
  async getImpactCategories(): Promise<{ category: string; count: number }[]> {
    const result = await query(`
      SELECT 
        COALESCE(impact_category, 'Uncategorized') as category,
        COUNT(*) as count
      FROM projects
      WHERE status = 'active'
      GROUP BY impact_category
      ORDER BY count DESC
    `);

    return result.rows;
  }

  /**
   * Search projects
   */
  async searchProjects(queryText: string, options: { limit?: number } = {}): Promise<Project[]> {
    const { limit = 20 } = options;

    const result = await query(`
      SELECT * FROM projects
      WHERE status = 'active'
        AND (
          name ILIKE $1 OR
          description ILIKE $1 OR
          impact_category ILIKE $1 OR
          location ILIKE $1
        )
      ORDER BY impact_score DESC
      LIMIT $2
    `, [`%${queryText}%`, limit]);

    return result.rows;
  }
}

export const globalImpactEconomyService = new GlobalImpactEconomyService();
