import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import documentService from '../services/documentService';
import ModernNavbar from '../components/ModernNavbar';

const DocumentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { actions } = useApp();

  console.log('DocumentEdit - ID du document:', id);
  
  const [document, setDocument] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type: 'other'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState({});

  // Types de documents disponibles avec icônes
  const documentTypes = [
    { value: 'pdf', label: 'PDF', icon: 'fas fa-file-pdf', color: 'text-danger' },
    { value: 'fiche', label: 'Fiche', icon: 'fas fa-file-alt', color: 'text-primary' },
    { value: 'image', label: 'Image', icon: 'fas fa-file-image', color: 'text-success' },
    { value: 'other', label: 'Autre', icon: 'fas fa-file', color: 'text-secondary' }
  ];

  // Charger le document
  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);
        console.log('Chargement du document avec ID:', id);

        // Utiliser getDocument directement au lieu de getDocuments
        const foundDocument = await documentService.getDocument(id);
        console.log('Document trouvé:', foundDocument);

        if (!foundDocument) {
          actions.showNotification('error', 'Document non trouvé');
          navigate('/dashboard');
          return;
        }

        setDocument(foundDocument);
        const initialData = {
          title: foundDocument.title || '',
          description: foundDocument.description || '',
          document_type: foundDocument.document_type || 'other'
        };
        setFormData(initialData);
        setOriginalData(initialData);
      } catch (error) {
        console.error('Erreur lors du chargement du document:', error);

        // Gestion d'erreur plus spécifique
        if (error.status === 404) {
          actions.showNotification('error', 'Document non trouvé');
        } else if (error.status === 403) {
          actions.showNotification('error', 'Vous n\'avez pas les permissions pour modifier ce document');
        } else {
          actions.showNotification('error', 'Erreur lors du chargement du document');
        }
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadDocument();
    }
  }, [id, navigate, actions]);

  // Détecter les changements
  useEffect(() => {
    const changed = Object.keys(formData).some(key => 
      formData[key] !== originalData[key]
    );
    setHasChanges(changed);
  }, [formData, originalData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Le titre doit contenir au moins 3 caractères';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Le titre ne peut pas dépasser 200 caractères';
    }
    
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'La description ne peut pas dépasser 1000 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!hasChanges) {
      actions.showNotification('info', 'Aucune modification détectée');
      return;
    }

    setSaving(true);
    try {
      const updatedDocument = await documentService.updateDocument(document.id, formData);
      // Mettre à jour le document dans le contexte
      actions.updateDocument(updatedDocument);
      actions.showNotification('success', 'Document modifié avec succès');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      
      if (error.response?.data) {
        const serverErrors = error.response.data;
        setErrors(serverErrors);
        
        const firstError = Object.values(serverErrors)[0];
        if (Array.isArray(firstError)) {
          actions.showNotification('error', firstError[0]);
        } else {
          actions.showNotification('error', firstError);
        }
      } else {
        actions.showNotification('error', 'Erreur lors de la modification du document');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?')) {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };

  const resetForm = () => {
    setFormData(originalData);
    setErrors({});
    setHasChanges(false);
  };

  // Obtenir les informations du type de document actuel
  const getCurrentTypeInfo = () => {
    return documentTypes.find(type => type.value === formData.document_type) || documentTypes[3];
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <ModernNavbar />
        <div className="container-fluid py-4">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="text-muted">Chargement du document...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <div className="min-vh-100 bg-light">
      <ModernNavbar />

      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 col-xl-6">
            {/* Header */}
            <div className="d-flex align-items-center mb-4">
              <button
                className="btn btn-outline-secondary me-3"
                onClick={handleCancel}
                disabled={saving}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Retour
              </button>
              <div>
                <h1 className="h3 mb-1">
                  <i className="fas fa-edit me-2 text-warning"></i>
                  Modifier le document
                </h1>
                <p className="text-muted mb-0">
                  Modifiez les informations de votre document
                </p>
              </div>
            </div>

            {/* Status Badge */}
            {hasChanges && (
              <div className="alert alert-warning d-flex align-items-center mb-4">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <span>Vous avez des modifications non sauvegardées</span>
              </div>
            )}

            {/* Main Form Card */}
            <div className="card shadow-sm border-0 enhanced-card">
              <div className="card-header bg-gradient-primary text-white">
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <i className="fas fa-file-edit me-2"></i>
                  Informations du document
                </h5>
              </div>

              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  {/* Erreurs générales */}
                  {errors.non_field_errors && (
                    <div className="alert alert-danger">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {errors.non_field_errors[0]}
                    </div>
                  )}

                  {/* Informations du fichier actuel */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-info-circle me-2 text-info"></i>
                      Fichier actuel
                    </label>
                    <div className="enhanced-file-info-card">
                      <div className="file-icon-section">
                        <i className={`${getCurrentTypeInfo().icon} fa-2x ${getCurrentTypeInfo().color}`}></i>
                      </div>
                      <div className="file-details-section">
                        <div className="file-name-display">
                          <strong className="text-primary">{document.title}</strong>
                          <span className="file-extension-badge ms-2">{document.file_extension}</span>
                        </div>
                        <div className="file-meta mt-2">
                          <span className="file-size-info me-3">
                            <i className="fas fa-weight-hanging me-1 text-muted"></i>
                            <small>{document.file_size ? documentService.formatFileSize(document.file_size) : 'Taille inconnue'}</small>
                          </span>
                          <span className="file-upload-date me-3">
                            <i className="fas fa-calendar me-1 text-muted"></i>
                            <small>{new Date(document.uploaded_at).toLocaleDateString('fr-FR')}</small>
                          </span>
                          <span className="file-author">
                            <i className="fas fa-user me-1 text-muted"></i>
                            <small>{document.user_full_name || document.user_email}</small>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Titre */}
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label fw-semibold">
                      <i className="fas fa-heading me-2 text-primary"></i>
                      Titre du document *
                    </label>
                    <div className="input-group enhanced-input-group">
                      <span className="input-group-text bg-light">
                        <i className="fas fa-file-signature text-muted"></i>
                      </span>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        className={`form-control enhanced-input ${errors.title ? 'is-invalid' : ''}`}
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Entrez le titre du document"
                        required
                        disabled={saving}
                        maxLength="200"
                      />
                      <span className="input-group-text bg-light">
                        <small className={`text-muted ${formData.title.length > 180 ? 'text-warning' : ''}`}>
                          {formData.title.length}/200
                        </small>
                      </span>
                    </div>
                    {errors.title && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.title}
                      </div>
                    )}
                    <div className="form-text">
                      <i className="fas fa-lightbulb me-1 text-warning"></i>
                      Choisissez un titre descriptif et unique pour votre document
                    </div>
                  </div>

                  {/* Type de document */}
                  <div className="mb-3">
                    <label htmlFor="document_type" className="form-label fw-semibold">
                      <i className="fas fa-tags me-2 text-success"></i>
                      Catégorie du document
                      <span className="badge bg-info ms-2">Auto-détecté</span>
                    </label>
                    <div className="input-group enhanced-input-group">
                      <span className="input-group-text bg-light">
                        <i className={`${getCurrentTypeInfo().icon} ${getCurrentTypeInfo().color}`}></i>
                      </span>
                      <select
                        id="document_type"
                        name="document_type"
                        className={`form-select enhanced-select ${errors.document_type ? 'is-invalid' : ''}`}
                        value={formData.document_type}
                        onChange={handleInputChange}
                        disabled={saving}
                      >
                        {documentTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-text">
                      <i className="fas fa-folder me-1 text-info"></i>
                      Sélectionnez la catégorie qui correspond le mieux à votre document
                    </div>
                    {errors.document_type && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.document_type}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label htmlFor="description" className="form-label fw-semibold">
                      <i className="fas fa-align-left me-2 text-info"></i>
                      Description
                      <span className="badge bg-secondary ms-2">Optionnel</span>
                    </label>
                    <div className="enhanced-textarea-container">
                      <textarea
                        id="description"
                        name="description"
                        className={`form-control enhanced-textarea ${errors.description ? 'is-invalid' : ''}`}
                        rows="4"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Ajoutez une description détaillée de votre document..."
                        disabled={saving}
                        maxLength="1000"
                      />
                      <div className="textarea-footer">
                        <div className="form-text">
                          <i className="fas fa-info-circle me-1 text-info"></i>
                          Décrivez le contenu et l'objectif de ce document
                        </div>
                        <small className={`text-muted ${formData.description.length > 900 ? 'text-warning' : ''}`}>
                          {formData.description.length}/1000
                        </small>
                      </div>
                    </div>
                    {errors.description && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.description}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="enhanced-actions-section">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        {hasChanges && (
                          <button
                            type="button"
                            className="btn btn-outline-warning btn-enhanced"
                            onClick={resetForm}
                            disabled={saving}
                          >
                            <i className="fas fa-undo me-2"></i>
                            Réinitialiser
                          </button>
                        )}
                      </div>

                      <div className="d-flex gap-3">
                        <button
                          type="button"
                          className="btn btn-secondary btn-enhanced"
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          <i className="fas fa-times me-2"></i>
                          Annuler
                        </button>

                        <button
                          type="submit"
                          className={`btn btn-enhanced ${hasChanges ? 'btn-warning' : 'btn-outline-primary'}`}
                          disabled={saving || !hasChanges}
                        >
                          {saving ? (
                            <>
                              <i className="fas fa-spinner fa-spin me-2"></i>
                              Sauvegarde...
                            </>
                          ) : hasChanges ? (
                            <>
                              <i className="fas fa-save me-2"></i>
                              Sauvegarder les modifications
                            </>
                          ) : (
                            <>
                              <i className="fas fa-check me-2"></i>
                              Aucune modification
                            </>
                          )}
                        </button>
                      </div>
                    </div>
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

export default DocumentEdit;
