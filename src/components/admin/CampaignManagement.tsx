// Gestion des campagnes - CRUD complet
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Target,
  Calendar,
  DollarSign,
  Activity,
  TrendingUp,
  Users,
  AlertCircle,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { CampaignService, Campaign, CreateCampaignRequest, UpdateCampaignRequest, CampaignStats } from '@/lib/services/campaignService';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal/Modal';
import { useToast } from '@/hooks/useToast';

interface CampaignManagementProps {
  className?: string;
}

const CampaignManagement: React.FC<CampaignManagementProps> = ({ className }) => {
  const { addToast } = useToast();
  
  // États
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  
  // États pour les modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignStats, setCampaignStats] = useState<CampaignStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  
  // États pour les formulaires
  const [createForm, setCreateForm] = useState<CreateCampaignRequest>({
    name: '',
    description: '',
    contribution_per_user: 0,
    start_date: '',
    end_date: '',
    spins_per_amount: 1,
    amount_per_spin: 0
  });
  const [editForm, setEditForm] = useState<UpdateCampaignRequest>({});

  // Charger les campagnes
  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        is_active: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
      };
      
      const campaignsData = await CampaignService.getCampaigns(params);
      console.log('Campaigns response:', campaignsData); // Debug
      
      // Vérifier que la réponse a la structure attendue
      if (campaignsData && campaignsData.data && Array.isArray(campaignsData.data)) {
        setCampaigns(campaignsData.data);
        setTotalPages(campaignsData.pagination?.totalPages || 1);
        setTotalCampaigns(campaignsData.pagination?.total || 0);
      } else {
        // Fallback si la structure n'est pas correcte
        setCampaigns([]);
        setTotalPages(1);
        setTotalCampaigns(0);
      }
    } catch (error: any) {
      console.error('Error loading campaigns:', error);
      
      // Données par défaut en cas d'erreur
      setCampaigns([]);
      setTotalPages(1);
      setTotalCampaigns(0);
      
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les campagnes'
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, addToast]);

  // Charger les statistiques d'une campagne
  const loadCampaignStats = useCallback(async (campaignId: string) => {
    setLoadingStats(true);
    try {
      const stats = await CampaignService.getCampaignStats(campaignId);
      setCampaignStats(stats);
    } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger les statistiques'
        });
    } finally {
      setLoadingStats(false);
    }
  }, [addToast]);

  // Effet pour charger les campagnes
  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  // Créer une campagne
  const handleCreateCampaign = async () => {
    try {
      await CampaignService.createCampaign(createForm);
      addToast({
        type: 'success',
        title: 'Succès',
        message: 'Campagne créée avec succès'
      });
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        description: '',
        contribution_per_user: 0,
        start_date: '',
        end_date: '',
        spins_per_amount: 1,
        amount_per_spin: 0
      });
      loadCampaigns();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.message || 'Impossible de créer la campagne'
      });
    }
  };

  // Modifier une campagne
  const handleUpdateCampaign = async () => {
    if (!selectedCampaign) return;
    
    try {
      await CampaignService.updateCampaign(selectedCampaign.id, editForm);
      addToast({
        type: 'success',
        title: 'Succès',
        message: 'Campagne modifiée avec succès'
      });
      setShowEditModal(false);
      setEditForm({});
      loadCampaigns();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.message || 'Impossible de modifier la campagne'
      });
    }
  };

  // Supprimer une campagne
  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return;
    
    try {
      await CampaignService.deleteCampaign(selectedCampaign.id);
      addToast({
        type: 'success',
        title: 'Succès',
        message: 'Campagne supprimée avec succès'
      });
      setShowDeleteModal(false);
      setSelectedCampaign(null);
      loadCampaigns();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.message || 'Impossible de supprimer la campagne'
      });
    }
  };

  // Fonction pour convertir une date ISO en format datetime-local
  const formatDateForInput = (isoDate: string) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    // Convertir en format YYYY-MM-DDTHH:MM pour datetime-local
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Ouvrir la modale d'édition
  const openEditModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setEditForm({
      name: campaign.name,
      description: campaign.description,
      contribution_per_user: parseFloat(campaign.contribution_per_user),
      spins_per_amount: campaign.spins_per_amount,
      amount_per_spin: parseFloat(campaign.amount_per_spin),
      start_date: formatDateForInput(campaign.start_date),
      end_date: formatDateForInput(campaign.end_date),
      is_active: campaign.is_active
    });
    setShowEditModal(true);
  };

  // Ouvrir la modale de suppression
  const openDeleteModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowDeleteModal(true);
  };

  // Ouvrir la modale de statistiques
  const openStatsModal = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setCampaignStats(null); // Réinitialiser les anciennes données
    setShowStatsModal(true);
    await loadCampaignStats(campaign.id);
  };

  // Obtenir l'icône du statut de paiement
  const getPaymentStatusIcon = (status: string) => {
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

  // Obtenir la couleur du statut de paiement
  const getPaymentStatusColor = (status: string) => {
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

  // Filtrer les campagnes
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && campaign.is_active) ||
                         (statusFilter === 'inactive' && !campaign.is_active);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Campagnes</h2>
          <p className="text-gray-600">Créez et gérez les campagnes de cotisation</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="gradient"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Campagne
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Campagnes</p>
                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Actives</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.filter(c => c.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Objectif Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.reduce((sum, c) => sum + parseFloat(c.target_amount), 0).toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Spins Moyens</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.length > 0 
                    ? (campaigns.reduce((sum, c) => sum + c.spins_per_amount, 0) / campaigns.length).toFixed(1)
                    : '0'
                  }
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
                placeholder="Rechercher par nom ou description..."
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
                <option value="active">Actives</option>
                <option value="inactive">Inactives</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des campagnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredCampaigns.map((campaign) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      campaign.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{campaign.description}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">Objectif:</span>
                      </div>
                      <span className="font-medium">{parseFloat(campaign.target_amount).toLocaleString()} FCFA</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">Contribution par utilisateur:</span>
                      </div>
                      <span className="font-medium">{parseFloat(campaign.contribution_per_user).toLocaleString()} FCFA</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">Spins par FCFA:</span>
                      </div>
                      <span className="font-medium">{campaign.spins_per_amount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">Montant par spin:</span>
                      </div>
                      <span className="font-medium">{parseFloat(campaign.amount_per_spin).toLocaleString()} FCFA</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">Début:</span>
                      </div>
                      <span className="font-medium">
                        {new Date(campaign.start_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">Fin:</span>
                      </div>
                      <span className="font-medium">
                        {new Date(campaign.end_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openStatsModal(campaign)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Stats
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(campaign)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openDeleteModal(campaign)}
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

      {filteredCampaigns.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Aucune campagne trouvée</p>
        </div>
      )}

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

      {/* Modale de création */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader>
          <h3 className="text-lg font-semibold">Créer une Campagne</h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Nom de la campagne"
              value={createForm.name}
              onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Campagne Septembre 2025"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de la campagne..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Contribution par utilisateur (FCFA)"
                type="number"
                value={createForm.contribution_per_user}
                onChange={(e) => setCreateForm(prev => ({ ...prev, contribution_per_user: parseFloat(e.target.value) || 0 }))}
                placeholder="10000"
              />
              <Input
                label="Spins par FCFA"
                type="number"
                step="0.1"
                value={createForm.spins_per_amount}
                onChange={(e) => setCreateForm(prev => ({ ...prev, spins_per_amount: parseFloat(e.target.value) || 1 }))}
                placeholder="1.0"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Montant par spin (FCFA)"
                type="number"
                value={createForm.amount_per_spin}
                onChange={(e) => setCreateForm(prev => ({ ...prev, amount_per_spin: parseFloat(e.target.value) || 0 }))}
                placeholder="50"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date de début"
                type="datetime-local"
                value={createForm.start_date}
                onChange={(e) => setCreateForm(prev => ({ ...prev, start_date: e.target.value }))}
              />
              <Input
                label="Date de fin"
                type="datetime-local"
                value={createForm.end_date}
                onChange={(e) => setCreateForm(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
            Annuler
          </Button>
          <Button variant="gradient" onClick={handleCreateCampaign}>
            Créer
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modale d'édition */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        <ModalHeader>
          <h3 className="text-lg font-semibold">Modifier la Campagne</h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Nom de la campagne"
              value={editForm.name || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Campagne Septembre 2025"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={editForm.description || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de la campagne..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Contribution par utilisateur (FCFA)"
                type="number"
                value={editForm.contribution_per_user || 0}
                onChange={(e) => setEditForm(prev => ({ ...prev, contribution_per_user: parseFloat(e.target.value) || 0 }))}
                placeholder="10000"
              />
              <Input
                label="Spins par FCFA"
                type="number"
                step="0.1"
                value={editForm.spins_per_amount || 1}
                onChange={(e) => setEditForm(prev => ({ ...prev, spins_per_amount: parseFloat(e.target.value) || 1 }))}
                placeholder="1.0"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Montant par spin (FCFA)"
                type="number"
                value={editForm.amount_per_spin || 0}
                onChange={(e) => setEditForm(prev => ({ ...prev, amount_per_spin: parseFloat(e.target.value) || 0 }))}
                placeholder="50"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date de début"
                type="datetime-local"
                value={editForm.start_date || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, start_date: e.target.value }))}
              />
              <Input
                label="Date de fin"
                type="datetime-local"
                value={editForm.end_date || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active_edit"
                checked={editForm.is_active || false}
                onChange={(e) => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active_edit" className="ml-2 block text-sm text-gray-900">
                Campagne active
              </label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowEditModal(false)}>
            Annuler
          </Button>
          <Button variant="gradient" onClick={handleUpdateCampaign}>
            Modifier
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modale de statistiques */}
      <Modal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)}>
        <ModalHeader>
          <h3 className="text-lg font-semibold">
            Statistiques - {selectedCampaign?.name}
          </h3>
        </ModalHeader>
        <ModalBody>
          {loadingStats ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                <div className="animate-ping absolute top-0 left-0 h-12 w-12 border-2 border-orange-200 rounded-full"></div>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700">Chargement des statistiques...</p>
                <p className="text-sm text-gray-500">Récupération des données pour {selectedCampaign?.name}</p>
              </div>
            </div>
          ) : campaignStats ? (
            <div className="space-y-4">
              {/* Informations de la campagne */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Informations Campagne</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Nom:</span> {campaignStats.campaign.name}</div>
                  <div><span className="font-medium">Statut:</span> {campaignStats.campaign.is_active ? 'Active' : 'Inactive'}</div>
                  <div><span className="font-medium">Objectif:</span> {parseFloat(campaignStats.campaign.target_amount).toLocaleString()} FCFA</div>
                  <div><span className="font-medium">Date de début:</span> {new Date(campaignStats.campaign.start_date).toLocaleDateString('fr-FR')}</div>
                  <div><span className="font-medium">Date de fin:</span> {new Date(campaignStats.campaign.end_date).toLocaleDateString()}</div>
                  <div><span className="font-medium">Créée le:</span> {new Date(campaignStats.campaign.created_at).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>

              {/* Statistiques générales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Participants</h4>
                  <p className="text-2xl font-bold text-blue-600">{campaignStats.stats.total_participants}</p>
                  <p className="text-sm text-blue-700">Total participants</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900">Montant Collecté</h4>
                  <p className="text-2xl font-bold text-green-600">{campaignStats.stats.total_collected.toLocaleString()} FCFA</p>
                  <p className="text-sm text-green-700">Contributions reçues</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900">Montant Restant</h4>
                  <p className="text-2xl font-bold text-purple-600">{campaignStats.stats.remaining_amount.toLocaleString()} FCFA</p>
                  <p className="text-sm text-purple-700">Objectif à atteindre</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-900">Jours Restants</h4>
                  <p className="text-2xl font-bold text-orange-600">{campaignStats.stats.days_remaining}</p>
                  <p className="text-sm text-orange-700">Temps restant</p>
                </div>
              </div>

              {/* Statistiques de paiements */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900">Total Paiements</h4>
                  <p className="text-2xl font-bold text-gray-600">{campaignStats.stats.total_payments}</p>
                  <p className="text-sm text-gray-700">Tous paiements</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900">Complétés</h4>
                  <p className="text-2xl font-bold text-green-600">{campaignStats.stats.completed_payments}</p>
                  <p className="text-sm text-green-700">Paiements réussis</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-900">En Attente</h4>
                  <p className="text-2xl font-bold text-yellow-600">{campaignStats.stats.pending_payments}</p>
                  <p className="text-sm text-yellow-700">En traitement</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-900">Échoués</h4>
                  <p className="text-2xl font-bold text-red-600">{campaignStats.stats.failed_payments}</p>
                  <p className="text-sm text-red-700">Paiements échoués</p>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-900">Progression</h4>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div 
                    className="bg-orange-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${campaignStats.stats.progress_percentage}%` }}
                  ></div>
                </div>
                <p className="text-xl font-bold text-yellow-600">{campaignStats.stats.progress_percentage}%</p>
                <p className="text-sm text-yellow-700">de l'objectif atteint</p>
              </div>

              {/* Paiements récents */}
              {campaignStats.recent_payments && campaignStats.recent_payments.length > 0 && (
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Paiements Récents</h4>
                  <div className="space-y-3">
                    {campaignStats.recent_payments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getPaymentStatusIcon(payment.status)}
                          <div>
                            <p className="font-medium text-gray-900">{payment.user_name}</p>
                            <p className="text-sm text-gray-600">{payment.user_phone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{parseFloat(payment.amount).toLocaleString()} FCFA</p>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {campaignStats.recent_payments.length > 5 && (
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      +{campaignStats.recent_payments.length - 5} autres paiements
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700">Aucune donnée disponible</p>
                <p className="text-sm text-gray-500">Impossible de charger les statistiques pour cette campagne</p>
              </div>
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
              Êtes-vous sûr de vouloir supprimer la campagne{' '}
              <span className="font-semibold">
                {selectedCampaign?.name}
              </span> ?
            </p>
            <p className="text-sm text-gray-500">
              Cette action est irréversible et supprimera définitivement toutes les données de cette campagne.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteCampaign}>
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer définitivement
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CampaignManagement;
