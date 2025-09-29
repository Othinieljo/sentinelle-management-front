// Service de gestion des spins
import { apiClient } from '@/lib/api/api-client';

export interface SpinBalance {
  id: string;
  user_id: string;
  available_spins: number;
  total_spins_earned: number;
  total_spins_used: number;
  created_at: string;
  updated_at: string;
}

export interface SpinRequest {
  campaign_id?: string;
}

export interface SpinResult {
  success: boolean;
  message: string;
  spin: {
    id: string;
    user_id: string;
    campaign_id: string | null;
    is_winning: boolean;
    spin_date: string;
    ip_address: string | null;
    user_agent: string | null;
  };
  prize?: {
    id: string;
    name: string;
    description: string;
    image_url: string | null;
    value: number | null;
    category: string | null;
  };
  user_prize?: {
    id: string;
    status: 'pending' | 'claimed' | 'delivered';
    won_at: string;
  };
  balance: SpinBalance;
}

export interface SpinHistoryItem {
  id: string;
  user_id: string;
  campaign_id: string | null;
  is_winning: boolean;
  spin_date: string;
  campaign?: {
    id: string;
    name: string;
  };
  prize?: {
    id: string;
    name: string;
    image_url: string | null;
  };
  user_prize?: {
    id: string;
    status: 'pending' | 'claimed' | 'delivered';
    prize: {
      id: string;
      name: string;
      image_url: string | null;
    };
  };
}

export interface UserPrize {
  id: string;
  user_id: string;
  prize_id: string;
  spin_id: string;
  status: 'pending' | 'claimed' | 'delivered';
  won_at: string;
  claimed_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  user: {
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
  prize: {
    id: string;
    name: string;
    description: string;
    image_url: string | null;
    probability_weight: number;
    stock_total: number;
    stock_remaining: number;
    value: number | null;
    is_active: boolean;
    category: string | null;
    created_at: string;
    updated_at: string;
  };
  spin: {
    id: string;
    user_id: string;
    campaign_id: string | null;
    prize_id: string;
    spin_result: string;
    is_winning: boolean;
    spin_date: string;
    ip_address: string | null;
    user_agent: string | null;
  };
}

export interface ClaimResponse {
  success: boolean;
  message: string;
  user_prize: UserPrize;
}

export interface DeliverRequest {
  delivery_notes?: string;
}

export interface DeliverResponse {
  success: boolean;
  message: string;
  user_prize: UserPrize;
}

export interface UserPrizesResponse {
  data: UserPrize[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class SpinService {
  // Récupérer le solde de spins de l'utilisateur
  static async getSpinBalance(): Promise<SpinBalance> {
    try {
      return await apiClient.get('/spins/balance');
    } catch (error: any) {
      console.error('Error fetching spin balance:', error);
      throw error;
    }
  }

  // Lancer la roue de la fortune
  static async spinWheel(campaignId?: string): Promise<SpinResult> {
    try {
      const body: SpinRequest = {};
      if (campaignId) {
        body.campaign_id = campaignId;
      }
      return await apiClient.post('/spins/spin', body);
    } catch (error: any) {
      console.error('Error spinning wheel:', error);
      throw error;
    }
  }

  // Récupérer l'historique des spins
  static async getSpinHistory(limit: number = 20): Promise<SpinHistoryItem[]> {
    try {
      const response = await apiClient.get('/spins/history', { 
        params: { limit } 
      });
      
      // Si la réponse est paginée, retourner les données
      if (response && typeof response === 'object' && 'data' in response) {
        const data = (response as any).data;
        return Array.isArray(data) ? data : [];
      }
      
      // Sinon, retourner directement la réponse (tableau)
      return Array.isArray(response) ? response : [];
    } catch (error: any) {
      console.error('Error fetching spin history:', error);
      throw error;
    }
  }

  // Récupérer les prix gagnés par l'utilisateur
  static async getMyPrizes(): Promise<UserPrize[]> {
    try {
      return await apiClient.get('/spins/prizes/my');
    } catch (error: any) {
      console.error('Error fetching user prizes:', error);
      throw error;
    }
  }

  // Récupérer tous les prix gagnés (Admin)
  static async getAllPrizes(params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'claimed' | 'delivered';
  }): Promise<UserPrizesResponse> {
    try {
      const queryParams: any = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.limit) queryParams.limit = params.limit;
      if (params?.status) queryParams.status = params.status;
      
      return await apiClient.get('/spins/prizes/all', { params: queryParams });
    } catch (error: any) {
      console.error('Error fetching all prizes:', error);
      throw error;
    }
  }

  // Réclamer un prix
  static async claimPrize(userPrizeId: string): Promise<ClaimResponse> {
    try {
      return await apiClient.post(`/spins/prizes/${userPrizeId}/claim`);
    } catch (error: any) {
      console.error('Error claiming prize:', error);
      throw error;
    }
  }

  // Livrer un prix (Admin uniquement)
  static async deliverPrize(userPrizeId: string, notes?: string): Promise<DeliverResponse> {
    try {
      const body: DeliverRequest = {};
      if (notes) {
        body.delivery_notes = notes;
      }
      return await apiClient.post(`/spins/prizes/${userPrizeId}/deliver`, body);
    } catch (error: any) {
      console.error('Error delivering prize:', error);
      throw error;
    }
  }
}