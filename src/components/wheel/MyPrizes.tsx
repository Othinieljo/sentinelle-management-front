'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Truck, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { SpinService, UserPrize, ClaimResponse } from '@/lib/services/spinService';
import { Button } from '@/components/ui/Button/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card/Card';
import { useToast } from '@/hooks/useToast';

interface MyPrizesProps {
  className?: string;
}

const MyPrizes: React.FC<MyPrizesProps> = ({ className = '' }) => {
  const { addToast } = useToast();
  
  // États
  const [prizes, setPrizes] = useState<UserPrize[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingPrize, setClaimingPrize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Charger les prix gagnés
  const loadPrizes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const prizesData = await SpinService.getMyPrizes();
      setPrizes(prizesData);
    } catch (err: any) {
      console.error('Error loading user prizes:', err);
      setError('Erreur lors du chargement des prix');
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger vos prix gagnés'
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Charger les prix au montage
  useEffect(() => {
    loadPrizes();
  }, [loadPrizes]);

  // Réclamer un prix
  const handleClaimPrize = async (prizeId: string) => {
    setClaimingPrize(prizeId);
    
    try {
      const result: ClaimResponse = await SpinService.claimPrize(prizeId);
      
      if (result.success) {
        addToast({
          type: 'success',
          title: 'Prix réclamé !',
          message: result.message
        });
        
        // Mettre à jour la liste des prix
        setPrizes(prevPrizes => 
          prevPrizes.map(prize => 
            prize.id === prizeId 
              ? { ...prize, status: 'claimed' as const, claimed_at: new Date().toISOString() }
              : prize
          )
        );
      }
    } catch (err: any) {
      console.error('Error claiming prize:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la réclamation';
      addToast({
        type: 'error',
        title: 'Erreur',
        message: errorMessage
      });
    } finally {
      setClaimingPrize(null);
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'claimed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <Truck className="w-4 h-4 text-green-500" />;
      default:
        return <Gift className="w-4 h-4 text-gray-500" />;
    }
  };

  // Obtenir le texte du statut
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'claimed':
        return 'Réclamé';
      case 'delivered':
        return 'Livré';
      default:
        return 'Inconnu';
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'claimed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-3 text-gray-600">Chargement de vos prix...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Gift className="w-6 h-6 text-orange-500" />
            Mes Prix Gagnés
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadPrizes}
            className="text-orange-600 hover:bg-orange-50"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Message d'erreur */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Liste des prix */}
        {prizes.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Aucun prix gagné
            </h3>
            <p className="text-gray-500">
              Lancez la roue de la fortune pour gagner des prix !
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {prizes.map((prize) => (
                <motion.div
                  key={prize.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Image du prix */}
                    <div className="flex-shrink-0">
                      {prize.prize.image_url ? (
                        <img
                          src={prize.prize.image_url}
                          alt={prize.prize.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Gift className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Informations du prix */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-1">
                            {prize.prize.name}
                          </h4>
                          <p className="text-gray-600 text-sm mb-2">
                            {prize.prize.description}
                          </p>
                          
                          {/* Valeur du prix */}
                          {prize.prize.value && (
                            <p className="text-orange-600 font-semibold mb-2">
                              Valeur: {prize.prize.value} FCFA
                            </p>
                          )}

                          {/* Dates */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Gagné le {formatDate(prize.won_at)}
                            </div>
                            {prize.claimed_at && (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Réclamé le {formatDate(prize.claimed_at)}
                              </div>
                            )}
                            {prize.delivered_at && (
                              <div className="flex items-center gap-1">
                                <Truck className="w-3 h-3" />
                                Livré le {formatDate(prize.delivered_at)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Statut et actions */}
                        <div className="flex flex-col items-end gap-2">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(prize.status)}`}>
                            {getStatusIcon(prize.status)}
                            {getStatusText(prize.status)}
                          </div>

                          {/* Bouton de réclamation */}
                          {prize.status === 'pending' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleClaimPrize(prize.id)}
                              disabled={claimingPrize === prize.id}
                              className="text-xs"
                            >
                              {claimingPrize === prize.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                  En cours...
                                </>
                              ) : (
                                'Réclamer'
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyPrizes;
