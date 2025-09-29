// Service pour l'espace membre - Campagne active et statistiques
import { apiClient } from '@/lib/api/api-client';

export interface ActiveCampaign {
  id: string;
  name: string;
  description: string;
  amount_per_spin: number;
  spins_per_amount: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

export interface UserCampaignStats {
  campaign: ActiveCampaign;
  user_stats: {
    total_contributed: number;
    total_spins_earned: number;
    available_spins: number;
    spins_used: number;
    contribution_count: number;
    min_contribution_needed: number;
    next_spin_at: number;
  };
  recent_payments: Array<{
    id: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    spins_earned: number;
    created_at: string;
  }>;
}

export interface CreatePaymentRequest {
  campaign_id: string;
  amount: number;
  payment_method: 'wave';
  notes?: string;
}

export interface CreatePaymentResponse {
  id: string;
  amount: number;
  spins_earned: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  payment_url: string;
  created_at: string;
}

export interface UserPayment {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  spins_earned: number;
  reference: string;
  created_at: string;
  campaign: {
    id: string;
    name: string;
  };
}

export interface UserPrize {
  id: string;
  prize: {
    id: string;
    name: string;
    description: string;
    value: number;
    category: string;
  };
  status: 'pending' | 'claimed' | 'delivered';
  spin_date: string;
  campaign: {
    id: string;
    name: string;
  };
}

export interface SpinBalance {
  user_id: string;
  available_spins: number;
  total_spins_earned: number;
  total_spins_used: number;
  last_updated: string;
}

export interface SpinRequest {
  campaign_id: string;
  user_agent?: string;
}

export interface SpinResult {
  spin_id: string;
  prize_won: {
    id: string;
    name: string;
    description: string;
    value: number;
    category: string;
  } | null;
  spins_used: number;
  remaining_spins: number;
  spin_date: string;
}

export class MemberService {
  // Récupérer la campagne active
  static async getActiveCampaign(): Promise<ActiveCampaign> {
    try {
      return await apiClient.get('/campaigns/active');
    } catch (error: any) {
      console.error('Error fetching active campaign:', error);
      throw error;
    }
  }

  // Récupérer les statistiques utilisateur pour la campagne active
  static async getUserCampaignStats(campaignId: string): Promise<UserCampaignStats> {
    try {
      return await apiClient.get(`/payments/my/campaign/${campaignId}/stats`);
    } catch (error: any) {
      console.error('Error fetching user campaign stats:', error);
      throw error;
    }
  }

  // Créer un paiement
  static async createPayment(paymentData: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      return await apiClient.post('/payments', paymentData);
    } catch (error: any) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Récupérer l'historique des paiements de l'utilisateur
  static async getUserPayments(campaignId: string): Promise<UserPayment[]> {
    try {
      return await apiClient.get(`/payments/my/campaign/${campaignId}`);
    } catch (error: any) {
      console.error('Error fetching user payments:', error);
      throw error;
    }
  }

  // Récupérer l'historique des gains de l'utilisateur
  static async getUserPrizes(): Promise<UserPrize[]> {
    try {
      return await apiClient.get('/spins/prizes/my');
    } catch (error: any) {
      console.error('Error fetching user prizes:', error);
      throw error;
    }
  }

  // Récupérer le solde de spins de l'utilisateur
  static async getSpinBalance(): Promise<SpinBalance> {
    try {
      return await apiClient.get('/spins/balance');
    } catch (error: any) {
      console.error('Error fetching spin balance:', error);
      throw error;
    }
  }

  // Tourner la roue
  static async spinWheel(spinData: SpinRequest): Promise<SpinResult> {
    try {
      return await apiClient.post('/spins/spin', spinData);
    } catch (error: any) {
      console.error('Error spinning wheel:', error);
      throw error;
    }
  }

  // Récupérer les prix actifs pour la roue
  static async getActivePrizes(): Promise<any[]> {
    try {
      return await apiClient.get('/prizes/active');
    } catch (error: any) {
      console.error('Error fetching active prizes:', error);
      throw error;
    }
  }
}
