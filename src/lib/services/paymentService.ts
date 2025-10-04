// Service de gestion des paiements
import { apiClient } from '@/lib/api/api-client';

export interface Payment {
  id: string;
  user_id: string;
  campaign_id: string;
  amount: string;
  spins_earned: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  completed_at?: string;
  user: {
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  campaign: {
    name: string;
  };
}

export interface PaymentStats {
  total_payments: number;
  total_amount: string;
  completed_payments: number;
  pending_payments: number;
  failed_payments: number;
  average_payment: string;
  total_spins_distributed: number;
  monthly_stats: Array<{
    month: string;
    count: number;
    amount: string;
  }>;
}

export interface PaymentStatusCounts {
  pending: number;
  completed: number;
  failed: number;
  total: number;
}

export interface PaymentsResponse {
  data: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdatePaymentStatusRequest {
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
}

export class PaymentService {
  // Récupérer la liste des paiements avec filtres
  static async getPayments(params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'completed' | 'failed' | 'cancelled';
    campaign_id?: string;
    user_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<PaymentsResponse> {
    return apiClient.get('/payments', { params });
  }

  // Récupérer les détails d'un paiement
  static async getPaymentById(id: string): Promise<Payment> {
    return apiClient.get(`/payments/${id}`);
  }

  // Modifier le statut d'un paiement
  static async updatePaymentStatus(id: string, statusData: UpdatePaymentStatusRequest): Promise<Payment> {
    return apiClient.patch(`/payments/${id}/status`, statusData);
  }

  // Récupérer les statistiques des paiements
  static async getPaymentStats(): Promise<PaymentStats> {
    return apiClient.get('/payments/stats/overview');
  }

  // Récupérer les paiements récents
  static async getRecentPayments(limit?: number): Promise<Payment[]> {
    return apiClient.get('/payments/recent', { params: { limit } });
  }

  // Récupérer les statistiques des paiements par statut
  static async getPaymentStatusCounts(): Promise<PaymentStatusCounts> {
    return apiClient.get('/payments/stats/count-by-status');
  }
}