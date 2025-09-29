'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Gift, 
  Zap,
  Trophy,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { MemberService } from '@/lib/services/memberService';
import { SpinService, SpinBalance } from '@/lib/services/spinService';
import { PrizeService, Prize } from '@/lib/services/prizeService';
import { Button } from '@/components/ui/Button/Button';
import { Card, CardContent } from '@/components/ui/Card/Card';
import { useToast } from '@/hooks/useToast';

interface SpinWheelProps {
  campaignId?: string;
  onSpinComplete?: (result: any) => void;
  spinning?: boolean;
  availableSpins?: number;
  lastResult?: any;
  className?: string;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ 
  campaignId, 
  onSpinComplete, 
  spinning = false,
  availableSpins = 0,
  lastResult = null,
  className = '' 
}) => {
  const { addToast } = useToast();
  
  // États
  const [balance, setBalance] = useState<SpinBalance | null>(null);
  const [activePrizes, setActivePrizes] = useState<Prize[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [wonPrize, setWonPrize] = useState<any | null>(null);

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

  // Effet pour charger les données
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Effet pour gérer l'animation de la roue
  useEffect(() => {
    if (spinning) {
      setIsSpinning(true);
      setShowResult(false);
      
      // Animation de rotation
      const spinDuration = 3000; // 3 secondes
      const rotations = 5 + Math.random() * 3; // 5-8 rotations
      const finalRotation = wheelRotation + (rotations * 360);
      
      setWheelRotation(finalRotation);
      
      // Arrêter l'animation après la durée
      setTimeout(() => {
        setIsSpinning(false);
        if (lastResult && lastResult.prize_won) {
          setWonPrize(lastResult.prize_won as any);
          setShowResult(true);
        }
      }, spinDuration);
    }
  }, [spinning, lastResult, wheelRotation]);

  // Gérer le tour de roue
  const handleSpin = async () => {
    if (!balance || balance.available_spins < 1) {
      addToast({
        type: 'error',
        title: 'Pas de spins disponibles',
        message: 'Vous devez d\'abord contribuer pour gagner des spins'
      });
      return;
    }

    try {
      const result = await MemberService.spinWheel({
        campaign_id: campaignId || '',
        user_agent: navigator.userAgent
      });
      
      // Mettre à jour le solde
      const updatedBalance = await SpinService.getSpinBalance();
      setBalance(updatedBalance);
      
      // Notifier le parent
      if (onSpinComplete) {
        onSpinComplete(result);
      }
      
    } catch (err: any) {
      console.error('Error spinning wheel:', err);
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de tourner la roue'
      });
    }
  };

  // Créer les segments de la roue
  const createWheelSegments = () => {
    if (activePrizes.length === 0) return null;
    
    const segmentAngle = 360 / activePrizes.length;
    
    return activePrizes.map((prize, index) => {
      const startAngle = index * segmentAngle;
      const endAngle = (index + 1) * segmentAngle;
      
      return (
        <div
          key={prize.id}
          className="absolute w-full h-full"
          style={{
            transform: `rotate(${startAngle}deg)`,
            transformOrigin: 'center'
          }}
        >
          <div
            className="absolute top-0 left-1/2 w-0 h-0 border-l-[100px] border-r-[100px] border-b-[50px] border-l-transparent border-r-transparent"
            style={{
              borderBottomColor: index % 2 === 0 ? '#f97316' : '#ea580c',
              transform: 'translateX(-50%)'
            }}
          />
          <div
            className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white text-xs font-semibold text-center"
            style={{
              width: '80px',
              transform: `translateX(-50%) rotate(${segmentAngle / 2}deg)`
            }}
          >
            {prize.name}
          </div>
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={loadData}
            variant="outline"
            className="mt-4"
          >
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Informations sur les spins */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Spins disponibles</p>
                <p className="text-xl font-bold text-purple-600">
                  {availableSpins || balance?.available_spins || 0}
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleSpin}
              disabled={isSpinning || (availableSpins || balance?.available_spins || 0) < 1}
              variant="gradient"
              className="px-6 py-3"
            >
              {isSpinning ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Tourner
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Roue de la fortune */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-8">
          <div className="flex justify-center">
            <div className="relative">
              {/* Roue */}
              <div className="relative w-64 h-64">
                <motion.div
                  className="w-full h-full rounded-full border-4 border-gray-300 relative overflow-hidden"
                  animate={{ 
                    rotate: wheelRotation,
                    transition: { 
                      duration: isSpinning ? 3 : 0,
                      ease: isSpinning ? "easeOut" : "linear"
                    }
                  }}
                  style={{
                    background: 'conic-gradient(from 0deg, #f97316, #ea580c, #f97316, #ea580c, #f97316, #ea580c, #f97316, #ea580c)'
                  }}
                >
                  {createWheelSegments()}
                </motion.div>
                
                {/* Pointeur */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                  <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-red-500"></div>
                </div>
                
                {/* Centre de la roue */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Prix disponibles */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Prix Disponibles
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {activePrizes.slice(0, 4).map((prize) => (
                <div
                  key={prize.id}
                  className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 text-center"
                >
                  <Gift className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-900">{prize.name}</p>
                  <p className="text-xs text-gray-600">{prize.description}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résultat du tour */}
      {showResult && wonPrize && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowResult(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 Félicitations !
              </h2>
              <p className="text-gray-600">
                Vous avez gagné :
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-4 mb-6">
              <h3 className="text-xl font-bold text-orange-600 mb-2">
                {wonPrize.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {wonPrize.description}
              </p>
            </div>
            
            <Button
              onClick={() => setShowResult(false)}
              variant="gradient"
              className="w-full"
            >
              Continuer
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SpinWheel;
