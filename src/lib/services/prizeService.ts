// Service de gestion des lots
import { apiClient } from '@/lib/api/api-client';

export interface Prize {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  probability_weight: number;
  stock_total: number;
  stock_remaining: number;
  value: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface PrizeStats {
  total_prizes: number;
  active_prizes: number;
  available_prizes: number;
  total_stock: number;
  remaining_stock: number;
  total_value: string;
  stock_usage_percentage: number;
  category_breakdown: Array<{
    category: string;
    count: number;
    total_value: string;
  }>;
}

export interface CreatePrizeRequest {
  name: string;
  description: string;
  probability_weight: number;
  stock_total: number;
  category: string;
  is_active: boolean;
}

export interface UpdatePrizeRequest {
  name?: string;
  description?: string;
  probability_weight?: number;
  category?: string;
  is_active?: boolean;
}

export interface PrizesResponse {
  data: Prize[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateStockRequest {
  amount: number;
}

export class PrizeService {
  // Récupérer tous les lots avec pagination
  static async getPrizes(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    is_active?: boolean;
  }): Promise<PrizesResponse> {
    try {
      return await apiClient.get('/prizes', { params });
    } catch (error: any) {
      console.error('Error fetching prizes:', error);
      
      // Retourner une réponse par défaut en cas d'erreur
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
      };
    }
  }

  // Créer un nouveau lot
  static async createPrize(prizeData: CreatePrizeRequest): Promise<Prize> {
    return apiClient.post('/prizes', prizeData);
  }

  // Récupérer les détails d'un lot
  static async getPrizeById(id: string): Promise<Prize> {
    return apiClient.get(`/prizes/${id}`);
  }

  // Récupérer les prix actifs (pour la roue)
  static async getActivePrizes(): Promise<Prize[]> {
    try {
      return await apiClient.get('/prizes/active');
    } catch (error: any) {
      console.error('Error fetching active prizes:', error);
      return [];
    }
  }

  // Modifier un lot
  static async updatePrize(id: string, prizeData: UpdatePrizeRequest): Promise<Prize> {
    return apiClient.patch(`/prizes/${id}`, prizeData);
  }

  // Ajuster le stock d'un lot
  static async updateStock(id: string, stockData: UpdateStockRequest): Promise<Prize> {
    return apiClient.patch(`/prizes/${id}/stock`, stockData);
  }

  // Activer/Désactiver un lot
  static async togglePrize(id: string): Promise<Prize> {
    return apiClient.patch(`/prizes/${id}/toggle`);
  }

  // Supprimer un lot
  static async deletePrize(id: string): Promise<void> {
    return apiClient.delete(`/prizes/${id}`);
  }

  // Récupérer les statistiques des lots
  static async getPrizeStats(): Promise<PrizeStats> {
    return apiClient.get('/prizes/stats/overview');
  }

  // Récupérer les lots à stock faible
  static async getLowStockPrizes(threshold?: number): Promise<Prize[]> {
    return apiClient.get('/prizes/low-stock', { params: { threshold } });
  }
}
