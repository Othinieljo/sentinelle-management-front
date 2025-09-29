// API Configuration - SENTINELLE
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Types pour l'API CommuWheel
export interface User {
  id: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'member';
  balance: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Prize {
  id: string;
  name: string;
  description: string;
  value: number;
  weight: number;
  stock: number;
  is_active: boolean;
  campaign_id: string;
  created_at: string;
}

export interface SpinResult {
  id: string;
  user_id: string;
  campaign_id: string;
  prize_id: string | null;
  prize_name: string | null;
  prize_value: number | null;
  is_winner: boolean;
  spin_date: string;
}

export interface SpinBalance {
  balance: number;
  user_id: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: string;
  payment_method: 'card' | 'bank_transfer' | 'mobile_money';
  phone_number: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  total_users: number;
  active_campaigns: number;
  total_spins: number;
  total_prizes_won: number;
  revenue: number;
  recent_activity: Array<{
    type: string;
    user_name: string;
    prize_name?: string;
    timestamp: string;
  }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          this.clearTokens();
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sentinelle_token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sentinelle_token', token);
    }
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sentinelle_token');
    }
  }

  // Auth methods
  async login(phoneNumber: string, password: string): Promise<LoginResponse> {
    const response = await this.client.post('/auth/login', {
      phone_number: phoneNumber,
      password: password,
    });
    
    const { access_token, user } = response.data;
    this.setToken(access_token);
    
    return { access_token, user };
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get('/users/profile');
    return response.data;
  }

  // User methods
  async getUsers(): Promise<User[]> {
    const response = await this.client.get('/users');
    return response.data;
  }

  async createUser(userData: {
    phone_number: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'member';
  }): Promise<User> {
    const response = await this.client.post('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await this.client.patch(`/users/${id}`, userData);
    return response.data;
  }

  // Campaign methods
  async getCampaigns(params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'inactive' | 'completed';
  }): Promise<PaginatedResponse<Campaign>> {
    const response = await this.client.get('/campaigns', { params });
    return response.data;
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    const response = await this.client.get('/campaigns/active');
    return response.data;
  }

  async getCampaign(id: string): Promise<Campaign> {
    const response = await this.client.get(`/campaigns/${id}`);
    return response.data;
  }

  async createCampaign(campaignData: {
    name: string;
    description: string;
    start_date: string;
    end_date: string;
  }): Promise<Campaign> {
    const response = await this.client.post('/campaigns', campaignData);
    return response.data;
  }

  // Prize methods
  async getPrizes(params?: {
    page?: number;
    limit?: number;
    campaign_id?: string;
    is_active?: boolean;
  }): Promise<PaginatedResponse<Prize>> {
    const response = await this.client.get('/prizes', { params });
    return response.data;
  }

  async createPrize(prizeData: {
    name: string;
    description: string;
    value: number;
    weight: number;
    stock: number;
    campaign_id: string;
  }): Promise<Prize> {
    const response = await this.client.post('/prizes', prizeData);
    return response.data;
  }

  // Spin methods
  async getSpinBalance(): Promise<SpinBalance> {
    const response = await this.client.get('/spins/balance');
    return response.data;
  }

  async spin(campaignId: string): Promise<SpinResult> {
    const response = await this.client.post('/spins', {
      campaign_id: campaignId,
    });
    return response.data;
  }

  async getSpins(params?: {
    page?: number;
    limit?: number;
    user_id?: string;
    campaign_id?: string;
  }): Promise<PaginatedResponse<SpinResult>> {
    const response = await this.client.get('/spins', { params });
    return response.data;
  }

  // Payment methods
  async createPayment(paymentData: {
    amount: number;
    payment_method: 'card' | 'bank_transfer' | 'mobile_money';
    phone_number: string;
    description: string;
  }): Promise<Payment> {
    const response = await this.client.post('/payments', paymentData);
    return response.data;
  }

  async getPayments(params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'completed' | 'failed';
    user_id?: string;
  }): Promise<PaginatedResponse<Payment>> {
    const response = await this.client.get('/payments', { params });
    return response.data;
  }

  // Reports methods (Admin only)
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get('/reports/dashboard');
    return response.data;
  }

  async getSpinsReport(params?: {
    start_date?: string;
    end_date?: string;
    campaign_id?: string;
  }): Promise<Record<string, unknown>> {
    const response = await this.client.get('/reports/spins', { params });
    return response.data;
  }

  async getPaymentsReport(params?: {
    start_date?: string;
    end_date?: string;
    status?: string;
  }): Promise<Record<string, unknown>> {
    const response = await this.client.get('/reports/payments', { params });
    return response.data;
  }

  // Generic HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;