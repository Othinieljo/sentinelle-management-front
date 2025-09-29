// Configuration de l'API SENTINELLE
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Configuration des endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    PROFILE: '/users/profile',
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  CAMPAIGNS: {
    LIST: '/campaigns',
    ACTIVE: '/campaigns/active',
    DETAIL: (id: string) => `/campaigns/${id}`,
    CREATE: '/campaigns',
    UPDATE: (id: string) => `/campaigns/${id}`,
    DELETE: (id: string) => `/campaigns/${id}`,
  },
  PRIZES: {
    LIST: '/prizes',
    CREATE: '/prizes',
    UPDATE: (id: string) => `/prizes/${id}`,
    DELETE: (id: string) => `/prizes/${id}`,
  },
  SPINS: {
    BALANCE: '/spins/balance',
    SPIN: '/spins',
    HISTORY: '/spins',
  },
  PAYMENTS: {
    CREATE: '/payments',
    HISTORY: '/payments',
  },
  REPORTS: {
    DASHBOARD: '/reports/dashboard',
    SPINS: '/reports/spins',
    PAYMENTS: '/reports/payments',
  },
};

// Configuration des messages d'erreur
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
  UNAUTHORIZED: 'Session expirée. Veuillez vous reconnecter.',
  FORBIDDEN: 'Vous n\'avez pas les permissions nécessaires.',
  NOT_FOUND: 'Ressource introuvable.',
  VALIDATION_ERROR: 'Données invalides.',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
  UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite.',
};

// Configuration des types de paiement
export const PAYMENT_METHODS = {
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  MOBILE_MONEY: 'mobile_money',
} as const;

// Configuration des rôles
export const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

// Configuration des statuts de campagne
export const CAMPAIGN_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
} as const;

// Configuration des statuts de paiement
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;