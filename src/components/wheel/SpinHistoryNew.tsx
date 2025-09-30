'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  DollarSign,
  Zap
} from 'lucide-react';
import { UserPayment } from '@/lib/services/memberService';

interface SpinHistoryProps {
  payments: UserPayment[];
}

const SpinHistory: React.FC<SpinHistoryProps> = ({ payments }) => {
  // Obtenir l'icône du statut
  const getStatusIcon = (status: string) => {
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

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir le texte du statut
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Complété';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Échoué';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  if (payments.length === 0) {
    return (
      <div className="text-center py-8">
        <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucun paiement
        </h3>
        <p className="text-gray-600">
          Vous n'avez pas encore effectué de paiement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Historique des Paiements
        </h3>
        <span className="text-sm text-gray-500">
          {payments.length} paiement{payments.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {payments.map((payment, index) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(payment.status)}
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Paiement #{payment.reference}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {payment.campaign.name}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                {getStatusText(payment.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Montant</p>
                  <p className="font-semibold text-gray-900">
                    {payment.amount.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Spins gagnés</p>
                  <p className="font-semibold text-gray-900">
                    {payment.spins_earned}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Statistiques rapides */}
      {/* <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Résumé</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total payé (FCFA)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {payments.reduce((sum, p) => sum + p.spins_earned, 0)}
            </p>
            <p className="text-sm text-gray-600">Spins gagnés</p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default SpinHistory;
