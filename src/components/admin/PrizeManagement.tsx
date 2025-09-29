// Gestion des lots - CRUD complet
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Gift,
  Package,
  DollarSign,
  Percent,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  TrendingUp
} from 'lucide-react';
import { PrizeService, Prize, CreatePrizeRequest, UpdatePrizeRequest, UpdateStockRequest, PrizeStats } from '@/lib/services/prizeService';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal/Modal';
import { useToast } from '@/hooks/useToast';

interface PrizeManagementProps {
  className?: string;
}

const PrizeManagement: React.FC<PrizeManagementProps> = ({ className }) => {
  const { addToast } = useToast();
  
  // États
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPrizes, setTotalPrizes] = useState(0);
  
  // États pour les modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [prizeStats, setPrizeStats] = useState<PrizeStats | null>(null);
  
  // États pour les formulaires
  const [createForm, setCreateForm] = useState<CreatePrizeRequest>({
    name: '',
    description: '',
    probability_weight: 10,
    stock_total: 1,
    category: '',
    is_active: true
  });
  const [editForm, setEditForm] = useState<UpdatePrizeRequest>({});
  const [stockForm, setStockForm] = useState<UpdateStockRequest>({ amount: 0 });

  // Charger les lots
  const loadPrizes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        is_active: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
      };
      
      const prizesData = await PrizeService.getPrizes(params);
      console.log('Prizes response:', prizesData); // Debug
      
      // Vérifier que la réponse a la structure attendue
      if (prizesData && prizesData.data && Array.isArray(prizesData.data)) {
        setPrizes(prizesData.data);
        setTotalPages(prizesData.totalPages || 1);
        setTotalPrizes(prizesData.total || 0);
      } else {
        // Fallback si la structure n'est pas correcte
        setPrizes([]);
        setTotalPages(1);
        setTotalPrizes(0);
      }
    } catch (error: any) {
      console.error('Error loading prizes:', error);
      
      // Données par défaut en cas d'erreur
      setPrizes([]);
      setTotalPages(1);
      setTotalPrizes(0);
      
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les lots'
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, categoryFilter, statusFilter, addToast]);

  // Charger les statistiques des lots
  const loadPrizeStats = useCallback(async () => {
    try {
      const stats = await PrizeService.getPrizeStats();
      setPrizeStats(stats);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les statistiques'
      });
    }
  }, [addToast]);

  // Effet pour charger les lots
  useEffect(() => {
    loadPrizes();
  }, [loadPrizes]);

  // Créer un lot
  const handleCreatePrize = async () => {
    try {
      await PrizeService.createPrize(createForm);
      addToast({
        type: 'success',
        title: 'Succès',
        message: 'Lot créé avec succès'
      });
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        description: '',
        probability_weight: 10,
        stock_total: 1,
        category: '',
        is_active: true
      });
      loadPrizes();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.message || 'Impossible de créer le lot'
      });
    }
  };

  // Modifier un lot
  const handleUpdatePrize = async () => {
    if (!selectedPrize) return;
    
    try {
      await PrizeService.updatePrize(selectedPrize.id, editForm);
      addToast({
        type: 'success',
        title: 'Succès',
        message: 'Lot modifié avec succès'
      });
      setShowEditModal(false);
      setEditForm({});
      loadPrizes();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.message || 'Impossible de modifier le lot'
      });
    }
  };

  // Mettre à jour le stock
  const handleUpdateStock = async () => {
    if (!selectedPrize) return;
    
    try {
      await PrizeService.updateStock(selectedPrize.id, stockForm);
      addToast({
        type: 'success',
        title: 'Succès',
        message: 'Stock mis à jour avec succès'
      });
      setShowStockModal(false);
      setStockForm({ amount: 0 });
      loadPrizes();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.message || 'Impossible de mettre à jour le stock'
      });
    }
  };

  // Activer/Désactiver un lot
  const handleTogglePrize = async (prizeId: string) => {
    try {
      await PrizeService.togglePrize(prizeId);
      addToast({
        type: 'success',
        title: 'Succès',
        message: 'Statut du lot mis à jour'
      });
      loadPrizes();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.message || 'Impossible de modifier le statut'
      });
    }
  };

  // Supprimer un lot
  const handleDeletePrize = async () => {
    if (!selectedPrize) return;
    
    try {
      await PrizeService.deletePrize(selectedPrize.id);
      addToast({
        type: 'success',
        title: 'Succès',
        message: 'Lot supprimé avec succès'
      });
      setShowDeleteModal(false);
      setSelectedPrize(null);
      loadPrizes();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.message || 'Impossible de supprimer le lot'
      });
    }
  };

  // Ouvrir la modale d'édition
  const openEditModal = (prize: Prize) => {
    setSelectedPrize(prize);
    setEditForm({
      name: prize.name,
      description: prize.description,
      probability_weight: prize.probability_weight,
      category: prize.category,
      is_active: prize.is_active
    });
    setShowEditModal(true);
  };

  // Ouvrir la modale de stock
  const openStockModal = (prize: Prize) => {
    setSelectedPrize(prize);
    setStockForm({ amount: 0 });
    setShowStockModal(true);
  };

  // Ouvrir la modale de suppression
  const openDeleteModal = (prize: Prize) => {
    setSelectedPrize(prize);
    setShowDeleteModal(true);
  };

  // Ouvrir la modale de statistiques
  const openStatsModal = async () => {
    await loadPrizeStats();
    setShowStatsModal(true);
  };

  // Obtenir les catégories uniques
  console.log('Prizes:', prizes);
  const categories = Array.from(new Set(prizes.map(p => p.category)));

  // Filtrer les lots
  const filteredPrizes = prizes.filter(prize => {
    const matchesSearch = prize.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prize.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prize.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || prize.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && prize.is_active) ||
                         (statusFilter === 'inactive' && !prize.is_active);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Lots</h2>
          <p className="text-gray-600">Créez et gérez les lots de la roue</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={openStatsModal}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Statistiques
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="gradient"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau Lot
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Gift className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Lots</p>
                <p className="text-2xl font-bold text-gray-900">{totalPrizes}</p>
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
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prizes.filter(p => p.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Stock Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prizes.reduce((sum, p) => sum + p.stock_total, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Valeur Totale</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prizes.reduce((sum, p) => sum + parseFloat(p.value), 0).toLocaleString()} FCFA
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
                placeholder="Rechercher par nom, description ou catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des lots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredPrizes.map((prize) => (
            <motion.div
              key={prize.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{prize.name}</CardTitle>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        prize.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {prize.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      {prize.stock_remaining <= 5 && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          Stock faible
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {prize.image_url && (
                    <div className="mb-4">
                      <img 
                        src={prize.image_url} 
                        alt={prize.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <p className="text-gray-600 mb-4">{prize.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">Valeur:</span>
                      </div>
                      <span className="font-medium">{parseFloat(prize.value).toLocaleString()} FCFA</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">Poids:</span>
                      </div>
                      <span className="font-medium">{prize.probability_weight}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">Stock:</span>
                      </div>
                      <span className="font-medium">
                        {prize.stock_remaining}/{prize.stock_total}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Catégorie:</span>
                      <span className="font-medium">{prize.category}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openStockModal(prize)}
                      className="flex items-center gap-1"
                    >
                      <Package className="w-4 h-4" />
                      Stock
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(prize)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePrize(prize.id)}
                      className="flex items-center gap-1"
                    >
                      {prize.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      {prize.is_active ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openDeleteModal(prize)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredPrizes.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <Gift className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Aucun lot trouvé</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 p-4 border-t border-gray-200">
          <Button 
            onClick={() => setCurrentPage(currentPage - 1)} 
            disabled={currentPage === 1}
            variant="secondary"
            size="sm"
          >
            Précédent
          </Button>
          <span className="text-sm text-gray-700">Page {currentPage} sur {totalPages}</span>
          <Button 
            onClick={() => setCurrentPage(currentPage + 1)} 
            disabled={currentPage === totalPages}
            variant="secondary"
            size="sm"
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Modale de création */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader>
          <h3 className="text-lg font-semibold">Créer un Lot</h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Nom du lot"
              value={createForm.name}
              onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="iPhone 15 Pro"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du lot..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={3}
              />
            </div>
            
            <Input
              label="Poids de probabilité"
              type="number"
              value={createForm.probability_weight}
              onChange={(e) => setCreateForm(prev => ({ ...prev, probability_weight: parseInt(e.target.value) || 10 }))}
              placeholder="10"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Stock initial"
                type="number"
                value={createForm.stock_total}
                onChange={(e) => setCreateForm(prev => ({ ...prev, stock_total: parseInt(e.target.value) || 1 }))}
                placeholder="5"
              />
              <Input
                label="Catégorie"
                value={createForm.category}
                onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Électronique"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active_create"
                checked={createForm.is_active}
                onChange={(e) => setCreateForm(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active_create" className="ml-2 block text-sm text-gray-900">
                Lot actif
              </label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
            Annuler
          </Button>
          <Button variant="gradient" onClick={handleCreatePrize}>
            Créer
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modale d'édition */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        <ModalHeader>
          <h3 className="text-lg font-semibold">Modifier le Lot</h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Nom du lot"
              value={editForm.name || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="iPhone 15 Pro"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={editForm.description || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du lot..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={3}
              />
            </div>
            
            <Input
              label="Poids de probabilité"
              type="number"
              value={editForm.probability_weight || 10}
              onChange={(e) => setEditForm(prev => ({ ...prev, probability_weight: parseInt(e.target.value) || 10 }))}
              placeholder="10"
            />
            
            <Input
              label="Catégorie"
              value={editForm.category || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Électronique"
            />
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active_edit"
                checked={editForm.is_active || false}
                onChange={(e) => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active_edit" className="ml-2 block text-sm text-gray-900">
                Lot actif
              </label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowEditModal(false)}>
            Annuler
          </Button>
          <Button variant="gradient" onClick={handleUpdatePrize}>
            Modifier
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modale de stock */}
      <Modal isOpen={showStockModal} onClose={() => setShowStockModal(false)}>
        <ModalHeader>
          <h3 className="text-lg font-semibold">
            Gérer le Stock - {selectedPrize?.name}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Stock Actuel</h4>
              <p className="text-lg">
                <span className="font-bold">{selectedPrize?.stock_remaining}</span> / {selectedPrize?.stock_total} disponibles
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ajustement du stock
              </label>
              <Input
                type="number"
                value={stockForm.amount}
                onChange={(e) => setStockForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                placeholder="Entrez un nombre positif pour ajouter, négatif pour retirer"
              />
              <p className="text-sm text-gray-500 mt-1">
                • Nombre positif : ajoute au stock total et restant<br/>
                • Nombre négatif : retire seulement du stock restant<br/>
                • 0 : aucune modification
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowStockModal(false)}>
            Annuler
          </Button>
          <Button variant="gradient" onClick={handleUpdateStock}>
            Mettre à jour
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modale de statistiques */}
      <Modal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)}>
        <ModalHeader>
          <h3 className="text-lg font-semibold">Statistiques des Lots</h3>
        </ModalHeader>
        <ModalBody>
          {prizeStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Total Lots</h4>
                  <p className="text-2xl font-bold text-blue-600">{prizeStats.total_prizes}</p>
                  <p className="text-sm text-blue-700">{prizeStats.active_prizes} actifs</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900">Disponibles</h4>
                  <p className="text-2xl font-bold text-green-600">{prizeStats.available_prizes}</p>
                  <p className="text-sm text-green-700">Lots en stock</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900">Stock Total</h4>
                  <p className="text-2xl font-bold text-purple-600">{prizeStats.total_stock}</p>
                  <p className="text-sm text-purple-700">{prizeStats.remaining_stock} restants</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-900">Valeur Totale</h4>
                  <p className="text-2xl font-bold text-orange-600">{prizeStats.total_value} FCFA</p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Utilisation du Stock</h4>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${prizeStats.stock_usage_percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {prizeStats.stock_usage_percentage.toFixed(1)}% du stock utilisé
                </p>
              </div>
              
              {prizeStats.category_breakdown.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Répartition par Catégorie</h4>
                  <div className="space-y-2">
                    {prizeStats.category_breakdown.map((category, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{category.category}</span>
                        <div className="text-right">
                          <span className="text-orange-600 font-semibold">{category.count} lots</span>
                          <br/>
                          <span className="text-sm text-gray-600">{category.total_value} FCFA</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

      {/* Modale de confirmation de suppression */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader>
          <h3 className="text-lg font-semibold text-red-600">Confirmer la suppression</h3>
        </ModalHeader>
        <ModalBody>
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-gray-700 mb-2">
              Êtes-vous sûr de vouloir supprimer le lot{' '}
              <span className="font-semibold">
                {selectedPrize?.name}
              </span> ?
            </p>
            <p className="text-sm text-gray-500">
              Cette action est irréversible et supprimera définitivement toutes les données de ce lot.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeletePrize}>
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer définitivement
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PrizeManagement;
