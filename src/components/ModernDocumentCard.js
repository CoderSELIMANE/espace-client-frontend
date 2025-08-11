import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import documentService from '../services/documentService';
import { useApp } from '../contexts/AppContext';
import { getUserPermissions } from '../utils/permissions';

const ModernDocumentCard = ({ document, onDelete, onUpdate, onView }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const { state } = useApp();
  const permissions = getUserPermissions(state.user);

  const handleEdit = () => {
    console.log('Clic sur modifier pour le document:', document.id);
    console.log('Utilisateur actuel:', state.user);
    console.log('Permissions:', permissions);
    console.log('Navigation vers:', `/document/edit/${document.id}`);

    // Vérification de sécurité
    if (!permissions.canEdit) {
      alert('Vous n\'avez pas les permissions pour modifier ce document');
      return;
    }

    navigate(`/document/edit/${document.id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      setIsDeleting(true);
      try {
        await onDelete(document.id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      } finally {
        setIsDeleting(false);
      }
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

  const handleView = () => {
    // Pour les documents de type "fiche" et "autre", ouvrir dans un nouvel onglet
    if (document.document_type === 'fiche' || document.document_type === 'other') {
      const token = localStorage.getItem('access_token');
      const previewUrl = `http://localhost:8000/documents/${document.id}/preview/?token=${token}`;

      console.log('🔗 Ouverture dans nouvel onglet:', {
        type: document.document_type,
        fileName: document.file_name,
        url: previewUrl
      });

      // Ouvrir dans un nouvel onglet
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // Pour les autres types (PDF, images, etc.), utiliser le visualiseur modal
    if (onView) {
      onView(document);
    }
  };

  const formatFileSize = (bytes) => {
    return documentService.formatFileSize(bytes);
  };

  const getFileIcon = (filename) => {
    const extension = filename ? filename.split('.').pop() : '';
    return documentService.getFileIcon(`.${extension}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };



  const getTypeGradient = (type) => {
    const gradients = {
      'pdf': 'linear-gradient(135deg, #dc3545, #c82333)',
      'planning': 'linear-gradient(135deg, #17a2b8, #138496)',
      'fiche': 'linear-gradient(135deg, #ffc107, #e0a800)',
      'image': 'linear-gradient(135deg, #28a745, #1e7e34)',
      'other': 'linear-gradient(135deg, #6c757d, #545b62)'
    };
    return gradients[type] || gradients['other'];
  };

  return (
    <div
      className="card h-100 border-0 modern-document-card"
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Barre colorée en haut */}
      <div
        style={{
          height: '4px',
          background: getTypeGradient(document.document_type),
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1
        }}
      />

      <div className="card-body d-flex flex-column" style={{ padding: '1.5rem' }}>
        {/* Header avec icône et titre */}
        <div className="d-flex align-items-start mb-3">
          <div
            className="me-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: '70px',
              height: '70px',
              minWidth: '70px', // Empêche la compression
              minHeight: '70px', // Empêche la compression
              background: getTypeGradient(document.document_type),
              borderRadius: '16px',
              color: 'white',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}
          >
            <i className={`${getFileIcon(document.file_name)} fa-xl`} style={{ fontSize: '1.5rem' }}></i>
          </div>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <h6
              className="card-title mb-1 fw-bold"
              title={document.title}
              style={{
                fontSize: '1.1rem',
                color: '#2c3e50',
                lineHeight: '1.3',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2, // Permet 2 lignes
                WebkitBoxOrient: 'vertical',
                wordWrap: 'break-word'
              }}
            >
              {document.title}
            </h6>
            <small
              className="text-muted d-block"
              style={{
                fontSize: '0.85rem',
                opacity: 0.7,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={document.file_name}
            >
              {document.file_name}
            </small>
          </div>
        </div>

        {/* Description */}
        {document.description && (
          <div
            className="mb-3 flex-grow-1"
            style={{
              background: 'rgba(108, 117, 125, 0.05)',
              borderRadius: '12px',
              padding: '1rem',
              border: '1px solid rgba(108, 117, 125, 0.1)'
            }}
          >
            <p
              className="card-text mb-0"
              style={{
                fontSize: '0.9rem',
                color: '#495057',
                lineHeight: '1.5',
                margin: 0
              }}
            >
              {document.description.length > 100
                ? `${document.description.substring(0, 100)}...`
                : document.description
              }
            </p>
          </div>
        )}

        {/* Métadonnées */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span
              className="badge"
              style={{
                background: getTypeGradient(document.document_type),
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {document.document_type}
            </span>
            <div
              className="d-flex align-items-center"
              style={{
                background: 'rgba(40, 167, 69, 0.1)',
                padding: '0.4rem 0.8rem',
                borderRadius: '12px',
                border: '1px solid rgba(40, 167, 69, 0.2)'
              }}
            >
              <i className="fas fa-hdd me-1" style={{ color: '#28a745', fontSize: '0.8rem' }}></i>
              <small style={{ color: '#28a745', fontWeight: '600', fontSize: '0.8rem' }}>
                {formatFileSize(document.file_size)}
              </small>
            </div>
          </div>
          <div
            className="d-flex align-items-center"
            style={{
              background: 'rgba(23, 162, 184, 0.1)',
              padding: '0.5rem 0.8rem',
              borderRadius: '12px',
              border: '1px solid rgba(23, 162, 184, 0.2)'
            }}
          >
            <i className="fas fa-calendar me-2" style={{ color: '#17a2b8', fontSize: '0.9rem' }}></i>
            <small style={{ color: '#17a2b8', fontWeight: '600', fontSize: '0.85rem' }}>
              {formatDate(document.uploaded_at || document.created_at)}
            </small>
          </div>
        </div>

        {/* Actions - Tous les boutons dans un seul conteneur */}
        <div className="d-flex flex-column" style={{ gap: '2px', marginTop: 'auto' }}>
          {/* Première rangée (2 boutons) */}
          <div className="d-flex" style={{ gap: '0' }}>
            {/* Bouton Voir - Disponible pour tous les utilisateurs connectés */}
            {permissions.canView && (
              <button
                className="btn flex-fill"
                onClick={handleView}
                title={
                  document.document_type === 'fiche' || document.document_type === 'other'
                    ? "Ouvrir dans un nouvel onglet"
                    : "Voir le document"
                }
                style={{
                  background: 'linear-gradient(135deg, #17a2b8, #138496)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '12px 0 0 0',
                  padding: '0.6rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(23, 162, 184, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(23, 162, 184, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(23, 162, 184, 0.3)';
                }}
              >
                <i className={
                  document.document_type === 'fiche' || document.document_type === 'other'
                    ? "fas fa-external-link-alt me-1"
                    : "fas fa-eye me-1"
                }></i>
                {document.document_type === 'fiche' || document.document_type === 'other' ? 'Ouvrir' : 'Voir'}
              </button>
            )}

            {/* Bouton Télécharger - Disponible pour tous les utilisateurs connectés */}
            {permissions.canDownload && (
              <button
                className="btn flex-fill"
                onClick={handleDownload}
                title="Télécharger"
                style={{
                  background: 'linear-gradient(135deg, #28a745, #1e7e34)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '0 12px 0 0',
                  padding: '0.6rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.3)';
                }}
              >
                <i className="fas fa-download me-1"></i>
                Télécharger
              </button>
            )}
          </div>

          {/* Deuxième rangée (2 boutons) */}
          <div className="d-flex" style={{ gap: '0' }}>
                      {/* Bouton Modifier - Disponible seulement pour les admins */}
            {permissions.canEdit && (
              <button
                className="btn flex-fill"
                onClick={handleEdit}
                title="Modifier"
                style={{
                  background: 'linear-gradient(135deg, #007bff, #0056b3)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '0 0 0 12px',
                  padding: '0.6rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.3)';
                }}
              >
                <i className="fas fa-edit me-1"></i>
                Modifier
              </button>
            )}

            {/* Bouton Supprimer - Disponible seulement pour les admins */}
            {permissions.canDelete && (
              <button
                className="btn"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Supprimer"
                style={{
                  background: isDeleting
                    ? 'linear-gradient(135deg, #6c757d, #545b62)'
                    : 'linear-gradient(135deg, #dc3545, #c82333)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '0 0 12px 0',
                  padding: '0.6rem 0.8rem',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: isDeleting
                    ? '0 2px 8px rgba(108, 117, 125, 0.3)'
                    : '0 2px 8px rgba(220, 53, 69, 0.3)',
                  opacity: isDeleting ? 0.7 : 1,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  width: '60px',
                  minWidth: '60px'
                }}
                onMouseEnter={(e) => {
                  if (!isDeleting) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDeleting) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)';
                  }
                }}
              >
                {isDeleting ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-trash"></i>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDocumentCard;
