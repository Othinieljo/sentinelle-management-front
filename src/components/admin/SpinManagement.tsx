'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  Gift, 
  Users, 
  Calendar, 
  Search, 
  Filter,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { SpinService, SpinHistoryItem, UserPrize, UserPrizesResponse } from '@/lib/services/spinService';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal/Modal';
import { useToast } from '@/hooks/useToast';

interface SpinManagementProps {
  className?: string;
}

const SpinManagement: React.FC<SpinManagementProps> = ({ className }) => {
  const { addToast } = useToast();
  
  // États
  const [spinHistory, setSpinHistory] = useState<SpinHistoryItem[]>([]);
  const [userPrizes, setUserPrizes] = useState<UserPrize[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'claimed' | 'delivered'>('all');
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<UserPrize | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPrizes, setTotalPrizes] = useState(0);

  // Charger les données
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Charger l'historique des spins (pour les admins, on peut charger plus)
      const historyData = await SpinService.getSpinHistory(50);
      console.log('History data:', historyData);
      setSpinHistory(historyData);
      
      // Charger tous les prix gagnés avec pagination
      const prizesResponse = await SpinService.getAllPrizes({
        page: currentPage,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      
      console.log('Prizes response:', prizesResponse);
      setUserPrizes(prizesResponse.data);
      setTotalPages(prizesResponse.totalPages);
      setTotalPrizes(prizesResponse.total);
    } catch (error: any) {
      console.error('Error loading spin data:', error);
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les données des spins'
      });
    } finally {
      setLoading(false);
    }
  }, [addToast, currentPage, statusFilter]);

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Gérer le changement de filtre de statut
  const handleStatusFilterChange = (status: 'all' | 'pending' | 'claimed' | 'delivered') => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset à la première page
  };

  // Livrer un prix
  const handleDeliverPrize = async () => {
    if (!selectedPrize) return;
    
    try {
      await SpinService.deliverPrize(selectedPrize.id, deliveryNotes);
      addToast({
        type: 'success',
        title: 'Succès',
        message: `Prix ${selectedPrize.prize.name} marqué comme livré`
      });
      
      // Mettre à jour la liste
      setUserPrizes(prevPrizes => 
        prevPrizes.map(prize => 
          prize.id === selectedPrize.id 
            ? { ...prize, status: 'delivered' as const, delivered_at: new Date().toISOString() }
            : prize
        )
      );
      
      setShowDeliverModal(false);
      setSelectedPrize(null);
      setDeliveryNotes('');
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.message || 'Impossible de livrer le prix'
      });
    }
  };

  // Ouvrir la modale de livraison
  const openDeliverModal = (prize: UserPrize) => {
    setSelectedPrize(prize);
    setShowDeliverModal(true);
  };

  // Statistiques
  const stats = {
    totalSpins: spinHistory.length,
    winningSpins: spinHistory.filter(spin => spin.is_winning).length,
    totalPrizes: totalPrizes,
    pendingPrizes: userPrizes.filter(prize => prize.status === 'pending').length,
    deliveredPrizes: userPrizes.filter(prize => prize.status === 'delivered').length,
  };

  // Filtrer les prix (recherche locale seulement, le filtre de statut est géré côté serveur)
  const filteredPrizes = userPrizes.filter(prize => {
    const matchesSearch = prize.prize.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prize.prize.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${prize.user.first_name} ${prize.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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

  return (
    <motion.div
      className={`space-y-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Spins</h2>
        <Button onClick={loadData} variant="secondary" className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RotateCcw className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Spins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSpins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <Gift className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Spins Gagnants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.winningSpins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Prix en Attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPrizes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Prix Livrés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.deliveredPrizes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:w-auto flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par nom de prix..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value as any)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="claimed">Réclamé</option>
                <option value="delivered">Livré</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des prix gagnés */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 mb-4">
            Prix Gagnés à Livrer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredPrizes.map((prize) => (
                  <motion.div
                    key={prize.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                      <div className="flex-shrink-0">
                        {prize.prize.image_url ? (
                          <img
                            src={prize.prize.image_url}
                            alt={prize.prize.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Gift className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{prize.prize.name}</p>
                        <p className="text-sm text-gray-600">{prize.prize.description}</p>
                        <p className="text-sm text-blue-600 font-medium">
                          Gagné par: {prize.user.first_name} {prize.user.last_name}
                        </p>
                        {prize.prize.value && (
                          <p className="text-sm text-orange-600 font-medium">
                            Valeur: {prize.prize.value} FCFA
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Gagné le {formatDate(prize.won_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(prize.status)}`}>
                        {getStatusIcon(prize.status)}
                        {getStatusText(prize.status)}
                      </div>
                      {prize.status === 'claimed' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openDeliverModal(prize)}
                          className="flex items-center gap-1"
                        >
                          <Truck className="w-4 h-4" />
                          Livrer
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {!loading && filteredPrizes.length === 0 && (
                <p className="text-center text-gray-500 py-8">Aucun prix trouvé.</p>
              )}
            </div>
          )}
          
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Page {currentPage} sur {totalPages} ({totalPrizes} prix au total)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modale de livraison */}
      <Modal isOpen={showDeliverModal} onClose={() => setShowDeliverModal(false)}>
        <ModalHeader>
          <h3 className="text-lg font-semibold text-green-600">Confirmer la livraison</h3>
        </ModalHeader>
        <ModalBody>
          {selectedPrize && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <Truck className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-700 mb-2">
                  Confirmer la livraison du prix{' '}
                  <span className="font-semibold">
                    {selectedPrize.prize.name}
                  </span>{' '}
                  à{' '}
                  <span className="font-semibold">
                    {selectedPrize.user.first_name} {selectedPrize.user.last_name}
                  </span> ?
                </p>
                <p className="text-sm text-gray-500">
                  Cette action marquera le prix comme livré définitivement.
                </p>
              </div>
              
              <div>
                <label htmlFor="delivery-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes de livraison (optionnel)
                </label>
                <textarea
                  id="delivery-notes"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Ajoutez des notes sur la livraison..."
                />
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDeliverModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleDeliverPrize}>
            <Truck className="w-4 h-4 mr-2" />
            Confirmer la livraison
          </Button>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
};

export default SpinManagement;
