// Types d'authentification refactorisés
export interface User {
  id: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  role: 'admin' | 'member';
  balance: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  profile_picture?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: 'Bearer';
}

export interface LoginCredentials {
  phone_number: string;
  password: string;
  remember_me?: boolean;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: number;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'member';
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export interface AuthGuardProps {
  children: React.ReactNode;
  roles?: ('admin' | 'member')[];
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}