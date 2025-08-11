import React, { useState, useEffect } from 'react';

const UserFormModal = ({ show, user, onHide, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    password_confirm: '',
    is_staff: false,
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        password: '',
        password_confirm: '',
        is_staff: user.is_staff || false,
        is_active: user.is_active !== undefined ? user.is_active : true,
      });
    } else {
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        password: '',
        password_confirm: '',
        is_staff: false,
        is_active: true,
      });
    }
    setErrors({});
  }, [user, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation password (seulement pour la création ou si un mot de passe est fourni)
    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      }

      if (formData.password !== formData.password_confirm) {
        newErrors.password_confirm = 'Les mots de passe ne correspondent pas';
      }
    } else if (formData.password) {
      // En mode édition, valider seulement si un mot de passe est fourni
      if (formData.password.length < 8) {
        newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      }
      if (formData.password !== formData.password_confirm) {
        newErrors.password_confirm = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const userData = {
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone_number: formData.phone_number.trim(),
        is_staff: formData.is_staff,
        is_active: formData.is_active,
      };

      // Ajouter le mot de passe seulement si fourni
      if (formData.password) {
        userData.password = formData.password;
        userData.password_confirm = formData.password_confirm;
      }

      await onSubmit(userData);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      password_confirm: '',
      is_staff: false,
      is_active: true,
    });
    setErrors({});
    onHide();
  };

  if (!show) return null;

  return (
    <div 
      className="modal show d-block" 
      tabIndex="-1" 
      style={{ 
        backgroundColor: 'rgba(0,0,0,0.6)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div className="modal-dialog modal-lg" style={{ 
        margin: 'auto',
        maxWidth: '600px', 
        width: '100%',
        transform: 'none',
        animation: 'modalSlideIn 0.3s ease-out'
      }}>
        <div className="modal-content" style={{ 
          borderRadius: '15px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          border: 'none'
        }}>
          <div className="modal-header bg-primary text-white" style={{ borderRadius: '15px 15px 0 0' }}>
            <h5 className="modal-title">
              <i className={`fas ${isEditing ? 'fa-edit' : 'fa-user-plus'} me-2`}></i>
              {isEditing ? 'Modifier l\'Utilisateur' : 'Créer un Nouvel Utilisateur'}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              disabled={loading}
              style={{ 
                fontSize: '1.2rem',
                opacity: 0.8,
                transition: 'opacity 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.8'}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                {/* Email */}
                <div className="col-12">
                  <label htmlFor="email" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Ex: john@example.com"
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                {/* First Name */}
                <div className="col-md-6">
                  <label htmlFor="first_name" className="form-label">Prénom</label>
                  <input
                    type="text"
                    className="form-control"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Ex: John"
                  />
                </div>

                {/* Last Name */}
                <div className="col-md-6">
                  <label htmlFor="last_name" className="form-label">Nom</label>
                  <input
                    type="text"
                    className="form-control"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Ex: Doe"
                  />
                </div>

                {/* Phone Number */}
                <div className="col-12">
                  <label htmlFor="phone_number" className="form-label">Numéro de téléphone</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Ex: 0123456789 ou +33123456789"
                  />
                </div>

                {/* Password */}
                {!isEditing && (
                <div className="col-md-6">
                  <label htmlFor="password" className="form-label">
                    Mot de passe <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Minimum 8 caractères"
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>
                )}
                {/* Confirm Password */}
                {!isEditing && (
                <div className="col-md-6">
                  <label htmlFor="password_confirm" className="form-label">
                    Confirmer le mot de passe <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.password_confirm ? 'is-invalid' : ''}`}
                    id="password_confirm"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Répéter le mot de passe"
                  />
                  {errors.password_confirm && (
                    <div className="invalid-feedback">{errors.password_confirm}</div>
                  )}
                </div>
                )}
                {/* Permissions */}
                <div className="col-12">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="is_staff"
                          name="is_staff"
                          checked={formData.is_staff}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="is_staff">
                          <i className="fas fa-crown me-1 text-warning"></i>
                          Droits d'administrateur
                        </label>
                      </div>
                    </div>
                    {/* Suppression définitive de la case Compte actif */}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer" style={{ borderRadius: '0 0 15px 15px', borderTop: '1px solid #dee2e6' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={loading}
                style={{ borderRadius: '8px', padding: '8px 20px' }}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ borderRadius: '8px', padding: '8px 20px' }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    {isEditing ? 'Modification...' : 'Création...'}
                  </>
                ) : (
                  <>
                    <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} me-2`}></i>
                    {isEditing ? 'Modifier' : 'Créer'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;
