'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SpinService, SpinResult, SpinBalance } from '@/lib/services/spinService';
import { PrizeService, Prize } from '@/lib/services/prizeService';
import SpinWheel from './SpinWheel';
import MyPrizes from './MyPrizes';
import SpinHistory from './SpinHistory';
import { useToast } from '@/hooks/useToast';

interface WheelGameProps {
  campaignId?: string;
  className?: string;
}

const WheelGame: React.FC<WheelGameProps> = ({ 
  campaignId, 
  className = '' 
}) => {
  const { addToast } = useToast();
  
  // États
  const [activeTab, setActiveTab] = useState<'wheel' | 'prizes' | 'history'>('wheel');
  const [balance, setBalance] = useState<SpinBalance | null>(null);
  const [activePrizes, setActivePrizes] = useState<Prize[]>([]);
  const [lastSpinResult, setLastSpinResult] = useState<SpinResult | null>(null);

  // Charger les données initiales
  const loadInitialData = useCallback(async () => {
    try {
      const [balanceData, prizesData] = await Promise.all([
        SpinService.getSpinBalance(),
        PrizeService.getActivePrizes()
      ]);
      
      setBalance(balanceData);
      setActivePrizes(prizesData);
    } catch (err: any) {
      console.error('Error loading initial data:', err);
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les données du jeu'
      });
    }
  }, [addToast]);

  // Charger les données au montage
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Gérer la fin d'un spin
  const handleSpinComplete = useCallback((result: SpinResult) => {
    setLastSpinResult(result);
    
    // Mettre à jour le solde
    setBalance(result.balance);
    
    // Afficher le résultat
    if (result.success) {
      if (result.spin.is_winning && result.prize) {
        addToast({
          type: 'success',
          title: '🎉 Félicitations !',
          message: `Vous avez gagné : ${result.prize.name} !`
        });
        
        // Basculer vers l'onglet des prix si on a gagné
        setTimeout(() => {
          setActiveTab('prizes');
        }, 2000);
      } else {
        addToast({
          type: 'info',
          title: 'Pas de chance cette fois',
          message: 'Réessayez lors du prochain spin !'
        });
      }
    }
  }, [addToast]);

  // Rafraîchir les données
  const handleRefresh = () => {
    loadInitialData();
  };

  const tabs = [
    { id: 'wheel', label: 'Roue', icon: '🎰' },
    { id: 'prizes', label: 'Mes Prix', icon: '🎁' },
    { id: 'history', label: 'Historique', icon: '📊' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'wheel' | 'prizes' | 'history')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Informations du solde */}
        {balance && (
          <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-orange-800">
                  Solde de Spins
                </h3>
                <p className="text-2xl font-bold text-orange-600">
                  {balance.available_spins} spins disponibles
                </p>
                <p className="text-sm text-orange-700">
                  Total gagnés: {balance.total_spins_earned} | 
                  Total utilisés: {balance.total_spins_used}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                className="text-orange-600 hover:text-orange-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contenu des onglets */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'wheel' && (
          <SpinWheel
            campaignId={campaignId}
            onSpinComplete={handleSpinComplete}
          />
        )}
        
        {activeTab === 'prizes' && (
          <MyPrizes />
        )}
        
        {activeTab === 'history' && (
          <SpinHistory limit={10} />
        )}
      </motion.div>

      {/* Résultat du dernier spin */}
      {lastSpinResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Résultat du dernier spin
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Statut</p>
              <p className={`font-semibold ${
                lastSpinResult.spin.is_winning ? 'text-green-600' : 'text-gray-600'
              }`}>
                {lastSpinResult.spin.is_winning ? '🎉 Gagné !' : '😔 Perdu'}
              </p>
            </div>
            {lastSpinResult.prize && (
              <div>
                <p className="text-sm text-gray-600">Prix gagné</p>
                <p className="font-semibold text-orange-600">
                  {lastSpinResult.prize.name}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold text-gray-800">
                {new Date(lastSpinResult.spin.spin_date).toLocaleString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Spins restants</p>
              <p className="font-semibold text-blue-600">
                {lastSpinResult.balance.available_spins}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WheelGame;
