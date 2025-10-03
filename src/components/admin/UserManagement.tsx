// Gestion des utilisateurs - CRUD complet
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
  UserCheck, 
  UserX,
  Phone,
  Calendar,
  DollarSign,
  Users
} from 'lucide-react';
import { UserService, UsersResponse, CreateUserRequest, UpdateUserRequest, UserStats } from '@/lib/services/userService';
import { User } from '@/types/auth';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal/Modal';
import { useToast } from '@/hooks/useToast';

interface UserManagementProps {
  className?: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ className }) => {
  const { addToast } = useToast();
  
  // États
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'member'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // États pour les modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  
  // États pour les formulaires
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    phone_number: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'member',
    balance: '0'
  });
  const [editForm, setEditForm] = useState<UpdateUserRequest>({});

  // Charger les utilisateurs
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        is_active: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
      };
      
      const response: UsersResponse = await UserService.getUsers(params);
      console.log('Users response:', response); // Debug
      
      // Vérifier que la réponse a la structure attendue
      if (response && response.data && Array.isArray(response.data)) {
        setUsers(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalUsers(response.pagination?.total || 0);
      } else {
        // Fallback si la structure n'est pas correcte
        setUsers([]);
        setTotalPages(1);
        setTotalUsers(0);
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      
      // Données par défaut en cas d'erreur
      setUsers([]);
      setTotalPages(1);
      setTotalUsers(0);
      
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les utilisateurs'
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, roleFilter, statusFilter, addToast]);

  // Charger les statistiques d'un utilisateur
  const loadUserStats = useCallback(async (userId: string) => {
    try {
      const stats = await UserService.getUserStats(userId);
      setUserStats(stats);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les statistiques'
      });
    }
  }, [addToast]);

  // Effet pour charger les utilisateurs
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Créer un utilisateur
  const handleCreateUser = async () => {
    try {
      await UserService.createUser(createForm);
      addToast({
        type: 'success',
        title: 'Succès',
        message: 'Utilisateur créé avec succès'
      });
      setShowCreateModal(false);
      setCreateForm({
        phone_number: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'member',
        balance: '0'
      });
      loadUsers();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.message || 'Impossible de créer l\'utilisateur'
      });
    }
  };

  // Modifier un utilisateur
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      await UserService.updateUser(selectedUser.id, editForm);
      addToast({
        type: 'success',
        title: 'Succès',
        message: 'Utilisateur modifié avec succès'
      });
      setShowEditModal(false);
      setEditForm({});
      loadUsers();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.message || 'Impossible de modifier l\'utilisateur'
      });
    }
  };

  // Ouvrir la modale de confirmation de suppression
  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await UserService.deleteUser(selectedUser.id);
      addToast({
        type: 'success',
        title: 'Succès',
        message: `Utilisateur ${selectedUser.first_name} supprimé avec succès`
      });
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.message || 'Impossible de supprimer l\'utilisateur'
      });
    }
  };

  // Ouvrir la modale d'édition
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active
    });
    setShowEditModal(true);
  };

  // Ouvrir la modale de statistiques
  const openStatsModal = async (user: User) => {
    setSelectedUser(user);
    await loadUserStats(user.id);
    setShowStatsModal(true);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
          <p className="text-gray-600">Gérez les utilisateurs de la plateforme</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="gradient"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvel Utilisateur
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users?.filter(u => u.is_active).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Administrateurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users?.filter(u => u.role === 'admin').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Membres</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users?.filter(u => u.role === 'member').length || 0}
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
                placeholder="Rechercher par nom ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Tous les rôles</option>
                <option value="admin">Administrateurs</option>
                <option value="member">Membres</option>
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

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {users?.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                        <h3 className="font-semibold text-gray-900">
                          {user.first_name} {user.last_name}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'Membre'}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {user.phone_number}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {user.balance} FCFA
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 sm:mt-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openStatsModal(user)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Stats
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(user)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => openDeleteModal(user)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {users.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun utilisateur trouvé
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
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
            Page {currentPage} sur {totalPages || 1}
          </span>
          <Button
            variant="ghost"
            onClick={() => setCurrentPage(prev => Math.min(totalPages || 1, prev + 1))}
            disabled={currentPage === (totalPages || 1)}
          >
            Suivant
          </Button>
        </div>
      </div>

      {/* Modale de création */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader>
          <h3 className="text-lg font-semibold">Créer un Utilisateur</h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Prénom"
                value={createForm.first_name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="Prénom"
              />
              <Input
                label="Nom"
                value={createForm.last_name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Nom"
              />
            </div>
            <Input
              label="Numéro de téléphone"
              value={createForm.phone_number}
              onChange={(e) => setCreateForm(prev => ({ ...prev, phone_number: e.target.value }))}
              placeholder="0789123456"
            />
            <Input
              label="Mot de passe"
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Mot de passe"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value as 'admin' | 'member' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="member">Membre</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
            Annuler
          </Button>
          <Button variant="gradient" onClick={handleCreateUser}>
            Créer
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modale d'édition */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        <ModalHeader>
          <h3 className="text-lg font-semibold">Modifier l'Utilisateur</h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Prénom"
                value={editForm.first_name || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="Prénom"
              />
              <Input
                label="Nom"
                value={editForm.last_name || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Nom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
              <select
                value={editForm.role || 'member'}
                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as 'admin' | 'member' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="member">Membre</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={editForm.is_active || false}
                onChange={(e) => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Utilisateur actif
              </label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowEditModal(false)}>
            Annuler
          </Button>
          <Button variant="gradient" onClick={handleUpdateUser}>
            Modifier
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modale de statistiques */}
      <Modal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)}>
        <ModalHeader>
          <h3 className="text-lg font-semibold">
            Statistiques - {selectedUser?.first_name} {selectedUser?.last_name}
          </h3>
        </ModalHeader>
        <ModalBody>
          {userStats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">Paiements</h4>
                <p className="text-2xl font-bold text-blue-600">{userStats.total_payments}</p>
                <p className="text-sm text-blue-700">Total: {userStats.total_amount} FCFA</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900">Spins</h4>
                <p className="text-2xl font-bold text-green-600">{userStats.total_spins}</p>
                <p className="text-sm text-green-700">Spins utilisés</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900">Prix Gagnés</h4>
                <p className="text-2xl font-bold text-purple-600">{userStats.total_prizes_won}</p>
                <p className="text-sm text-purple-700">Prix remportés</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-900">Dernière Activité</h4>
                <p className="text-sm text-orange-700">
                  Paiement: {new Date(userStats.last_payment).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-sm text-orange-700">
                  Spin: {new Date(userStats.last_spin).toLocaleDateString('fr-FR')}
                </p>
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
              Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
              <span className="font-semibold">
                {selectedUser?.first_name} {selectedUser?.last_name}
              </span> ?
            </p>
            <p className="text-sm text-gray-500">
              Cette action est irréversible et supprimera définitivement toutes les données de cet utilisateur.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer définitivement
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default UserManagement;
