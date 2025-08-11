import React, { useState } from 'react';
import documentService from '../services/documentService';
import { useApp } from '../contexts/AppContext';
import { getUserPermissions } from '../utils/permissions';

const DocumentUpload = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type: 'other',
    file: null,
    is_public: true  // Tous les documents sont publics par défaut
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const { state, actions } = useApp();

  // Obtenir les permissions de l'utilisateur
  const userPermissions = getUserPermissions(state.user);

  const documentTypes = [
    { value: 'pdf', label: 'PDF' },
    { value: 'fiche', label: 'Fiche' },
    { value: 'image', label: 'Image' },
    { value: 'other', label: 'Autre' }
  ];

  // Fonction pour détecter automatiquement le type de fichier
  const detectFileType = (fileName) => {
    if (!fileName) return 'other';

    const extension = fileName.toLowerCase().split('.').pop();

    // Types d'images
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif'].includes(extension)) {
      return 'image';
    }

    // Types PDF
    if (extension === 'pdf') {
      return 'pdf';
    }

    // Types de fiche (documents texte, tableurs et présentations)
    if (['doc', 'docx', 'txt', 'rtf', 'odt', 'ppt', 'pptx', 'odp', 'xls', 'xlsx', 'csv', 'ods', 'xlsm', 'xlsb'].includes(extension)) {
      return 'fiche';
    }

    // Par défaut
    return 'other';
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'file') {
      const file = files[0];
      const detectedType = detectFileType(file?.name);
      setFormData({
        ...formData,
        file: file,
        title: formData.title || (file ? file.name.split('.')[0] : ''),
        document_type: detectedType // Détection automatique du type
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const detectedType = detectFileType(file.name);
      setFormData({
        ...formData,
        file: file,
        title: formData.title || file.name.split('.')[0],
        document_type: detectedType // Détection automatique du type
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!formData.file) {
      setErrors({ file: ['Veuillez sélectionner un fichier'] });
      setLoading(false);
      return;
    }

    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('document_type', formData.document_type);
      uploadData.append('file', formData.file);

      const response = await documentService.uploadDocument(uploadData);
      actions.showNotification('success', 'Document uploadé avec succès', 'Succès');
      onSuccess(response.document);
    } catch (err) {
      setErrors(err);
      actions.showNotification('error', 'Erreur lors de l\'upload du document', 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-plus me-2"></i>
              Ajouter un document
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {errors.non_field_errors && (
                <div className="alert alert-danger">
                  {errors.non_field_errors[0]}
                </div>
              )}

              {/* File Upload */}
              <div className="mb-3">
                <label className="form-label">
                  <i className="fas fa-file me-2"></i>
                  Fichier *
                </label>
                <div
                  className={`border rounded p-4 text-center ${
                    dragActive ? 'border-primary bg-light' : 'border-dashed'
                  } ${errors.file ? 'border-danger' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {formData.file ? (
                    <div>
                      <i className="fas fa-file-check fa-2x text-success mb-2"></i>
                      <p className="mb-0">{formData.file.name}</p>
                      <small className="text-muted">
                        {documentService.formatFileSize(formData.file.size)}
                      </small>
                    </div>
                  ) : (
                    <div>
                      <i className="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
                      <p className="mb-2">Glissez-déposez votre fichier ici ou</p>
                      <input
                        type="file"
                        className="form-control"
                        name="file"
                        onChange={handleChange}
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                      />
                    </div>
                  )}
                </div>
                {errors.file && (
                  <div className="text-danger small mt-1">
                    {errors.file[0]}
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  <i className="fas fa-heading me-2"></i>
                  Titre *
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Nom du document"
                />
                {errors.title && (
                  <div className="invalid-feedback">
                    {errors.title[0]}
                  </div>
                )}
              </div>

              {/* Document Type - Détecté automatiquement */}
              <div className="mb-3">
                <label htmlFor="document_type" className="form-label">
                  <i className="fas fa-tags me-2"></i>
                  Type de document
                  <small className="text-muted ms-2">(détecté automatiquement)</small>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-magic"></i>
                  </span>
                  <select
                    className={`form-select ${errors.document_type ? 'is-invalid' : ''}`}
                    id="document_type"
                    name="document_type"
                    value={formData.document_type}
                    onChange={handleChange}
                  >
                    {documentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.file && (
                  <div className="form-text">
                    <i className="fas fa-info-circle me-1"></i>
                    Type détecté automatiquement basé sur l'extension du fichier. Vous pouvez le modifier si nécessaire.
                  </div>
                )}
                {errors.document_type && (
                  <div className="invalid-feedback">
                    {errors.document_type[0]}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  <i className="fas fa-align-left me-2"></i>
                  Description
                </label>
                <textarea
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Description du document (optionnel)"
                ></textarea>
                {errors.description && (
                  <div className="invalid-feedback">
                    {errors.description[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Information sur le partage */}
            <div className="alert alert-info">
              <i className="fas fa-user-shield me-2"></i>
              <strong>Ajout administrateur :</strong> Ce document sera ajouté à la bibliothèque partagée et visible par tous les utilisateurs.
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={loading || !formData.file}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Upload...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload me-2"></i>
                    Ajouter
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

export default DocumentUpload;
