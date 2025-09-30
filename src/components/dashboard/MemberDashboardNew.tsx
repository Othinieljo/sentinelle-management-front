// Espace Membre - Expérience Mobile-First
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard,
  Gift,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Zap,
  Target,
  History,
  Trophy,
  ArrowRight,
  Plus,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { 
  MemberService, 
  ActiveCampaign, 
  UserCampaignStats, 
  UserPayment, 
  UserPrize,
  SpinBalance,
  CreatePaymentRequest,
  SpinResult
} from '@/lib/services/memberService';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal/Modal';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';
import MyPrizesNew from '@/components/wheel/MyPrizesNew';
import SpinHistoryNew from '@/components/wheel/SpinHistoryNew';

interface MemberDashboardProps {
  className?: string;
}

const MemberDashboard: React.FC<MemberDashboardProps> = ({ className }) => {
  const { addToast } = useToast();
  const router = useRouter();
  
  // États principaux
  const [activeCampaign, setActiveCampaign] = useState<ActiveCampaign | null>(null);
  const [userStats, setUserStats] = useState<UserCampaignStats | null>(null);
  const [spinBalance, setSpinBalance] = useState<SpinBalance | null>(null);
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [prizes, setPrizes] = useState<UserPrize[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour les modales
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPrizesModal, setShowPrizesModal] = useState(false);
  
  // États pour le paiement
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  
  // Fonction pour naviguer vers la roue
  const handleGoToWheel = () => {
    router.push('/member/wheel');
  };
  
  // Charger les données initiales
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      // Charger la campagne active
      const campaign = await MemberService.getActiveCampaign();
      setActiveCampaign(campaign);
      
      // Charger les statistiques utilisateur
      const stats = await MemberService.getUserCampaignStats(campaign.id);
      setUserStats(stats);
      
      // Charger le solde de spins
      const balance = await MemberService.getSpinBalance();
      setSpinBalance(balance);
      
      // Charger l'historique des paiements
      const userPayments = await MemberService.getUserPayments(campaign.id);
      setPayments(userPayments);
      
      // Charger l'historique des gains
      const userPrizes = await MemberService.getUserPrizes();
      setPrizes(userPrizes);
      
    } catch (error: any) {
      console.error('Error loading initial data:', error);
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les données'
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Effet pour charger les données
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Créer un paiement
  const handleCreatePayment = async () => {
    if (!activeCampaign || !paymentAmount || paymentAmount < 100) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Montant minimum requis: 100 FCFA'
      });
      return;
    }

    setPaymentLoading(true);
    try {
      const paymentData: CreatePaymentRequest = {
        campaign_id: activeCampaign.id,
        amount: paymentAmount,
        payment_method: 'wave',
        notes: `Paiement pour gagner des spins - Campagne ${activeCampaign.name}`
      };

      const payment = await MemberService.createPayment(paymentData);
      
      // Générer le lien Wave avec le montant dynamique
      const waveUrl = `https://pay.wave.com/m/M_ci_sV5WKIkOaX8U/c/ci/?amount=${paymentAmount}`;
      setPaymentUrl(waveUrl);
      
      addToast({
        type: 'success',
        title: 'Paiement créé',
        message: `Vous allez gagner ${payment.spins_earned} spin(s)`
      });
      
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de créer le paiement'
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  // Ouvrir le lien de paiement
  const handleOpenPayment = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
      setShowPaymentModal(false);
      setPaymentAmount(0);
      setPaymentUrl('');
    }
  };


  // Calculer la progression vers le prochain spin
  const getProgressToNextSpin = () => {
    if (!userStats || !activeCampaign) return 0;
    
    const { total_contributed, next_spin_at } = userStats.user_stats;
    const { amount_per_spin } = activeCampaign;
    
    const currentProgress = total_contributed % amount_per_spin;
    return (currentProgress / amount_per_spin) * 100;
  };

  // Obtenir l'icône du statut de paiement
  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!activeCampaign || !userStats) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <Target className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Aucune campagne active</h2>
          <p>Il n'y a actuellement aucune campagne en cours.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 to-red-50 ${className}`}>
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* En-tête avec campagne active */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {activeCampaign.name}
            </h1>
            <p className="text-gray-600 text-sm">
              {activeCampaign.description}
            </p>
          </div>
        </motion.div>

        {/* Section Contribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Votre Contribution
                </h2>
                
                {/* Statistiques principales */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl p-4">
                    <div className="flex items-center justify-center mb-2">
                      <CreditCard className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-600">Total Contribué</p>
                    <p className="text-xl font-bold text-orange-600">
                      {userStats.user_stats.total_contributed.toLocaleString()} FCFA
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-center mb-2">
                      <Zap className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600">Spins Disponibles</p>
                    <p className="text-xl font-bold text-green-600">
                      {spinBalance?.available_spins || 0}
                    </p>
                  </div>
                </div>

                {/* Progression vers le prochain spin */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progression vers le prochain spin</span>
                    <span>{Math.round(getProgressToNextSpin())}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${getProgressToNextSpin()}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Il vous faut encore {userStats.user_stats.min_contribution_needed} FCFA pour un spin
                  </p>
                </div>

                {/* Bouton de paiement */}
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  variant="gradient"
                  className="w-full py-4 text-lg font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Faire un Paiement
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section Actions Principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 gap-4"
        >
          {/* Roue de la Fortune - Plus Prominente */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full shadow-lg">
                    <RotateCcw className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Roue de la Fortune
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Tournez la roue avec vos spins disponibles
                </p>
                
                <Button
                  onClick={handleGoToWheel}
                  variant="gradient"
                  className="w-full py-4 text-lg font-semibold shadow-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Tourner la Roue
                </Button>
                
                {spinBalance && spinBalance.available_spins < 1 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Vous n'avez pas de spins disponibles
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions Rapides */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => setShowHistoryModal(true)}
              variant="ghost"
              className="h-24 flex flex-col items-center justify-center bg-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="p-3 bg-blue-100 rounded-full mb-2">
                <History className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-semibold">Paiements</span>
              <span className="text-xs text-gray-500">{payments.length} transactions</span>
            </Button>
            
            <Button
              onClick={() => setShowPrizesModal(true)}
              variant="ghost"
              className="h-24 flex flex-col items-center justify-center bg-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="p-3 bg-yellow-100 rounded-full mb-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm font-semibold">Mes Gains</span>
              <span className="text-xs text-gray-500">{prizes.length} prix</span>
            </Button>
          </div>
        </motion.div>

        {/* Modale de Paiement */}
        <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
          <ModalHeader>
            <h3 className="text-lg font-semibold">Faire un Paiement</h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (FCFA)
                </label>
                <Input
                  type="number"
                  value={paymentAmount === 0 ? '' : paymentAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setPaymentAmount(0);
                    } else {
                      const numValue = parseFloat(value);
                      setPaymentAmount(isNaN(numValue) ? 0 : numValue);
                    }
                  }}
                  onFocus={(e) => {
                    if (paymentAmount === 0) {
                      e.target.select();
                    }
                  }}
                  placeholder="Entrez le montant"
                  min="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: 100 FCFA
                </p>
              </div>
              
              {paymentAmount >= 100 && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Spins gagnés:</span>
                    <span className="font-semibold text-orange-600">
                      {(paymentAmount / activeCampaign.amount_per_spin).toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
              
              {paymentAmount > 0 && paymentAmount < 100 && (
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-600">
                      ⚠️ Montant minimum requis: 100 FCFA
                    </span>
                  </div>
                </div>
              )}
              
              {paymentUrl && (
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-700 mb-2">
                    Votre lien de paiement est prêt !
                  </p>
                  <Button
                    onClick={handleOpenPayment}
                    variant="success"
                    className="w-full"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Payer avec Wave
                  </Button>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setShowPaymentModal(false)}>
              Annuler
            </Button>
            {!paymentUrl && (
              <Button 
                onClick={handleCreatePayment}
                loading={paymentLoading}
                disabled={paymentAmount < 100}
                className={paymentAmount < 100 ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {paymentAmount < 100 ? 'Montant minimum requis' : 'Créer le Paiement'}
              </Button>
            )}
          </ModalFooter>
        </Modal>


        {/* Modale Historique des Paiements */}
        <Modal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} size="lg">
          <ModalHeader>
            <h3 className="text-lg font-semibold">Historique des Paiements</h3>
          </ModalHeader>
          <ModalBody>
            <SpinHistoryNew payments={payments} />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setShowHistoryModal(false)}>
              Fermer
            </Button>
          </ModalFooter>
        </Modal>

        {/* Modale Mes Gains */}
        <Modal isOpen={showPrizesModal} onClose={() => setShowPrizesModal(false)} size="lg">
          <ModalHeader>
            <h3 className="text-lg font-semibold">Mes Gains</h3>
          </ModalHeader>
          <ModalBody>
            <MyPrizesNew prizes={prizes} />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setShowPrizesModal(false)}>
              Fermer
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default MemberDashboard;
