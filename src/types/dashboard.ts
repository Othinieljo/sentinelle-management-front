// Types pour les dashboards
import { ActivityItem, Campaign, Prize, DashboardStats } from './api';
import { User } from './auth';
import { SpinHistory, WheelConfig } from './wheel';

export interface MemberDashboardData {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: 'member';
    balance: number;
    spins_remaining: number;
  };
  campaigns: Campaign[];
  recent_contributions: Contribution[];
  spin_history: SpinHistory[];
  wheel_config: WheelConfig;
}

export interface AdminDashboardData {
  stats: DashboardStats;
  campaigns: Campaign[];
  users: User[];
  recent_activity: ActivityItem[];
  system_health: SystemHealth;
}

export interface SystemHealth {
  api_status: 'online' | 'offline' | 'degraded';
  database_status: 'online' | 'offline' | 'degraded';
  last_backup: string;
  uptime: number;
}

export interface Contribution {
  id: string;
  user_id: string;
  campaign_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  created_at: string;
  user_name: string;
}

