import axios from 'axios';
import authService from './authService';

const API_BASE_URL = 'http://localhost:8000';

class AdminService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter automatiquement le token JWT
    this.api.interceptors.request.use(
      (config) => {
        const token = authService.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour gérer les erreurs d'authentification
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          authService.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ========================================
  // GESTION DES UTILISATEURS
  // ========================================

  async getUsers(params = {}) {
    try {
      const response = await this.api.get('/api/admin/users/', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.response?.data?.error || error.message || 'Erreur lors de la récupération des utilisateurs'
      };
    }
  }

  async createUser(userData) {
    try {
      const response = await this.api.post('/api/admin/users/', userData);
      return {
        success: true,
        data: response.data,
        message: 'Utilisateur créé avec succès'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data || 'Erreur lors de la création de l\'utilisateur'
      };
    }
  }

  async updateUser(userId, userData) {
    try {
      const response = await this.api.patch(`/api/admin/users/${userId}/`, userData);
      return {
        success: true,
        data: response.data,
        message: 'Utilisateur modifié avec succès'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data || 'Erreur lors de la modification de l\'utilisateur'
      };
    }
  }

  async deleteUser(userId) {
    try {
      const response = await this.api.delete(`/api/admin/users/${userId}/`);
      return {
        success: true,
        message: response.data?.message || 'Utilisateur supprimé avec succès'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Erreur lors de la suppression de l\'utilisateur'
      };
    }
  }

  async toggleUserAdmin(userId) {
    try {
      const response = await this.api.patch(`/api/admin/users/${userId}/toggle_admin/`);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || 'Droits utilisateur modifiés avec succès'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la modification des droits'
      };
    }
  }

  async toggleUserActive(userId) {
    try {
      const response = await this.api.patch(`/api/admin/users/${userId}/toggle_active/`);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || 'Statut utilisateur modifié avec succès'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la modification du statut'
      };
    }
  }

  // ========================================
  // STATISTIQUES
  // ========================================

  async getAdminStats() {
    try {
      console.log('Appel API getAdminStats');
      const response = await this.api.get('/api/admin/users/stats/');
      console.log('Réponse API getAdminStats:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur API getAdminStats:', error);
      console.error('Détails erreur:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Erreur lors de la récupération des statistiques'
      };
    }
  }

  // ========================================
  // UTILITAIRES
  // ========================================

  async checkAdminStatus() {
    try {
      const user = authService.getCurrentUser();
      return user && user.is_staff;
    } catch (error) {
      return false;
    }
  }

  formatDate(dateString) {
    if (!dateString) return 'Jamais';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`;
    if (diffDays < 365) return `Il y a ${Math.ceil(diffDays / 30)} mois`;
    
    return date.toLocaleDateString('fr-FR');
  }

  getUserRoleBadge(isStaff) {
    if (isStaff) {
      return {
        text: 'Admin',
        class: 'badge bg-danger',
        icon: 'fas fa-crown'
      };
    }
    return {
      text: 'Utilisateur',
      class: 'badge bg-secondary',
      icon: 'fas fa-user'
    };
  }

  getStatusBadge(isActive) {
    if (isActive) {
      return {
        text: 'Actif',
        class: 'badge bg-success',
        icon: 'fas fa-check-circle'
      };
    }
    return {
      text: 'Inactif',
      class: 'badge bg-warning text-dark',
      icon: 'fas fa-pause-circle'
    };
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ========================================
  // STATISTIQUES AVANCÉES
  // ========================================

  async getDocumentStats() {
    try {
      const response = await this.api.get('/api/admin/document-stats/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques documents:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la récupération des statistiques documents'
      };
    }
  }

  async checkAdminStatus() {
    try {
      // Vérifier d'abord les données utilisateur locales
      const user = authService.getCurrentUser();
      if (user && (user.is_staff || user.is_superuser)) {
        return true;
      }

      // Si pas d'info locale, essayer l'API
      try {
        const response = await this.api.get('/api/admin/check-status/');
        return response.data.is_admin || false;
      } catch (apiError) {
        // Si l'API échoue, utiliser les données locales
        return user && (user.is_staff || user.is_superuser);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut admin:', error);
      return false;
    }
  }
}

export default new AdminService();
