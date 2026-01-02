// Frontend API Service Layer
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_V2_BASE_URL = `${API_BASE_URL}/v2`;

interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages?: number;
  };
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Auth API
  auth = {
    signup: (email: string, password: string, displayName?: string) =>
      this.request<APIResponse<{ user: any; token: string }>>(
        `${API_V2_BASE_URL}/auth/signup`,
        {
          method: 'POST',
          body: JSON.stringify({ email, password, displayName }),
        }
      ),

    login: (email: string, password: string) =>
      this.request<APIResponse<{ user: any; token: string }>>(
        `${API_V2_BASE_URL}/auth/login`,
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      ),

    getCurrentUser: () =>
      this.request<any>(`${API_V2_BASE_URL}/auth/me`),

    updateProfile: (userId: string, updates: any) =>
      this.request<any>(
        `${API_V2_BASE_URL}/auth/profile`,
        {
          method: 'PUT',
          body: JSON.stringify({ userId, ...updates }),
        }
      ),
  };

  // Marketplace API
  marketplace = {
    getRIUMarket: () =>
      this.request<any>(`${API_V2_BASE_URL}/marketplace/riums/market`),

    getRIUListings: (page?: number, size?: number, sortBy?: string) =>
      this.request<PaginatedResponse<any>>(
        `${API_V2_BASE_URL}/marketplace/riums/listings?page=${page || 1}&size=${size || 20}&sortBy=${sortBy || 'price'}`
      ),

    createRIUListing: (data: any) =>
      this.request<any>(
        `${API_V2_BASE_URL}/marketplace/riums`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),

    purchaseRIUs: (riuId: string, buyerId: string, quantity: number) =>
      this.request<any>(
        `${API_V2_BASE_URL}/marketplace/riums/${riuId}/purchase`,
        {
          method: 'POST',
          body: JSON.stringify({ buyerId, quantity }),
        }
      ),

    getBonds: () =>
      this.request<any>(`${API_V2_BASE_URL}/marketplace/bonds`),

    purchaseBond: (bondId: string, buyerId: string, amount: number) =>
      this.request<any>(
        `${API_V2_BASE_URL}/marketplace/bonds/${bondId}/purchase`,
        {
          method: 'POST',
          body: JSON.stringify({ buyerId, amount }),
        }
      ),

    getTradingVolume: () =>
      this.request<any>(`${API_V2_BASE_URL}/marketplace/trading-volume`),

    getTransactionHistory: (userId?: string, page?: number) =>
      this.request<PaginatedResponse<any>>(
        `${API_V2_BASE_URL}/marketplace/transactions?userId=${userId || ''}&page=${page || 1}`
      ),
  };

  // Projects API
  projects = {
    getProjects: (page?: number, size?: number, status?: string) =>
      this.request<PaginatedResponse<any>>(
        `${API_V2_BASE_URL}/projects?page=${page || 1}&size=${size || 20}${status ? `&status=${status}` : ''}`
      ),

    getProjectById: (id: string) =>
      this.request<any>(`${API_V2_BASE_URL}/projects/${id}`),

    createProject: (data: any) =>
      this.request<any>(
        `${API_V2_BASE_URL}/projects`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),

    updateProject: (id: string, data: any) =>
      this.request<any>(
        `${API_V2_BASE_URL}/projects/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      ),

    getProjectStats: (id: string) =>
      this.request<any>(`${API_V2_BASE_URL}/projects/${id}/stats`),

    approveProject: (id: string, notes?: string) =>
      this.request<any>(
        `${API_V2_BASE_URL}/projects/${id}/approve`,
        {
          method: 'POST',
          body: JSON.stringify({ approverNotes: notes }),
        }
      ),

    rejectProject: (id: string, reason: string) =>
      this.request<any>(
        `${API_V2_BASE_URL}/projects/${id}/reject`,
        {
          method: 'POST',
          body: JSON.stringify({ rejectionReason: reason }),
        }
      ),
  };

  // Measurements API
  measurements = {
    getProjectMeasurements: (projectId: string, page?: number) =>
      this.request<PaginatedResponse<any>>(
        `${API_V2_BASE_URL}/measurements/project/${projectId}?page=${page || 1}`
      ),

    recordMeasurement: (data: any) =>
      this.request<any>(
        `${API_V2_BASE_URL}/measurements`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),

    getMeasurement: (id: string) =>
      this.request<any>(`${API_V2_BASE_URL}/measurements/${id}`),

    getAnomalies: (projectId?: string, page?: number) =>
      this.request<PaginatedResponse<any>>(
        `${API_V2_BASE_URL}/measurements/anomalies?projectId=${projectId || ''}&page=${page || 1}`
      ),

    getTrends: (projectId: string, days?: number) =>
      this.request<any>(
        `${API_V2_BASE_URL}/measurements/${projectId}/trends?days=${days || 365}`
      ),

    getBioregionMeasurements: (bioregionId: string) =>
      this.request<any>(
        `${API_V2_BASE_URL}/measurements/bioregion/${bioregionId}`
      ),
  };
}

export const apiService = new ApiService();
