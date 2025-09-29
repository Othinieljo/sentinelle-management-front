// Gestion des paiements - CRUD complet
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import { PaymentService, Payment, PaymentsResponse, UpdatePaymentStatusRequest, PaymentStats } from '@/lib/services/paymentService';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal/Modal';
import { useToast } from '@/hooks/useToast';

interface PaymentManagementProps {
  className?: string;
}

const PaymentManagement: React.FC<PaymentManagementProps> = ({ className }) => {
  const { addToast } = useToast();
  
  // États
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed' | 'cancelled'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  
  // États pour les modales
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);

  // Charger les paiements
  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };
      
      const response: PaymentsResponse = await PaymentService.getPayments(params);
      setPayments(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalPayments(response.pagination.total);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les paiements'
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, addToast]);

  // Charger les statistiques des paiements
  const loadPaymentStats = useCallback(async () => {
    try {
      const stats = await PaymentService.getPaymentStats();
      setPaymentStats(stats);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les statistiques'
      });
    }
  }, [addToast]);

  // Effet pour charger les paiements
  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // Modifier le statut d'un paiement
  const handleUpdatePaymentStatus = async (paymentId: string, newStatus: 'pending' | 'completed' | 'failed' | 'cancelled') => {
    try {
      await PaymentService.updatePaymentStatus(paymentId, { status: newStatus });
      addToast({
        type: 'success',
        title: 'Succès',
        message: 'Statut du paiement mis à jour'
      });
      loadPayments();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.message || 'Impossible de mettre à jour le statut'
      });
    }
  };

  // Ouvrir la modale de statistiques
  const openStatsModal = async () => {
    await loadPaymentStats();
    setShowStatsModal(true);
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
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
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtrer les paiements
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.user.phone_number.includes(searchTerm) ||
                         payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Paiements</h2>
          <p className="text-gray-600">Suivez et gérez tous les paiements</p>
        </div>
        <Button
          onClick={openStatsModal}
          variant="gradient"
          className="flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Statistiques
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Paiements</p>
                <p className="text-2xl font-bold text-gray-900">{totalPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Complétés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Échoués</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter(p => p.status === 'failed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Montant Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payments.reduce((sum, p) => sum + parseFloat(p.amount), 0).toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par nom, téléphone ou référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="completed">Complétés</option>
                <option value="failed">Échoués</option>
                <option value="cancelled">Annulés</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des paiements */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Paiements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredPayments.map((payment) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(payment.status)}
                        <h3 className="font-semibold text-gray-900">
                          {payment.user.first_name} {payment.user.last_name}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-4 h-4" />
                          {payment.reference}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {parseFloat(payment.amount).toLocaleString()} FCFA
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {payment.user.phone_number}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 sm:mt-0">
                      {payment.status === 'pending' && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleUpdatePaymentStatus(payment.id, 'completed')}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Valider
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleUpdatePaymentStatus(payment.id, 'failed')}
                            className="flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Rejeter
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Voir
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredPayments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun paiement trouvé
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="ghost"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Modale de statistiques */}
      <Modal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)}>
        <ModalHeader>
          <h3 className="text-lg font-semibold">Statistiques des Paiements</h3>
        </ModalHeader>
        <ModalBody>
          {paymentStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Total Paiements</h4>
                  <p className="text-2xl font-bold text-blue-600">{paymentStats.total_payments}</p>
                  <p className="text-sm text-blue-700">Montant: {paymentStats.total_amount} FCFA</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900">Complétés</h4>
                  <p className="text-2xl font-bold text-green-600">{paymentStats.completed_payments}</p>
                  <p className="text-sm text-green-700">Paiements réussis</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-900">En Attente</h4>
                  <p className="text-2xl font-bold text-yellow-600">{paymentStats.pending_payments}</p>
                  <p className="text-sm text-yellow-700">Paiements en cours</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-900">Échoués</h4>
                  <p className="text-2xl font-bold text-red-600">{paymentStats.failed_payments}</p>
                  <p className="text-sm text-red-700">Paiements échoués</p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Moyenne par Paiement</h4>
                <p className="text-xl font-bold text-gray-600">{paymentStats.average_payment} FCFA</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Spins Distribués</h4>
                <p className="text-xl font-bold text-purple-600">{paymentStats.total_spins_distributed}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowStatsModal(false)}>
            Fermer
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PaymentManagement;
