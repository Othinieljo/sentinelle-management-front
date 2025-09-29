// Mock Data for SENTINELLE Frontend Demo
export const mockUsers = {
  member: {
    id: '1',
    phone: '+33 6 12 34 56 78',
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    role: 'member' as const,
    balance: 15000,
    spins: 3,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  admin: {
    id: '2',
    phone: '+33 6 98 76 54 32',
    name: 'Marie Admin',
    email: 'marie.admin@example.com',
    role: 'admin' as const,
    balance: 0,
    spins: 0,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
};

export const mockCampaigns = [
  {
    id: '1',
    title: 'Nouveau terrain de football',
    description: 'Construction d\'un terrain de football pour la communauté avec éclairage et vestiaires',
    targetAmount: 500000,
    currentAmount: 350000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Équipement médical',
    description: 'Achat d\'équipements médicaux pour le centre de santé communautaire',
    targetAmount: 200000,
    currentAmount: 120000,
    startDate: '2024-02-01',
    endDate: '2024-06-30',
    isActive: true,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'Bibliothèque communautaire',
    description: 'Création d\'une bibliothèque pour les enfants avec livres et ordinateurs',
    targetAmount: 100000,
    currentAmount: 100000,
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    isActive: false,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

export const mockPrizes = [
  {
    id: '1',
    name: '1000 FCFA',
    description: 'Crédit de 1000 FCFA ajouté à votre solde',
    value: 1000,
    probability: 0.3,
    isActive: true,
    color: '#10b981',
  },
  {
    id: '2',
    name: '5000 FCFA',
    description: 'Crédit de 5000 FCFA ajouté à votre solde',
    value: 5000,
    probability: 0.1,
    isActive: true,
    color: '#3b82f6',
  },
  {
    id: '3',
    name: 'Tour gratuit',
    description: 'Un tour gratuit de la roue',
    value: 0,
    probability: 0.2,
    isActive: true,
    color: '#8b5cf6',
  },
  {
    id: '4',
    name: 'Merci !',
    description: 'Merci pour votre participation',
    value: 0,
    probability: 0.4,
    isActive: true,
    color: '#f59e0b',
  },
];

export const mockPayments = [
  {
    id: '1',
    amount: 5000,
    campaignId: '1',
    campaign: mockCampaigns[0],
    status: 'completed' as const,
    paymentMethod: 'card' as const,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    amount: 10000,
    campaignId: '2',
    campaign: mockCampaigns[1],
    status: 'completed' as const,
    paymentMethod: 'mobile_money' as const,
    createdAt: '2024-01-14T15:45:00Z',
    updatedAt: '2024-01-14T15:45:00Z',
  },
];

export const mockSpins = [
  {
    id: '1',
    userId: '1',
    campaignId: '1',
    prizeId: '1',
    prize: mockPrizes[0],
    createdAt: '2024-01-14T15:45:00Z',
  },
  {
    id: '2',
    userId: '1',
    campaignId: '2',
    prizeId: '3',
    prize: mockPrizes[2],
    createdAt: '2024-01-13T09:20:00Z',
  },
];

// Fonction pour simuler un login
export const simulateLogin = async (phone: string, password: string) => {
  // Simuler un délai de réseau
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Vérifier les credentials (simulation)
  if (phone === '+33 6 12 34 56 78' && password === 'password') {
    return {
      user: mockUsers.member,
      token: 'mock-token-member',
      refreshToken: 'mock-refresh-token-member',
    };
  }
  
  if (phone === '+33 6 98 76 54 32' && password === 'admin') {
    return {
      user: mockUsers.admin,
      token: 'mock-token-admin',
      refreshToken: 'mock-refresh-token-admin',
    };
  }
  
  throw new Error('Identifiants incorrects');
};

// Fonction pour simuler une contribution
export const simulateContribution = async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    paymentId: Math.random().toString(36).substr(2, 9),
    message: 'Contribution enregistrée avec succès',
  };
};

// Fonction pour simuler un tour de roue
export const simulateWheelSpin = async () => {
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Sélectionner un prix aléatoire basé sur les probabilités
  const random = Math.random();
  let cumulativeProbability = 0;
  
  for (const prize of mockPrizes) {
    cumulativeProbability += prize.probability;
    if (random <= cumulativeProbability) {
      return prize;
    }
  }
  
  return mockPrizes[mockPrizes.length - 1]; // Fallback
};
