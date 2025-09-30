// Dashboard Administrateur complet et moderne
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  Target, 
  Plus, 
  BarChart3,
  Activity,
  UserPlus,
  Settings,
  Gift,
  CreditCard,
  TrendingUp,
  Calendar,
  Eye,
  User
} from 'lucide-react';
import { Card, CardContent, CardTitle, CardHeader } from '../ui';
import AdminHeader from './AdminHeader';
import UserManagement from './UserManagement';
import CampaignManagement from './CampaignManagement';
import PaymentManagement from './PaymentManagement';
import PrizeManagement from './PrizeManagement';
import SpinManagement from './SpinManagement';
import { ReportService, DashboardReport } from '../../lib/services/reportService';
import { CampaignService, Campaign } from '../../lib/services/campaignService';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

const AdminDashboardNew: React.FC = () => {
  const { addToast } = useToast();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'campaigns' | 'payments' | 'prizes' | 'spins' | 'analytics'>('overview');
  const [dashboardReport, setDashboardReport] = useState<DashboardReport | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [, setLoading] = useState(true);

  const handleGoToMemberArea = () => {
    router.push('/member');
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Charger le rapport du dashboard
      const report = await ReportService.getDashboardReport();
      console.log('Dashboard report:', report); // Debug
      setDashboardReport(report);

      // Charger les campagnes
      const campaignsData = await CampaignService.getCampaigns();
      console.log('Campaigns data:', campaignsData); // Debug
      setCampaigns(campaignsData.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      
      // Données par défaut en cas d'erreur
      const defaultReport = {
        overview: {
          total_users: 0,
          active_users: 0,
          total_campaigns: 0,
          active_campaigns: 0,
          total_payments: 0,
          total_amount: '0',
          total_spins: 0,
          total_prizes_won: 0
        },
        recent_activity: [],
        charts: {
          payments_over_time: [],
          spins_distribution: []
        }
      };
      setDashboardReport(defaultReport);
      
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les données du dashboard',
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Charger les données au montage du composant
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Navigation tabs
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'campaigns', label: 'Campagnes', icon: Target },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'prizes', label: 'Lots', icon: Gift },
    { id: 'spins', label: 'Spins', icon: Activity },
    { id: 'analytics', label: 'Analytiques', icon: TrendingUp },
  ];

  // Composant de vue d'ensemble
  const OverviewTab = () => {
    if (!dashboardReport) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      );
    }

    const { 
      overview = {
        total_users: 0,
        active_users: 0,
        total_campaigns: 0,
        active_campaigns: 0,
        total_payments: 0,
        total_amount: '0',
        total_spins: 0,
        total_prizes_won: 0
      }, 
      recent_activity = [] 
    } = dashboardReport;

    return (
      <div className="space-y-6">
        {/* Bouton d'accès à l'espace membre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="flex justify-center mb-6"
        >
          <motion.button
            onClick={handleGoToMemberArea}
            className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-400"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <User size={24} />
            <div className="text-left">
              <div className="font-semibold text-lg">Accéder à mon Espace Membre</div>
              <div className="text-sm opacity-90">Participer aux campagnes et tourner la roue</div>
            </div>
          </motion.button>
        </motion.div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Utilisateurs</p>
                    <p className="text-3xl font-bold text-blue-900">{overview.total_users}</p>
                    <p className="text-sm text-blue-700">{overview.active_users} actifs</p>
                  </div>
                  <div className="p-3 bg-blue-200 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Paiements</p>
                    <p className="text-3xl font-bold text-green-900">{overview.total_payments}</p>
                    <p className="text-sm text-green-700">{overview.total_amount} FCFA</p>
                  </div>
                  <div className="p-3 bg-green-200 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Campagnes</p>
                    <p className="text-3xl font-bold text-purple-900">{overview.total_campaigns}</p>
                    <p className="text-sm text-purple-700">{overview.active_campaigns} actives</p>
                  </div>
                  <div className="p-3 bg-purple-200 rounded-full">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Spins</p>
                    <p className="text-3xl font-bold text-orange-900">{overview.total_spins}</p>
                    <p className="text-sm text-orange-700">{overview.total_prizes_won} prix gagnés</p>
                  </div>
                  <div className="p-3 bg-orange-200 rounded-full">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Activité récente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activité Récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recent_activity.slice(0, 5).map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Campagnes Actives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaigns.filter(c => c.is_active).slice(0, 3).map((campaign) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Objectif: {campaign.target_amount} FCFA
                      </span>
                      <span className="text-orange-600 font-medium">
                        {campaign.spins_per_amount} spins/FCFA
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Composant de campagnes
  const CampaignsTab = () => <CampaignManagement />;

  // Composant de paiements
  const PaymentsTab = () => <PaymentManagement />;

  // Composant de lots
  const PrizesTab = () => <PrizeManagement />;

  // Composant de spins
  const SpinsTab = () => <SpinManagement />;

  // Composant d'analytiques
  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytiques</h2>
          <p className="text-gray-600">Graphiques et analyses détaillées</p>
        </div>
      </div>

      <div className="text-center py-12 text-gray-500">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>Composant d'analytiques en cours de développement</p>
      </div>
    </div>
  );

  // Rendu du contenu selon l'onglet actif
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'users':
        return <UserManagement />;
      case 'campaigns':
        return <CampaignsTab />;
      case 'payments':
        return <PaymentsTab />;
      case 'prizes':
        return <PrizesTab />;
      case 'spins':
        return <SpinsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation par onglets */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'overview' | 'users' | 'campaigns' | 'payments' | 'prizes' | 'spins' | 'analytics')}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenu de l'onglet actif */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboardNew;
