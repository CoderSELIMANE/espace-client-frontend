import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  theme: localStorage.getItem('theme') || 'light',
  notifications: [],
  loading: false,
  user: (() => {
    // Essayer de charger l'utilisateur depuis le localStorage au démarrage
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur depuis localStorage:', error);
      return null;
    }
  })(),
  documents: [],
  searchQuery: '',
  selectedFilter: 'all',
  stats: {
    totalDocuments: 0,
    totalSize: 0,
    recentUploads: 0
  }
};

// Action types
const ActionTypes = {
  SET_THEME: 'SET_THEME',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_DOCUMENTS: 'SET_DOCUMENTS',
  ADD_DOCUMENT: 'ADD_DOCUMENT',
  UPDATE_DOCUMENT: 'UPDATE_DOCUMENT',
  REMOVE_DOCUMENT: 'REMOVE_DOCUMENT',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTER: 'SET_FILTER',
  UPDATE_STATS: 'UPDATE_STATS'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_THEME:
      localStorage.setItem('theme', action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
      return { ...state, theme: action.payload };

    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, {
          id: Date.now(),
          ...action.payload
        }]
      };

    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };

    case ActionTypes.SET_USER:
      return { ...state, user: action.payload };

    case ActionTypes.SET_DOCUMENTS:
      return { ...state, documents: Array.isArray(action.payload) ? action.payload : [] };

    case ActionTypes.ADD_DOCUMENT:
      return {
        ...state,
        documents: [action.payload, ...(Array.isArray(state.documents) ? state.documents : [])]
      };

    case ActionTypes.UPDATE_DOCUMENT:
      return {
        ...state,
        documents: Array.isArray(state.documents)
          ? state.documents.map(doc =>
              doc.id === action.payload.id ? action.payload : doc
            )
          : []
      };

    case ActionTypes.REMOVE_DOCUMENT:
      return {
        ...state,
        documents: Array.isArray(state.documents)
          ? state.documents.filter(doc => doc.id !== action.payload)
          : []
      };

    case ActionTypes.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };

    case ActionTypes.SET_FILTER:
      return { ...state, selectedFilter: action.payload };

    case ActionTypes.UPDATE_STATS:
      return { ...state, stats: { ...state.stats, ...action.payload } };

    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, []);

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    state.notifications.forEach(notification => {
      if (notification.autoRemove !== false) {
        setTimeout(() => {
          dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: notification.id });
        }, 5000);
      }
    });
  }, [state.notifications]);

  // Actions
  const actions = {
    toggleTheme: () => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      dispatch({ type: ActionTypes.SET_THEME, payload: newTheme });
    },

    showNotification: (type, message, title = '') => {
      dispatch({
        type: ActionTypes.ADD_NOTIFICATION,
        payload: { type, message, title }
      });
    },

    removeNotification: (id) => {
      dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
    },

    setLoading: (loading) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
    },

    setUser: (user) => {
      dispatch({ type: ActionTypes.SET_USER, payload: user });
    },

    // Charger l'utilisateur depuis le localStorage ou l'API
    loadUser: async () => {
      try {
        // D'abord, essayer de charger depuis le localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          dispatch({ type: ActionTypes.SET_USER, payload: user });

          // Ensuite, essayer de récupérer les données à jour depuis l'API
          try {
            const authService = await import('../services/authService');
            const updatedUser = await authService.default.getProfile();
            dispatch({ type: ActionTypes.SET_USER, payload: updatedUser });
          } catch (apiError) {
            // Si l'API échoue, on garde les données du localStorage
            console.warn('Impossible de récupérer le profil depuis l\'API:', apiError);
          }
        } else {
          // Si pas de données dans localStorage, essayer l'API
          const authService = await import('../services/authService');
          const user = await authService.default.getProfile();
          dispatch({ type: ActionTypes.SET_USER, payload: user });
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        // Si tout échoue et qu'on est censé être connecté, rediriger vers login
        const authService = await import('../services/authService');
        if (!authService.default.isAuthenticated()) {
          window.location.href = '/login';
        }
      }
    },

    setDocuments: (documents) => {
      const documentsArray = Array.isArray(documents) ? documents : [];
      dispatch({ type: ActionTypes.SET_DOCUMENTS, payload: documentsArray });

      // Update stats
      const totalSize = documentsArray.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
      const recentUploads = documentsArray.filter(doc => {
        const uploadDate = new Date(doc.uploaded_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return uploadDate > weekAgo;
      }).length;

      dispatch({
        type: ActionTypes.UPDATE_STATS,
        payload: {
          totalDocuments: documentsArray.length,
          totalSize,
          recentUploads
        }
      });
    },

    // Charger les documents depuis l'API
    loadDocuments: async () => {
      try {
        const documentService = await import('../services/documentService');
        const documents = await documentService.default.getDocuments();
        dispatch({ type: ActionTypes.SET_DOCUMENTS, payload: documents });

        // Update stats
        const totalSize = documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
        const recentUploads = documents.filter(doc => {
          const uploadDate = new Date(doc.uploaded_at || doc.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return uploadDate > weekAgo;
        }).length;

        dispatch({
          type: ActionTypes.UPDATE_STATS,
          payload: {
            totalDocuments: documents.length,
            totalSize,
            recentUploads
          }
        });
      } catch (error) {
        console.error('Erreur lors du chargement des documents:', error);
        actions.showNotification('error', 'Erreur lors du chargement des documents');
      }
    },

    addDocument: (document) => {
      dispatch({ type: ActionTypes.ADD_DOCUMENT, payload: document });
      actions.showNotification('success', 'Document ajouté avec succès', 'Succès');
    },

    // Mettre à jour un document
    updateDocument: (document) => {
      dispatch({ type: ActionTypes.UPDATE_DOCUMENT, payload: document });
      actions.showNotification('success', 'Document modifié avec succès', 'Succès');
    },

    // Supprimer un document
    deleteDocument: async (documentId) => {
      try {
        const documentService = await import('../services/documentService');
        await documentService.default.deleteDocument(documentId);
        dispatch({ type: ActionTypes.REMOVE_DOCUMENT, payload: documentId });
        actions.showNotification('success', 'Document supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        actions.showNotification('error', 'Erreur lors de la suppression du document');
        throw error;
      }
    },

    removeDocument: (id) => {
      dispatch({ type: ActionTypes.REMOVE_DOCUMENT, payload: id });
      actions.showNotification('success', 'Document supprimé avec succès', 'Succès');
    },

    setSearchQuery: (query) => {
      dispatch({ type: ActionTypes.SET_SEARCH_QUERY, payload: query });
    },

    setFilter: (filter) => {
      dispatch({ type: ActionTypes.SET_FILTER, payload: filter });
    },

    // Filtered documents based on search and filter
    getFilteredDocuments: () => {
      // S'assurer que documents est un tableau
      let filtered = Array.isArray(state.documents) ? state.documents : [];

      // Apply search filter
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(doc =>
          doc.title.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query)
        );
      }

      // Apply type filter
      if (state.selectedFilter !== 'all') {
        filtered = filtered.filter(doc => doc.document_type === state.selectedFilter);
      }

      return filtered;
    }
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
