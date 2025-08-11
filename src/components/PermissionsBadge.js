import React from 'react';
import { useApp } from '../contexts/AppContext';
import { getUserPermissions } from '../utils/permissions';

const PermissionsBadge = () => {
  const { state } = useApp();
  const permissions = getUserPermissions(state.user);

  if (!state.user) return null;

  return (
    <div className="permissions-badge mb-3">
      <div className="card border-info">
        <div className="card-body py-2">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <i className="fas fa-user-shield text-info me-2"></i>
              <span className="fw-bold text-info">
                {permissions.userType}
              </span>
            </div>
            
            <div className="d-flex gap-2">
              {/* Badge Visualisation */}
              {permissions.canView && (
                <span className="badge bg-info" title="Peut visualiser les documents">
                  <i className="fas fa-eye me-1"></i>
                  Visualisation
                </span>
              )}
              
              {/* Badge Téléchargement */}
              {permissions.canDownload && (
                <span className="badge bg-success" title="Peut télécharger les documents">
                  <i className="fas fa-download me-1"></i>
                  Téléchargement
                </span>
              )}
              
              {/* Badge Modification */}
              {permissions.canEdit && (
                <span className="badge bg-warning" title="Peut modifier les documents">
                  <i className="fas fa-edit me-1"></i>
                  Modification
                </span>
              )}
              
              {/* Badge Suppression */}
              {permissions.canDelete && (
                <span className="badge bg-danger" title="Peut supprimer les documents">
                  <i className="fas fa-trash me-1"></i>
                  Suppression
                </span>
              )}
              
              {/* Badge Ajout */}
              {permissions.canAdd && (
                <span className="badge bg-primary" title="Peut ajouter des documents">
                  <i className="fas fa-plus me-1"></i>
                  Ajout
                </span>
              )}
            </div>
          </div>
          
          {/* Message informatif pour les utilisateurs normaux */}
          {permissions.isStudent && (
            <div className="mt-2">
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                Vous pouvez visualiser et télécharger tous les documents.
                Seuls les administrateurs peuvent ajouter, modifier ou supprimer des documents.
              </small>
            </div>
          )}
          
          {/* Message informatif pour les admins */}
          {permissions.isAdmin && (
            <div className="mt-2">
              <small className="text-success">
                <i className="fas fa-crown me-1"></i>
                Vous avez tous les droits sur les documents : visualisation, téléchargement, ajout, modification et suppression.
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionsBadge;
