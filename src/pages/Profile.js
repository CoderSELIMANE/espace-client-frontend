import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import authService from '../services/authService';
import ModernNavbar from '../components/ModernNavbar';
import useAuth from '../hooks/useAuth';

const Profile = () => {
  const navigate = useNavigate();
  const { actions } = useApp();
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [error, setError] = useState('');

  // Mettre à jour le formulaire quand l'utilisateur est chargé
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur quand l'utilisateur tape
    if (error) setError('');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Début de la mise à jour du profil...');

      // Préparer les données à envoyer
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number
      };

      console.log('Données à envoyer:', updateData);

      // Si l'utilisateur veut changer le mot de passe
      if (showPasswordSection && formData.new_password) {
        if (formData.new_password !== formData.confirm_password) {
          actions.showNotification('error', 'Les mots de passe ne correspondent pas');
          setLoading(false);
          return;
        }

        if (!formData.current_password) {
          actions.showNotification('error', 'Veuillez saisir votre mot de passe actuel');
          setLoading(false);
          return;
        }

        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
        console.log('Changement de mot de passe demandé');
      }

      // Appel API pour mettre à jour le profil
      console.log('Appel API updateProfile...');
      const response = await authService.updateProfile(updateData);
      console.log('Réponse API:', response);

      // Mettre à jour l'état global
      actions.setUser(response);
      actions.showNotification('success', 'Profil mis à jour avec succès');

      // Réinitialiser les champs de mot de passe
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
      setShowPasswordSection(false);

    } catch (error) {
      console.error('Erreur complète lors de la mise à jour:', error);
      console.error('Type d\'erreur:', typeof error);
      console.error('Propriétés de l\'erreur:', Object.keys(error));

      let errorMessage = 'Erreur lors de la mise à jour du profil';

      if (error.response) {
        console.error('Erreur de réponse HTTP:', error.response.status, error.response.data);
        errorMessage = error.response.data?.message ||
                      error.response.data?.detail ||
                      error.response.data?.non_field_errors?.[0] ||
                      `Erreur HTTP ${error.response.status}`;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.detail) {
        errorMessage = error.detail;
      }

      setError(errorMessage);
      actions.showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (user) => {
    if (!user) return 'U';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || user.email.charAt(0).toUpperCase();
  };

  // Affichage de chargement pendant l'authentification
  if (authLoading) {
    return (
      <div className="min-vh-100 bg-light">
        <ModernNavbar />
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <h5 className="text-muted">Chargement de votre profil...</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation */}
      <ModernNavbar />

      {/* Main Content */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            {/* Bouton de retour en haut */}
            <div className="mb-4 d-flex justify-content-start">
              <button
                className="btn btn-outline-secondary d-flex align-items-center"
                onClick={() => navigate(-1)}
                style={{
                  borderRadius: '12px',
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Retour
              </button>
            </div>

            {/* Header */}
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3"
                   style={{ width: '80px', height: '80px', fontSize: '2rem', fontWeight: 'bold' }}>
                {getInitials(user)}
              </div>
              <h2 className="h3 text-dark mb-1">Mon Profil</h2>
              <p className="text-muted">Gérez vos informations personnelles</p>
            </div>

            {/* Profile Form */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <form onSubmit={handleProfileUpdate}>
                  {/* Affichage des erreurs */}
                  {error && (
                    <div className="alert alert-danger mb-4" role="alert">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}

                  {/* Informations personnelles */}
                  <div className="mb-4">
                    <h5 className="text-dark mb-3">
                      <i className="fas fa-user me-2 text-primary"></i>
                      Informations personnelles
                    </h5>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="first_name" className="form-label text-dark fw-medium">
                          Prénom
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          placeholder="Votre prénom"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="last_name" className="form-label text-dark fw-medium">
                          Nom
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          placeholder="Votre nom"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="email" className="form-label text-dark fw-medium">
                        Adresse email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="votre@email.com"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="phone_number" className="form-label text-dark fw-medium">
                        Numéro de téléphone
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        placeholder="0123456789 ou +33123456789"
                      />
                    </div>
                  </div>

                  {/* Section mot de passe */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h5 className="text-dark mb-0">
                        <i className="fas fa-lock me-2 text-primary"></i>
                        Sécurité
                      </h5>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setShowPasswordSection(!showPasswordSection)}
                      >
                        {showPasswordSection ? 'Annuler' : 'Changer le mot de passe'}
                      </button>
                    </div>

                    {showPasswordSection && (
                      <div className="border rounded p-3 bg-light">
                        <div className="mb-3">
                          <label htmlFor="current_password" className="form-label text-dark fw-medium">
                            Mot de passe actuel
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="current_password"
                            name="current_password"
                            value={formData.current_password}
                            onChange={handleInputChange}
                            placeholder="Votre mot de passe actuel"
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="new_password" className="form-label text-dark fw-medium">
                            Nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="new_password"
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleInputChange}
                            placeholder="Nouveau mot de passe"
                          />
                        </div>
                        <div className="mb-0">
                          <label htmlFor="confirm_password" className="form-label text-dark fw-medium">
                            Confirmer le nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="confirm_password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleInputChange}
                            placeholder="Confirmer le nouveau mot de passe"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Boutons d'action */}
                  <div className="d-flex gap-3">
                    <button
                      type="submit"
                      className="btn btn-primary flex-fill"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Mise à jour...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Sauvegarder
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
