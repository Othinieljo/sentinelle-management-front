// Store d'authentification simplifié et optimisé
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';
import { User, LoginCredentials } from '@/types/auth';
import { apiClient } from '@/lib/api/api-client';
import { toastManager } from '@/lib/toast-utils';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
  initialize: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setToken: (token) => set(produce((state) => {
        state.token = token;
        state.isAuthenticated = !!token;
      })),
      setUser: (user) => set(produce((state) => {
        state.user = user;
      })),
      setLoading: (loading) => set(produce((state) => {
        state.isLoading = loading;
      })),
      setError: (error) => set(produce((state) => {
        state.error = error;
      })),
      clearError: () => set(produce((state) => {
        state.error = null;
      })),
      checkAuth: async () => {
        const { token, isAuthenticated } = get();
        if (!token || !isAuthenticated) {
          return false;
        }
        try {
          await apiClient.getCurrentUser();
          return true;
        } catch (error) {
          console.error('Auth check failed:', error);
          get().logout();
          return false;
        }
      },

        login: async (credentials) => {
          set({ isLoading: true, error: null });
          try {
            const response = await apiClient.login(credentials);
            set(produce((state) => {
              state.user = response.user;
              state.token = response.access_token;
              state.isAuthenticated = true;
              state.isLoading = false;
              state.error = null;
            }));
            console.log('response', response);
            apiClient.setToken(response.access_token);
            
            // Stocker les informations dans les cookies pour le middleware
            if (typeof window !== 'undefined') {
              document.cookie = `sentinelle_token=${response.access_token}; path=/; max-age=86400; SameSite=Lax`;
              document.cookie = `sentinelle_user_role=${response.user.role}; path=/; max-age=86400; SameSite=Lax`;
              document.cookie = `sentinelle_is_authenticated=true; path=/; max-age=86400; SameSite=Lax`;
              document.cookie = `sentinelle_user_id=${response.user.id}; path=/; max-age=86400; SameSite=Lax`;
            }
            
            toastManager.success('Connexion réussie', `Bienvenue, ${response.user.first_name}!`);
          } catch (err: any) {
          const message = err.response?.data?.message || 'Échec de la connexion.';
          set(produce((state) => {
            state.error = message;
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
          }));
          toastManager.error('Erreur de connexion', message);
          throw err;
        }
      },

        logout: async () => {
          set({ isLoading: true });
          try {
            await apiClient.logout();
            set(produce((state) => {
              state.user = null;
              state.token = null;
              state.isAuthenticated = false;
              state.isLoading = false;
              state.error = null;
            }));
            apiClient.clearToken();
            
            // Supprimer les cookies lors de la déconnexion
            if (typeof window !== 'undefined') {
              document.cookie = 'sentinelle_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              document.cookie = 'sentinelle_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              document.cookie = 'sentinelle_is_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              document.cookie = 'sentinelle_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
            
            toastManager.info('Déconnexion', 'Vous avez été déconnecté.');
          } catch (err: any) {
          const message = err.response?.data?.message || 'Erreur lors de la déconnexion.';
          set(produce((state) => {
            state.error = message;
            state.isLoading = false;
          }));
          toastManager.error('Erreur de déconnexion', message);
        }
      },

      initialize: async () => {
        set({ isLoading: true });

        try {
          if (typeof window !== 'undefined') {
            // Lire les cookies d'abord
            const getCookie = (name: string) => {
              const value = `; ${document.cookie}`;
              const parts = value.split(`; ${name}=`);
              if (parts.length === 2) return parts.pop()?.split(';').shift();
              return null;
            };

            const token = getCookie('sentinelle_token');
            const userRole = getCookie('sentinelle_user_role');
            const isAuthenticated = getCookie('sentinelle_is_authenticated') === 'true';
            const userId = getCookie('sentinelle_user_id');

            if (token && isAuthenticated && userId) {
              apiClient.setToken(token);
              // Utiliser directement les données des cookies pour éviter les appels API côté serveur
              set(produce((state) => {
                state.user = { 
                  id: userId, 
                  role: userRole as 'admin' | 'member',
                  phone_number: '',
                  first_name: '',
                  last_name: '',
                  balance: '0',
                  is_active: true,
                  created_at: '',
                  updated_at: ''
                } as User;
                state.token = token;
                state.isAuthenticated = true;
                state.isLoading = false;
                state.error = null;
              }));
            } else {
              set(produce((state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
              }));
            }
          } else {
            set(produce((state) => {
              state.isLoading = false;
              state.isAuthenticated = false;
              state.user = null;
              state.token = null;
            }));
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          set(produce((state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
          }));
          apiClient.clearToken();
        }
      },

      refreshAuth: async () => {
        const { token } = get();
        if (!token) {
          set(produce((state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
          }));
          apiClient.clearToken();
          return;
        }

        try {
          const user = await apiClient.getCurrentUser();
          set(produce((state) => {
            state.user = user;
            state.isAuthenticated = true;
            state.error = null;
          }));
        } catch (error) {
          console.error('Token refresh failed:', error);
          set(produce((state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
          }));
          apiClient.clearToken();
            toastManager.error('Session expirée', 'Veuillez vous reconnecter.');
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

export const useAuth = () => useAuthStore();