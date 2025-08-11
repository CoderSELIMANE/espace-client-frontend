import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Configuration d'axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

class AuthService {
  // Inscription
  async register(userData) {
    try {
      const response = await api.post('/register/', userData);
      if (response.data.tokens) {
        this.setTokens(response.data.tokens);
        this.setUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Connexion
  async login(email, password) {
    try {
      const response = await api.post('/login/', { email, password });
      if (response.data.tokens) {
        this.setTokens(response.data.tokens);
        this.setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      return { success: false, message: 'Erreur de connexion' };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.detail || 'Erreur de connexion'
      };
    }
  }

  // Déconnexion
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Obtenir le token d'accès
  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  // Obtenir le token de rafraîchissement
  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  // Vérifier si l'utilisateur est admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user && (user.is_staff || user.is_superuser);
  }

  // Obtenir le profil utilisateur
  async getProfile() {
    try {
      const response = await api.get('/profile/');
      this.setUser(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Mettre à jour le profil utilisateur
  async updateProfile(profileData) {
    try {
      console.log('AuthService: Envoi des données de profil:', profileData);
      const response = await api.put('/profile/', profileData);
      console.log('AuthService: Réponse reçue:', response.data);

      this.setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('AuthService: Erreur lors de la mise à jour du profil:', error);
      console.error('AuthService: Statut de la réponse:', error.response?.status);
      console.error('AuthService: Données de la réponse:', error.response?.data);

      // Améliorer la gestion d'erreurs
      if (error.response) {
        // Erreur de réponse HTTP
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Si c'est un objet d'erreurs de validation
          const firstError = Object.values(errorData)[0];
          if (Array.isArray(firstError)) {
            throw new Error(firstError[0]);
          } else if (typeof firstError === 'string') {
            throw new Error(firstError);
          } else if (errorData.detail) {
            throw new Error(errorData.detail);
          } else if (errorData.message) {
            throw new Error(errorData.message);
          }
        } else if (typeof errorData === 'string') {
          throw new Error(errorData);
        }
        throw new Error(`Erreur HTTP ${error.response.status}`);
      } else if (error.request) {
        // Erreur de réseau
        throw new Error('Erreur de connexion au serveur');
      } else {
        // Autre erreur
        throw new Error(error.message || 'Erreur inconnue');
      }
    }
  }

  // Méthodes utilitaires privées
  setTokens(tokens) {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export default new AuthService();
export { api };
