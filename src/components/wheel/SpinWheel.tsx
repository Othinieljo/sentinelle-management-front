'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Gift, AlertCircle } from 'lucide-react';
import { SpinService, SpinBalance, SpinResult } from '@/lib/services/spinService';
import { PrizeService, Prize } from '@/lib/services/prizeService';
import { Button } from '@/components/ui/Button/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card/Card';
import { useToast } from '@/hooks/useToast';

interface SpinWheelProps {
  campaignId?: string;
  onSpinComplete?: (result: SpinResult) => void;
  className?: string;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ 
  campaignId, 
  onSpinComplete, 
  className = '' 
}) => {
  const { addToast } = useToast();
  
  // États
  const [balance, setBalance] = useState<SpinBalance | null>(null);
  const [activePrizes, setActivePrizes] = useState<Prize[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger le solde et les prix actifs
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [balanceData, prizesData] = await Promise.all([
        SpinService.getSpinBalance(),
        PrizeService.getActivePrizes()
      ]);
      
      setBalance(balanceData);
      setActivePrizes(prizesData);
    } catch (err: any) {
      console.error('Error loading spin data:', err);
      setError('Erreur lors du chargement des données');
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les données de la roue'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Lancer la roue
  const handleSpin = async () => {
    if (!balance || balance.available_spins <= 0) {
      addToast({
        type: 'warning',
        title: 'Aucun spin disponible',
        message: 'Vous n\'avez pas assez de spins pour jouer'
      });
      return;
    }

    if (activePrizes.length === 0) {
      addToast({
        type: 'warning',
        title: 'Aucun prix disponible',
        message: 'Il n\'y a actuellement aucun prix disponible'
      });
      return;
    }

    setIsSpinning(true);
    setError(null);

    try {
      const result = await SpinService.spinWheel(campaignId);
      
      // Mettre à jour le solde
      setBalance(result.balance);
      
      // Notifier le parent si nécessaire
      if (onSpinComplete) {
        onSpinComplete(result);
      }
      
      // Afficher le résultat
      if (result.success) {
        if (result.spin.is_winning && result.prize) {
          addToast({
            type: 'success',
            title: '🎉 Félicitations !',
            message: `Vous avez gagné : ${result.prize.name} !`
          });
        } else {
          addToast({
            type: 'info',
            title: 'Pas de chance cette fois',
            message: 'Réessayez lors du prochain spin !'
          });
        }
      }
    } catch (err: any) {
      console.error('Error spinning wheel:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors du lancement de la roue';
      setError(errorMessage);
      addToast({
        type: 'error',
        title: 'Erreur',
        message: errorMessage
      });
    } finally {
      setIsSpinning(false);
    }
  };

  // Recharger les données
  const handleRefresh = () => {
    loadData();
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-3 text-gray-600">Chargement...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Gift className="w-6 h-6 text-orange-500" />
          Roue de la Fortune
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Solde des spins */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-orange-800">Spins Disponibles</h3>
              <p className="text-3xl font-bold text-orange-600">
                {balance?.available_spins || 0}
              </p>
              <p className="text-sm text-orange-700">
                Total gagnés: {balance?.total_spins_earned || 0} | 
                Total utilisés: {balance?.total_spins_used || 0}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="text-orange-600 hover:bg-orange-200"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Prix disponibles */}
        <div>
          <h4 className="text-md font-semibold text-gray-700 mb-3">
            Prix Disponibles ({activePrizes.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {activePrizes.slice(0, 8).map((prize) => (
              <motion.div
                key={prize.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-3 rounded-lg border border-gray-200 text-center"
              >
                {prize.image_url ? (
                  <img
                    src={prize.image_url}
                    alt={prize.name}
                    className="w-8 h-8 mx-auto mb-2 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                    <Gift className="w-4 h-4 text-gray-500" />
                  </div>
                )}
                <p className="text-xs font-medium text-gray-800 truncate">
                  {prize.name}
                </p>
                {prize.value && (
                  <p className="text-xs text-gray-600">
                    {prize.value} FCFA
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Bouton de lancement */}
        <div className="text-center">
          <Button
            onClick={handleSpin}
            disabled={isSpinning || !balance || balance.available_spins <= 0 || activePrizes.length === 0}
            variant="gradient"
            size="lg"
            className="px-8 py-3 text-lg font-semibold"
          >
            {isSpinning ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                En cours...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Lancer la Roue
              </>
            )}
          </Button>
          
          {(!balance || balance.available_spins <= 0) && (
            <p className="text-sm text-gray-500 mt-2">
              Vous n'avez pas de spins disponibles
            </p>
          )}
          
          {activePrizes.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Aucun prix disponible pour le moment
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpinWheel;
