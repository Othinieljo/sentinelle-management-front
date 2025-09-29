// Dashboard membre moderne et mobile-first
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  Gift, 
  TrendingUp, 
  Plus,
  History,
  Settings,
  Bell
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth/auth-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner/LoadingSpinner';
import { SentinelleLogo } from '@/components/common/SentinelleLogo';
import WheelGame from '@/components/wheel/WheelGame';
import { cn } from '@/lib/utils';

// Mock data pour le développement
const mockStats = {
  balance: 15000,
  spinsRemaining: 3,
  totalContributions: 5,
  totalSpins: 12,
};

const mockCampaigns = [
  {
    id: '1',
    name: 'Fonds de solidarité 2024',
    description: 'Collecte pour les membres en difficulté',
    targetAmount: 500000,
    currentAmount: 320000,
    progress: 64,
    endDate: '2024-12-31',
    isActive: true,
  },
  {
    id: '2',
    name: 'Événement annuel',
    description: 'Organisation de la fête de fin d\'année',
    targetAmount: 200000,
    currentAmount: 150000,
    progress: 75,
    endDate: '2024-11-30',
    isActive: true,
  },
];

const mockRecentActivity = [
  {
    id: '1',
    type: 'contribution',
    description: 'Contribution de 5 000 FCFA',
    amount: 5000,
    date: '2024-01-15',
  },
  {
    id: '2',
    type: 'spin',
    description: 'Gagné: 2 000 FCFA',
    amount: 2000,
    date: '2024-01-14',
  },
  {
    id: '3',
    type: 'contribution',
    description: 'Contribution de 3 000 FCFA',
    amount: 3000,
    date: '2024-01-13',
  },
];

const MemberDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'activity' | 'wheel'>('overview');

  useEffect(() => {
    // Simuler le chargement des données
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Chargement de votre tableau de bord..." fullScreen />;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header */}
      <motion.header
        className="bg-white shadow-sm border-b border-orange-100"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <SentinelleLogo size="sm" />
              <span className="ml-2 text-xl font-bold text-gray-900">SENTINELLE</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user ? `${user.first_name} ${user.last_name}` : 'Utilisateur'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation tabs */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
              { id: 'campaigns', label: 'Campagnes', icon: Target },
              { id: 'wheel', label: 'Roue', icon: Gift },
              { id: 'activity', label: 'Activité', icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Contenu principal */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Solde</p>
                        <p className="text-2xl font-bold">{formatCurrency(mockStats.balance)}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Spins restants</p>
                        <p className="text-2xl font-bold text-orange-600">{mockStats.spinsRemaining}</p>
                      </div>
                      <Gift className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Contributions</p>
                        <p className="text-2xl font-bold text-green-600">{mockStats.totalContributions}</p>
                      </div>
                      <Users className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Total spins</p>
                        <p className="text-2xl font-bold text-blue-600">{mockStats.totalSpins}</p>
                      </div>
                      <History className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions rapides */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                  <CardDescription>
                    Gérez vos contributions et participez aux campagnes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button variant="gradient" size="lg" className="h-20">
                      <div className="text-center">
                        <Plus className="w-6 h-6 mx-auto mb-2" />
                        <span>Nouvelle contribution</span>
                      </div>
                    </Button>
                    <Button variant="outline" size="lg" className="h-20">
                      <div className="text-center">
                        <Gift className="w-6 h-6 mx-auto mb-2" />
                        <span>Tourner la roue</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'wheel' && (
            <WheelGame className="mt-6" />
          )}

          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Campagnes actives</h2>
                <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                  Nouvelle contribution
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockCampaigns.map((campaign) => (
                  <Card key={campaign.id} hover>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {campaign.name}
                        <span className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          campaign.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        )}>
                          {campaign.isActive ? 'Active' : 'Terminée'}
                        </span>
                      </CardTitle>
                      <CardDescription>{campaign.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progression</span>
                            <span>{campaign.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              className="bg-orange-500 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${campaign.progress}%` }}
                              transition={{ duration: 1, delay: 0.2 }}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Collecté</p>
                            <p className="font-semibold">{formatCurrency(campaign.currentAmount)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Objectif</p>
                            <p className="font-semibold">{formatCurrency(campaign.targetAmount)}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                          <span className="text-sm text-gray-500">
                            Fin: {formatDate(campaign.endDate)}
                          </span>
                          <Button size="sm" variant="outline">
                            Contribuer
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Activité récente</h2>
              
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200">
                    {mockRecentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        className="p-4 flex items-center justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            activity.type === 'contribution' 
                              ? 'bg-green-100 text-green-600'
                              : 'bg-orange-100 text-orange-600'
                          )}>
                            {activity.type === 'contribution' ? (
                              <Users className="w-5 h-5" />
                            ) : (
                              <Gift className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{activity.description}</p>
                            <p className="text-sm text-gray-500">{formatDate(activity.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            'font-semibold',
                            activity.type === 'contribution' 
                              ? 'text-green-600' 
                              : 'text-orange-600'
                          )}>
                            {activity.type === 'contribution' ? '-' : '+'}{formatCurrency(activity.amount)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MemberDashboard;