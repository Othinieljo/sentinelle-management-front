// Auth Store - SENTINELLE
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, User } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthStore extends AuthState {
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (phone: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await apiClient.login(phone, password);
          
          set({
            user: result.user,
            token: result.access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await apiClient.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshAuth: async () => {
        try {
          const user = await apiClient.getCurrentUser();
          set({ 
            user,
            isAuthenticated: true,
            error: null 
          });
        } catch (error) {
          console.error('Token refresh error:', error);
          get().logout();
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      initialize: async () => {
        const { token, isAuthenticated } = get();
        
        console.log('Auth initialize called:', { token: !!token, isAuthenticated });
        
        if (!token || !isAuthenticated) {
          console.log('No token or not authenticated, setting loading to false');
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });
        
        try {
          console.log('Fetching current user...');
          const user = await apiClient.getCurrentUser();
          console.log('Current user fetched:', user);
          set({ 
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null 
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },
    }),
    {
      name: 'sentinelle-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);