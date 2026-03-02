/**
 * Global Impact Economy API Connector
 * Connects the frontend to the backend API
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Types
export interface ImpactMetric {
  id: string;
  project_id: string;
  metric_type: string;
  value: number;
  unit: string;
  timestamp: string;
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
  creator_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ImpactBond {
  id: string;
  name: string;
  issuer: string;
  face_value: number;
  current_price: number;
  impact_targets: string[];
  return_rate: number;
  maturity_date: string;
  status: string;
  created_at: string;
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
  created_at: string;
}

export interface DashboardData {
  metrics: {
    total_projects: number;
    total_impact_score: number;
    total_carbon_credits: number;
    total_value_generated: number;
    total_beneficiaries: number;
    total_contributors?: number;
  };
  projects: Project[];
  community: {
    total_contributors: number;
    total_contributions: number;
    avg_impact_score: number;
  };
  timestamp: string;
}

export interface AnalyticsData {
  timeSeries: Array<{
    date: string;
    project_count: number;
    total_impact: number;
    total_carbon: number;
    total_value: number;
  }>;
  categories: Array<{
    category: string;
    project_count: number;
    avg_impact_score: number;
    total_value: number;
    total_carbon: number;
  }>;
  period: string;
}

export interface UserImpactData {
  summary: {
    total_impact_score: number;
    total_contributions: number;
    projects_supported: number;
    carbon_credits_impact: number;
  };
  projects: Project[];
}

export interface PaginatedProjects {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// HTTP Methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

class GlobalImpactEconomyConnector {
  private baseUrl: string;
  private supabase: SupabaseClient | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Initialize Supabase client
   */
  initializeSupabase(supabaseUrl: string, supabaseKey: string): void {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Get authentication headers
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.supabase) {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    }

    return headers;
  }

  /**
   * Make API request
   */
  private async makeRequest<T>(
    endpoint: string,
    method: HttpMethod = 'GET',
    body?: object
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}/global-impact-economy${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        ...(await this.getAuthHeaders()),
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // ============================================
  // Dashboard endpoints
  // ============================================

  /**
   * Get dashboard data
   */
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return this.makeRequest<DashboardData>('/dashboard');
  }

  // ============================================
  // Projects endpoints
  // ============================================

  /**
   * Get all projects with pagination
   */
  async getProjects(options?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<ApiResponse<PaginatedProjects>> {
    const params = new URLSearchParams();
    
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.category) params.append('category', options.category);
    if (options?.status) params.append('status', options.status);
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.sortOrder) params.append('sortOrder', options.sortOrder);

    const queryString = params.toString();
    return this.makeRequest<PaginatedProjects>(`/projects${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Get single project by ID
   */
  async getProject(id: string): Promise<ApiResponse<Project>> {
    return this.makeRequest<Project>(`/projects/${id}`);
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
  }): Promise<ApiResponse<Project>> {
    return this.makeRequest<Project>('/projects', 'POST', data);
  }

  /**
   * Update project
   */
  async updateProject(id: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.makeRequest<Project>(`/projects/${id}`, 'PATCH', data);
  }

  // ============================================
  // Impact Bonds endpoints
  // ============================================

  /**
   * Get impact bonds
   */
  async getImpactBonds(options?: { page?: number; limit?: number }): Promise<ApiResponse<ImpactBond[]>> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    
    return this.makeRequest<ImpactBond[]>(`/impact-bonds${params.toString() ? `?${params.toString()}` : ''}`);
  }

  /**
   * Create impact bond
   */
  async createImpactBond(data: Omit<ImpactBond, 'id' | 'created_at'>): Promise<ApiResponse<ImpactBond>> {
    return this.makeRequest<ImpactBond>('/impact-bonds', 'POST', data);
  }

  // ============================================
  // Microfinance endpoints
  // ============================================

  /**
   * Get microfinance opportunities
   */
  async getMicrofinanceOpportunities(options?: {
    page?: number;
    limit?: number;
    sector?: string;
  }): Promise<ApiResponse<MicrofinanceOpportunity[]>> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.sector) params.append('sector', options.sector);

    return this.makeRequest<MicrofinanceOpportunity[]>(
      `/microfinance${params.toString() ? `?${params.toString()}` : ''}`
    );
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
  }): Promise<ApiResponse<MicrofinanceOpportunity>> {
    return this.makeRequest<MicrofinanceOpportunity>('/microfinance', 'POST', data);
  }

  // ============================================
  // Analytics endpoints
  // ============================================

  /**
   * Get analytics data
   */
  async getAnalytics(period: string = '30d'): Promise<ApiResponse<AnalyticsData>> {
    return this.makeRequest<AnalyticsData>(`/analytics?period=${period}`);
  }

  // ============================================
  // User Impact endpoints
  // ============================================

  /**
   * Get user's impact summary
   */
  async getMyImpact(): Promise<ApiResponse<UserImpactData>> {
    return this.makeRequest<UserImpactData>('/my-impact');
  }

  /**
   * Support a project
   */
  async supportProject(projectId: string, data: {
    support_type: string;
    amount: number;
  }): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.makeRequest<{ success: boolean; message: string }>(
      `/support/${projectId}`,
      'POST',
      data
    );
  }

  // ============================================
  // Utility methods
  // ============================================

  /**
   * Get impact categories
   */
  async getCategories(): Promise<ApiResponse<{ category: string; count: number }[]>> {
    return this.makeRequest<{ category: string; count: number }[]>('/categories');
  }
}

// Export singleton instance
export const globalImpactEconomyConnector = new GlobalImpactEconomyConnector();

// Export class for custom instances
export { GlobalImpactEconomyConnector };

// Export types
export type {
  ApiResponse,
  ImpactMetric,
  Project,
  ImpactBond,
  MicrofinanceOpportunity,
  DashboardData,
  AnalyticsData,
  UserImpactData,
  PaginatedProjects,
};
