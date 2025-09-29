// Service de gestion des campagnes
import { apiClient } from '@/lib/api/api-client';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  target_amount: string;
  contribution_per_user: string;
  start_date: string;
  end_date: string;
  spins_per_amount: number;
  amount_per_spin: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator: {
    id: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    role: string;
    balance: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    last_login: string;
  };
}

export interface CampaignStats {
  campaign_id: string;
  total_participants: number;
  total_payments: number;
  total_amount_collected: string;
  total_spins_distributed: number;
  completion_percentage: number;
  average_payment: string;
  top_contributors: Array<{
    user_id: string;
    name: string;
    total_amount: string;
  }>;
}

export interface CreateCampaignRequest {
  name: string;
  description: string;
  contribution_per_user: number;
  start_date: string;
  end_date: string;
  spins_per_amount: number;
  amount_per_spin: number;
}

export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  contribution_per_user?: number;
  start_date?: string;
  end_date?: string;
  spins_per_amount?: number;
  amount_per_spin?: number;
  is_active?: boolean;
}

export interface CampaignsResponse {
  data: Campaign[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class CampaignService {
  // Récupérer toutes les campagnes avec pagination
  static async getCampaigns(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<CampaignsResponse> {
    try {
      return await apiClient.get('/campaigns', { params });
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      
      // Retourner une réponse par défaut en cas d'erreur
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1
        }
      };
    }
  }

  // Créer une nouvelle campagne
  static async createCampaign(campaignData: CreateCampaignRequest): Promise<Campaign> {
    return apiClient.post('/campaigns', campaignData);
  }

  // Récupérer les détails d'une campagne
  static async getCampaignById(id: string): Promise<Campaign> {
    return apiClient.get(`/campaigns/${id}`);
  }

  // Modifier une campagne
  static async updateCampaign(id: string, campaignData: UpdateCampaignRequest): Promise<Campaign> {
    return apiClient.patch(`/campaigns/${id}`, campaignData);
  }

  // Supprimer une campagne
  static async deleteCampaign(id: string): Promise<void> {
    return apiClient.delete(`/campaigns/${id}`);
  }

  // Récupérer les statistiques d'une campagne
  static async getCampaignStats(id: string): Promise<CampaignStats> {
    try {
      return await apiClient.get(`/campaigns/${id}/stats`);
    } catch (error: any) {
      console.error('Error fetching campaign stats:', error);
      
      // Retourner des statistiques par défaut en cas d'erreur
      return {
        campaign_id: id,
        total_participants: 0,
        total_payments: 0,
        total_amount_collected: '0',
        total_spins_distributed: 0,
        completion_percentage: 0,
        average_payment: '0',
        top_contributors: []
      };
    }
  }
}