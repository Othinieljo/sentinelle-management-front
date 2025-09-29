'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  Gift, 
  X, 
  Calendar, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { SpinService, SpinHistoryItem } from '@/lib/services/spinService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { useToast } from '@/hooks/useToast';

interface SpinHistoryProps {
  className?: string;
  limit?: number;
}

const SpinHistory: React.FC<SpinHistoryProps> = ({ 
  className = '', 
  limit = 20 
}) => {
  const { addToast } = useToast();
  
  // États
  const [history, setHistory] = useState<SpinHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger l'historique des spins
  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const historyData = await SpinService.getSpinHistory(limit);
      setHistory(historyData);
    } catch (err: any) {
      console.error('Error loading spin history:', err);
      setError('Erreur lors du chargement de l\'historique');
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger l\'historique des spins'
      });
    } finally {
      setLoading(false);
    }
  }, [limit, addToast]);

  // Charger l'historique au montage
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir l'icône du résultat
  const getResultIcon = (isWinning: boolean) => {
    return isWinning ? (
      <Gift className="w-4 h-4 text-green-500" />
    ) : (
      <X className="w-4 h-4 text-gray-400" />
    );
  };

  // Obtenir le texte du résultat
  const getResultText = (isWinning: boolean) => {
    return isWinning ? 'Gagné' : 'Perdu';
  };

  // Obtenir la couleur du résultat
  const getResultColor = (isWinning: boolean) => {
    return isWinning 
      ? 'text-green-600 bg-green-50 border-green-200' 
      : 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-3 text-gray-600">Chargement de l'historique...</span>
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
            <RotateCcw className="w-6 h-6 text-orange-500" />
            Historique des Spins
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadHistory}
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

        {/* Statistiques rapides */}
        {history.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">
                {history.filter(spin => spin.is_winning).length}
              </p>
              <p className="text-sm text-green-700">Gains</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-gray-600">
                {history.filter(spin => !spin.is_winning).length}
              </p>
              <p className="text-sm text-gray-700">Tentatives</p>
            </div>
          </div>
        )}

        {/* Liste de l'historique */}
        {history.length === 0 ? (
          <div className="text-center py-8">
            <RotateCcw className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Aucun historique
            </h3>
            <p className="text-gray-500">
              Lancez la roue pour commencer à jouer !
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {history.map((spin) => (
                <motion.div
                  key={spin.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Icône du résultat */}
                      <div className="flex-shrink-0">
                        {getResultIcon(spin.is_winning)}
                      </div>

                      {/* Informations du spin */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getResultColor(spin.is_winning)}`}>
                            {getResultText(spin.is_winning)}
                          </span>
                          {spin.campaign && (
                            <span className="text-xs text-gray-500">
                              • {spin.campaign.name}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(spin.spin_date)}
                        </div>
                      </div>
                    </div>

                    {/* Prix gagné */}
                    {spin.is_winning && spin.user_prize && (
                      <div className="flex items-center gap-2 text-sm">
                        <Gift className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700 font-medium">
                          {spin.user_prize.prize.name}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getResultColor(spin.user_prize.status === 'pending')}`}>
                          {spin.user_prize.status === 'pending' ? 'En attente' : 
                           spin.user_prize.status === 'claimed' ? 'Réclamé' : 'Livré'}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Bouton pour voir plus */}
        {history.length === limit && (
          <div className="text-center mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadHistory()}
              className="text-orange-600 hover:bg-orange-50"
            >
              Voir plus d'historique
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpinHistory;
