// Types pour l'API
import { BaseEntity, PaginatedResponse, ApiResponse } from './common';
import { User } from './auth';

export interface Campaign extends BaseEntity {
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by: string;
  image_url?: string;
}

export interface Prize extends BaseEntity {
  name: string;
  description: string;
  value: number;
  probability: number;
  color: string;
  icon?: string;
  is_active: boolean;
}

export interface Spin extends BaseEntity {
  user_id: string;
  prize_id: string;
  prize: Prize;
  spin_date: string;
  is_used: boolean;
  used_at?: string;
}

export interface Payment extends BaseEntity {
  user_id: string;
  campaign_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: string;
  transaction_id?: string;
  payment_date?: string;
}

export interface DashboardStats {
  total_users: number;
  total_campaigns: number;
  total_contributions: number;
  total_amount: number;
  active_campaigns: number;
  recent_activity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'contribution' | 'spin' | 'login' | 'campaign_created';
  user_id: string;
  user_name: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Types pour les requêtes API
export interface LoginRequest {
  phone_number: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface CreateUserRequest {
  phone_number: string;
  password: string;
  first_name: string;
  last_name: string;
  email?: string;
  role: 'admin' | 'member';
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_picture?: string;
}

export interface CreateCampaignRequest {
  name: string;
  description: string;
  target_amount: number;
  start_date: string;
  end_date: string;
  image_url?: string;
}

export interface CreateContributionRequest {
  campaign_id: string;
  amount: number;
  payment_method: string;
}

export interface SpinWheelRequest {
  wheel_id?: string;
}

export interface SpinWheelResponse {
  spin: Spin;
  prize: Prize;
  is_winner: boolean;
}

// Types pour les réponses paginées
export type UsersResponse = PaginatedResponse<User>;
export type CampaignsResponse = PaginatedResponse<Campaign>;
export type SpinsResponse = PaginatedResponse<Spin>;
export type PaymentsResponse = PaginatedResponse<Payment>;
