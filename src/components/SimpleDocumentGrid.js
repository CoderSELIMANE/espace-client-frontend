import React from 'react';
import '../styles/SimpleDocuments.css';

const SimpleDocumentGrid = ({ documents, onView, onDownload, onEdit, onDelete }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📋';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'txt':
        return '📃';
      default:
        return '📁';
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="documents-container">
        <div className="documents-header">
          <div className="container">
            <h1 className="documents-title">Mes Documents</h1>
          </div>
        </div>
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">📁</div>
            <h3 className="empty-state-title">Aucun document trouvé</h3>
            <p className="empty-state-description">
              Vous n'avez pas encore de documents. Commencez par en télécharger un.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="documents-container">
      <div className="documents-header">
        <div className="container">
          <h1 className="documents-title">Mes Documents ({documents.length})</h1>
        </div>
      </div>
      
      <div className="container">
        <div className="documents-grid">
          {documents.map((document) => (
            <div key={document.id} className="document-card">
              <div className="document-icon">
                {getFileIcon(document.nom_fichier)}
              </div>
              
              <h3 className="document-title" title={document.nom_fichier}>
                {document.nom_fichier}
              </h3>
              
              {document.description && (
                <p className="document-description" title={document.description}>
                  {document.description}
                </p>
              )}
              
              <div className="document-meta">
                <span className="document-type">
                  {document.nom_fichier.split('.').pop().toUpperCase()}
                </span>
                <span className="document-size">
                  {formatFileSize(document.taille_fichier)}
                </span>
              </div>
              
              <div className="document-date">
                📅 {formatDate(document.date_creation)}
              </div>
              
              <div className="document-actions">
                {onView && (
                  <button
                    className="btn-action btn-view"
                    onClick={() => onView(document)}
                    title="Voir le document"
                  >
                    👁️ Voir
                  </button>
                )}
                
                {onDownload && (
                  <button
                    className="btn-action btn-download"
                    onClick={() => onDownload(document)}
                    title="Télécharger le document"
                  >
                    ⬇️ Télécharger
                  </button>
                )}
                
                {onEdit && (
                  <button
                    className="btn-action btn-edit"
                    onClick={() => onEdit(document)}
                    title="Modifier le document"
                  >
                    ✏️ Modifier
                  </button>
                )}
                
                {onDelete && (
                  <button
                    className="btn-action btn-delete"
                    onClick={() => onDelete(document)}
                    title="Supprimer le document"
                  >
                    🗑️ Supprimer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleDocumentGrid;
