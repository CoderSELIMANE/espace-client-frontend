import React, { useState, useEffect } from 'react';
import documentService from '../services/documentService';
import './DocumentViewer.css';

const DocumentViewer = ({ document, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewUrl, setViewUrl] = useState(null);

  useEffect(() => {
    if (document) {
      loadDocumentForViewing();
    }
  }, [document]);

  // Gestion de la touche Échap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const loadDocumentForViewing = async () => {
    try {
      setLoading(true);
      setError(null);

      // Créer une URL de visualisation avec token d'authentification
      const token = localStorage.getItem('access_token');
      const previewUrl = `http://localhost:8000/api/documents/${document.id}/preview/?token=${token}`;
      
      setViewUrl(previewUrl);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement du document:', err);
      setError('Impossible de charger le document pour la visualisation');
      setLoading(false);
    }
  };

  const getFileExtension = (filename) => {
    return filename ? filename.split('.').pop().toLowerCase() : '';
  };

  const renderDocumentContent = () => {
    const extension = getFileExtension(document.file_name);

    if (loading) {
      return (
        <div className="document-viewer-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p>Chargement du document...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="document-viewer-error">
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        </div>
      );
    }

    // Rendu selon le type de fichier
    switch (extension) {
      case 'pdf':
        return (
          <div className="document-viewer-content">
            <iframe
              src={viewUrl}
              width="100%"
              height="600px"
              style={{ border: 'none' }}
              title={`Aperçu de ${document.title}`}
            />
          </div>
        );

      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <div className="text-center">
            <img
              src={viewUrl}
              alt={document.title}
              className="img-fluid"
              style={{ maxHeight: '600px' }}
            />
          </div>
        );

      case 'txt':
      case 'md':
        return (
          <div className="document-viewer-content">
            <iframe
              src={viewUrl}
              width="100%"
              height="600px"
              style={{ border: '1px solid #ddd' }}
              title={`Aperçu de ${document.title}`}
            />
          </div>
        );

      default:
        return (
          <div className="document-viewer-no-preview">
            <i className="fas fa-file-alt"></i>
            <h5>Aperçu non disponible</h5>
            <p>
              Ce type de fichier (.{extension}) ne peut pas être prévisualisé directement.
              Vous pouvez le télécharger pour l'ouvrir avec l'application appropriée.
            </p>
          </div>
        );
    }
  };

  if (!document) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = async () => {
    try {
      await documentService.downloadDocument(document.id, document.file_name);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du document');
    }
  };

  return (
    <div className="document-viewer-modal" onClick={handleBackdropClick}>
      <div className="document-viewer-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="document-viewer-header">
          <h5 className="document-viewer-title">
            <i className={`${documentService.getFileIcon(document.file_name)} me-2`}></i>
            {document.title}
          </h5>
          <button
            type="button"
            className="document-viewer-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="document-viewer-body">
          {/* Informations du document */}
          <div className="document-viewer-info">
            <div className="row">
              <div className="col-md-6">
                <small>
                  <strong>Nom du fichier :</strong> {document.file_name}
                </small>
              </div>
              <div className="col-md-6">
                <small>
                  <strong>Taille :</strong> {documentService.formatFileSize(document.file_size)}
                </small>
              </div>
            </div>
            {document.description && (
              <div className="row mt-2">
                <div className="col-12">
                  <small>
                    <strong>Description :</strong> {document.description}
                  </small>
                </div>
              </div>
            )}
          </div>

          {/* Contenu du document */}
          {renderDocumentContent()}
        </div>

        {/* Footer */}
        <div className="document-viewer-footer">
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={handleDownload}
          >
            <i className="fas fa-download me-2"></i>
            Télécharger
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
