// Client API moderne avec gestion d'erreurs avancée
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { LoginRequest, LoginResponse, Campaign, Prize, Spin, Payment, DashboardStats } from '@/types/api';
import { User } from '@/types/auth';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private token: string | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://religious-bobbe-jsoma-2beb0e57.koyeb.app/api';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Intercepteur de requête
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Gestion des erreurs 401 (non autorisé)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Essayer de rafraîchir le token
            const newToken = await this.refreshToken();
            if (newToken) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Si le refresh échoue, rediriger vers login
            this.clearToken();
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
        }

        // Gestion des autres erreurs
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: AxiosError) {
    const message = this.getErrorMessage(error);
    
    // Ne pas afficher de toast pour les erreurs de redirection
    if (error.response?.status === 401 && typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
      return;
    }

    console.error('API Error:', message);
  }

  private getErrorMessage(error: AxiosError): string {
    if (error.response?.data) {
      const data = error.response.data as any;
      
      // Gestion spécifique des erreurs GraphQL
      if (data.errors && Array.isArray(data.errors)) {
        const graphqlError = data.errors[0];
        if (graphqlError.message) {
          return `Erreur API: ${graphqlError.message}`;
        }
      }
      
      // Gestion des erreurs REST standard
      return data.message || data.error || 'Une erreur est survenue';
    }
    
    if (error.request) {
      return 'Impossible de joindre le serveur';
    }
    
    return error.message || 'Une erreur inattendue est survenue';
  }

  // Gestion des tokens
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sentinelle_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sentinelle_token');
      localStorage.removeItem('sentinelle_refresh_token');
    }
  }

  private async refreshToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('sentinelle_refresh_token') 
      : null;

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token: newRefreshToken } = response.data;
      
      this.setToken(access_token);
      if (newRefreshToken && typeof window !== 'undefined') {
        localStorage.setItem('sentinelle_refresh_token', newRefreshToken);
      }

      return access_token;
    } catch (error) {
      this.clearToken();
      throw error;
    }
  }

  // Méthodes d'authentification
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  // Méthodes utilisateurs
  async getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<User[]> {
    const response = await this.client.get<User[]>('/users', { params });
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await this.client.get<User>(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const response = await this.client.post<User>('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await this.client.put<User>(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.client.delete(`/users/${id}`);
  }

  // Méthodes campagnes
  async getCampaigns(params?: { page?: number; limit?: number; active?: boolean }): Promise<Campaign[]> {
    const response = await this.client.get<Campaign[]>('/campaigns', { params });
    return response.data;
  }

  async getCampaign(id: string): Promise<Campaign> {
    const response = await this.client.get<Campaign>(`/campaigns/${id}`);
    return response.data;
  }

  async createCampaign(campaignData: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>): Promise<Campaign> {
    const response = await this.client.post<Campaign>('/campaigns', campaignData);
    return response.data;
  }

  async updateCampaign(id: string, campaignData: Partial<Campaign>): Promise<Campaign> {
    const response = await this.client.put<Campaign>(`/campaigns/${id}`, campaignData);
    return response.data;
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.client.delete(`/campaigns/${id}`);
  }

  // Méthodes prix
  async getPrizes(): Promise<Prize[]> {
    const response = await this.client.get<Prize[]>('/prizes');
    return response.data;
  }

  async createPrize(prizeData: Omit<Prize, 'id' | 'created_at' | 'updated_at'>): Promise<Prize> {
    const response = await this.client.post<Prize>('/prizes', prizeData);
    return response.data;
  }

  async updatePrize(id: string, prizeData: Partial<Prize>): Promise<Prize> {
    const response = await this.client.put<Prize>(`/prizes/${id}`, prizeData);
    return response.data;
  }

  async deletePrize(id: string): Promise<void> {
    await this.client.delete(`/prizes/${id}`);
  }

  // Méthodes spins
  async spinWheel(): Promise<{ spin: Spin; prize: Prize; is_winner: boolean }> {
    const response = await this.client.post<{ spin: Spin; prize: Prize; is_winner: boolean }>('/spins');
    return response.data;
  }

  async getSpins(params?: { page?: number; limit?: number; user_id?: string }): Promise<Spin[]> {
    const response = await this.client.get<Spin[]>('/spins', { params });
    return response.data;
  }

  // Méthodes paiements
  async getPayments(params?: { page?: number; limit?: number; user_id?: string }): Promise<Payment[]> {
    const response = await this.client.get<Payment[]>('/payments', { params });
    return response.data;
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
    const response = await this.client.post<Payment>('/payments', paymentData);
    return response.data;
  }

  // Méthodes dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get<DashboardStats>('/dashboard/stats');
    return response.data;
  }

  // Méthodes utilitaires
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get<{ status: string; timestamp: string }>('/health');
    return response.data;
  }

  // Méthodes génériques pour les services
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();