import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import adminService from '../services/adminService';
import AdminNavbar from '../components/AdminNavbar';
import AdminStats from '../components/AdminStats';
import UsersTable from '../components/UsersTable';
import UserFormModal from '../components/UserFormModal';
import ConfirmModal from '../components/ConfirmModal';
import { useApp } from '../contexts/AppContext';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { actions, state } = useApp();
  const currentUser = state.user;
  
  // États
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // États des modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [actionUser, setActionUser] = useState(null);
  const [actionType, setActionType] = useState('');
  
  // États des filtres
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Vérifier les droits admin au chargement
  useEffect(() => {
    const checkAdminAccess = async () => {
      const isAdmin = await adminService.checkAdminStatus();
      if (!isAdmin) {
        actions.showNotification('error', 'Accès refusé. Droits administrateur requis.');
        navigate('/dashboard');
        return;
      }
      loadData();
    };

    checkAdminAccess();
  }, [navigate, refreshTrigger, actions]);

  // Afficher les notifications après redirection
  useEffect(() => {
    const storedNotification = sessionStorage.getItem('adminNotification');
    if (storedNotification) {
      try {
        const { message, type } = JSON.parse(storedNotification);
        setTimeout(() => {
          actions.showNotification(type, message);
        }, 500); // Délai pour que la page soit complètement chargée

        // Supprimer la notification du sessionStorage
        sessionStorage.removeItem('adminNotification');
      } catch (error) {
        console.error('Erreur lors de la lecture de la notification:', error);
      }
    }
  }, [location.search, actions]); // Se déclenche quand l'URL change

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('AdminPanel: Début du chargement des données');

      // Charger les utilisateurs
      console.log('AdminPanel: Chargement des utilisateurs...');
      const usersResult = await adminService.getUsers(filters);
      console.log('AdminPanel: Résultat utilisateurs:', usersResult);

      if (usersResult.success) {
        const userData = usersResult.data.results || usersResult.data || [];
        console.log('AdminPanel: Données utilisateurs:', userData);
        setUsers(Array.isArray(userData) ? userData : []);
      } else {
        console.error('AdminPanel: Erreur utilisateurs:', usersResult.error);
        setError(usersResult.error);
        return; // Arrêter ici si erreur utilisateurs
      }

      // Charger les statistiques
      console.log('AdminPanel: Chargement des statistiques...');
      const statsResult = await adminService.getAdminStats();
      console.log('AdminPanel: Résultat statistiques:', statsResult);

      if (statsResult.success) {
        setStats(statsResult.data);
      } else {
        console.warn('AdminPanel: Erreur statistiques (non bloquante):', statsResult.error);
        // Ne pas bloquer pour les stats, utiliser des valeurs par défaut
        setStats({
          total_users: 0,
          admin_users: 0,
          normal_users: 0,
          active_users: 0,
          inactive_users: 0,
          total_documents: 0,
          recent_users: 0,
          recent_documents: 0
        });
      }
    } catch (err) {
      console.error('AdminPanel: Erreur générale:', err);
      setError('Erreur lors du chargement des données: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaires d'événements
  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user) => {
    setActionUser(user);
    setActionType('delete');
    setShowConfirmModal(true);
  };

  const handleToggleAdmin = (user) => {
    setActionUser(user);
    setActionType('toggleAdmin');
    setShowConfirmModal(true);
  };

  const handleToggleActive = (user) => {
    setActionUser(user);
    setActionType('toggleActive');
    setShowConfirmModal(true);
  };

  const handleUserSubmit = async (userData) => {
    try {
      console.log('AdminPanel: Action utilisateur -', editingUser ? 'Modification' : 'Création');

      let result;
      const actionType = editingUser ? 'Modification' : 'Création';

      if (editingUser) {
        result = await adminService.updateUser(editingUser.id, userData);
      } else {
        result = await adminService.createUser(userData);
      }

      if (result.success) {
        setShowUserModal(false);

        // Redirection vers la même page pour rafraîchissement complet
        console.log('AdminPanel: Redirection pour rafraîchissement complet après', actionType);
        redirectToSamePage(`✅ ${actionType} réussie - Page actualisée automatiquement`);

      } else {
        actions.showNotification('error', result.error);
      }
    } catch (error) {
      console.error('AdminPanel: Erreur:', error);
      actions.showNotification('error', 'Erreur lors de l\'opération');
    }
  };

  const handleConfirmAction = async () => {
    if (!actionUser) return;

    try {
      console.log('AdminPanel: Action -', actionType, 'pour', actionUser.email);

      let result;
      let actionName = '';

      switch (actionType) {
        case 'delete':
          result = await adminService.deleteUser(actionUser.id);
          actionName = 'Suppression';
          break;
        case 'toggleAdmin':
          result = await adminService.toggleUserAdmin(actionUser.id);
          actionName = actionUser.is_staff ? 'Rétrogradation' : 'Promotion';
          break;
        case 'toggleActive':
          result = await adminService.toggleUserActive(actionUser.id);
          actionName = actionUser.is_active ? 'Désactivation' : 'Activation';
          break;
        default:
          return;
      }

      if (result.success) {
        setShowConfirmModal(false);
        setActionUser(null);
        setActionType('');

        // Redirection vers la même page pour rafraîchissement complet
        console.log('AdminPanel: Redirection pour rafraîchissement complet après', actionName);
        redirectToSamePage(`✅ ${actionName} réussie - Page actualisée automatiquement`);

      } else {
        actions.showNotification('error', result.error);
      }
    } catch (error) {
      console.error('AdminPanel: Erreur lors de l\'action:', error);
      actions.showNotification('error', 'Erreur lors de l\'opération');
    } finally {
      setShowConfirmModal(false);
      setActionUser(null);
      setActionType('');
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setRefreshTrigger(prev => prev + 1);
  };

  // Fonction pour rediriger vers la même page (rafraîchissement complet)
  const redirectToSamePage = (message, type = 'success') => {
    console.log('AdminPanel: Redirection vers la même page pour rafraîchissement complet');

    // Stocker le message dans sessionStorage pour l'afficher après redirection
    sessionStorage.setItem('adminNotification', JSON.stringify({ message, type }));

    // Rediriger vers la même page avec un paramètre pour forcer le rechargement
    const currentPath = location.pathname;
    const timestamp = Date.now();
    navigate(`${currentPath}?refresh=${timestamp}`, { replace: true });
  };

  const getConfirmMessage = () => {
    if (!actionUser) return '';
    
    switch (actionType) {
      case 'delete':
        return `Êtes-vous sûr de vouloir supprimer l'utilisateur "${actionUser.email}" ? Cette action est irréversible.`;
      case 'toggleAdmin':
        return actionUser.is_staff 
          ? `Êtes-vous sûr de vouloir rétrograder "${actionUser.email}" en utilisateur normal ?`
          : `Êtes-vous sûr de vouloir promouvoir "${actionUser.email}" en administrateur ?`;
      case 'toggleActive':
        return actionUser.is_active
          ? `Êtes-vous sûr de vouloir désactiver l'utilisateur "${actionUser.email}" ?`
          : `Êtes-vous sûr de vouloir activer l'utilisateur "${actionUser.email}" ?`;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement du panneau d'administration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
          >
            <i className="fas fa-redo me-2"></i>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container admin-fade-in">
      <AdminNavbar />
      <div className="container-fluid py-4">
        {/* En-tête moderne */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="admin-header">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="admin-title mb-0">
                    <i className="fas fa-users-cog me-3"></i>
                    Panneau d'Administration
                  </h1>
                  <p className="admin-subtitle mb-0">Gestion des utilisateurs et du système</p>
                </div>
                <button
                  className="modern-admin-btn"
                  onClick={handleCreateUser}
                >
                  <i className="fas fa-user-plus me-2"></i>
                  Nouvel Utilisateur
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Statistiques */}
        <AdminStats stats={stats} />
        {/* Table des utilisateurs */}
        <div className="row">
          <div className="col-12">
            <div className="admin-card">
              <div className="admin-card-body">
                <UsersTable
                  users={users}
                  currentUser={currentUser}
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
                  onToggleAdmin={handleToggleAdmin}
                  onToggleActive={handleToggleActive}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modals */}
      <UserFormModal
        show={showUserModal}
        user={editingUser}
        onHide={() => setShowUserModal(false)}
        onSubmit={handleUserSubmit}
      />
      <ConfirmModal
        show={showConfirmModal}
        title="Confirmation"
        message={getConfirmMessage()}
        onConfirm={handleConfirmAction}
        onCancel={() => setShowConfirmModal(false)}
        confirmButtonClass={actionType === 'delete' ? 'btn-danger' : 'btn-primary'}
      />
    </div>
  );
};

export default AdminPanel;
