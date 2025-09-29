// Types pour la roue de la fortune
import { Prize } from './api';

export interface SpinResult {
  id: string;
  user_id: string;
  prize_id: string;
  prize: Prize;
  spin_date: string;
  is_used: boolean;
  used_at?: string;
}

export interface WheelConfig {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  prizes: Prize[];
  spin_cost: number;
  max_spins_per_day: number;
  created_at: string;
  updated_at: string;
}

export interface SpinHistory {
  id: string;
  user_id: string;
  prize_id: string;
  prize: Prize;
  spin_date: string;
  is_used: boolean;
  used_at?: string;
}

export interface WheelStats {
  total_spins: number;
  total_prizes_won: number;
  total_value_won: number;
  spins_today: number;
  remaining_spins_today: number;
  last_spin_date?: string;
}