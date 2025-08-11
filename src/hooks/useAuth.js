import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import authService from '../services/authService';

/**
 * Hook personnalisé pour gérer l'authentification
 * Assure que l'utilisateur est connecté et charge ses données
 */
const useAuth = (redirectTo = '/login') => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { state, actions } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);

        // Vérifier si l'utilisateur est authentifié
        if (!authService.isAuthenticated()) {
          setIsAuthenticated(false);
          navigate(redirectTo);
          return;
        }

        setIsAuthenticated(true);

        // Si pas d'utilisateur dans le state, le charger
        if (!state.user) {
          try {
            await actions.loadUser();
          } catch (error) {
            console.error('Erreur lors du chargement de l\'utilisateur:', error);
            // Si le chargement échoue, vérifier à nouveau l'authentification
            if (!authService.isAuthenticated()) {
              setIsAuthenticated(false);
              navigate(redirectTo);
              return;
            }
          }
        }

      } catch (error) {
        console.error('Erreur lors de la vérification d\'authentification:', error);
        setIsAuthenticated(false);
        navigate(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, redirectTo, actions, state.user]);

  return {
    isLoading,
    isAuthenticated,
    user: state.user
  };
};

export default useAuth;
