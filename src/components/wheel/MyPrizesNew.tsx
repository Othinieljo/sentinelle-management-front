'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Gift, 
  Clock, 
  CheckCircle, 
  Calendar,
  Trophy,
  Star,
  Package
} from 'lucide-react';
import { UserPrize } from '@/lib/services/memberService';

interface MyPrizesProps {
  prizes: UserPrize[];
}

const MyPrizes: React.FC<MyPrizesProps> = ({ prizes }) => {
  // Obtenir l'icône du statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'claimed':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'claimed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir le texte du statut
  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Livré';
      case 'claimed':
        return 'Réclamé';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  };

  if (prizes.length === 0) {
    return (
      <div className="text-center py-8">
        <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucun gain
        </h3>
        <p className="text-gray-600">
          Vous n'avez pas encore gagné de prix.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Mes Gains
        </h3>
        <span className="text-sm text-gray-500">
          {prizes.length} gain{prizes.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {prizes.map((prize, index) => (
          <motion.div
            key={prize.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(prize.status)}
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {prize.prize.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {prize.prize.description}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(prize.status)}`}>
                {getStatusText(prize.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Catégorie</p>
                  <p className="font-semibold text-gray-900">
                    {prize.prize.category}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Valeur</p>
                  <p className="font-semibold text-gray-900">
                    {prize.prize.value ? `${prize.prize.value.toLocaleString()} FCFA` : 'Non définie'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Gagné le {new Date(prize.spin_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {/* <div className="text-xs text-gray-500">
                  {prize.campaign.name}
                </div> */}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Statistiques rapides */}
      <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Résumé</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {prizes.filter(p => p.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-600">En attente</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {prizes.filter(p => p.status === 'claimed').length}
            </p>
            <p className="text-sm text-gray-600">Réclamés</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {prizes.filter(p => p.status === 'delivered').length}
            </p>
            <p className="text-sm text-gray-600">Livrés</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPrizes;
