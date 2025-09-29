// Service de rapports et statistiques
import { apiClient } from '@/lib/api/api-client';

export interface DashboardOverview {
  total_users: number;
  active_users: number;
  total_campaigns: number;
  active_campaigns: number;
  total_payments: number;
  total_amount: string;
  total_spins: number;
  total_prizes_won: number;
}

export interface RecentActivity {
  type: string;
  description: string;
  timestamp: string;
}

export interface ChartData {
  payments_over_time: Array<{
    date: string;
    amount: string;
    count: number;
  }>;
  spins_distribution: Array<{
    prize_name: string;
    count: number;
  }>;
}

export interface DashboardReport {
  overview: DashboardOverview;
  recent_activity: RecentActivity[];
  charts: ChartData;
}

export class ReportService {
  // Récupérer le rapport du dashboard administrateur
  static async getDashboardReport(): Promise<DashboardReport> {
    try {
      return await apiClient.get('/reports/dashboard');
    } catch (error: any) {
      console.error('Error fetching dashboard report:', error);
      
      // Retourner un rapport par défaut en cas d'erreur
      return {
        overview: {
          total_users: 0,
          active_users: 0,
          total_campaigns: 0,
          active_campaigns: 0,
          total_payments: 0,
          total_amount: '0',
          total_spins: 0,
          total_prizes_won: 0
        },
        recent_activity: [],
        charts: {
          payments_over_time: [],
          spins_distribution: []
        }
      };
    }
  }
}