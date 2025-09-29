// Service de gestion des utilisateurs
import { apiClient } from '@/lib/api/api-client';
import { User } from '@/types/auth';

export interface UserStats {
  user_id: string;
  total_payments: number;
  total_amount: string;
  total_spins: number;
  total_prizes_won: number;
  last_payment: string;
  last_spin: string;
}

export interface UsersResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateUserRequest {
  phone_number: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'member';
  balance?: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  role?: 'admin' | 'member';
}

export class UserService {
  // Récupérer la liste des utilisateurs avec pagination et filtres
  static async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'admin' | 'member';
    is_active?: boolean;
  }): Promise<UsersResponse> {
    return apiClient.get('/users', { params });
  }

  // Créer un nouvel utilisateur
  static async createUser(userData: CreateUserRequest): Promise<User> {
    return apiClient.post('/users', userData);
  }

  // Récupérer les détails d'un utilisateur
  static async getUserById(id: string): Promise<User> {
    return apiClient.get(`/users/${id}`);
  }

  // Modifier un utilisateur
  static async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    return apiClient.patch(`/users/${id}`, userData);
  }

  // Supprimer un utilisateur
  static async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`/users/${id}`);
  }

  // Récupérer les statistiques d'un utilisateur
  static async getUserStats(id: string): Promise<UserStats> {
    return apiClient.get(`/users/${id}/stats`);
  }
}