import React from 'react';
import ModernDocumentCard from './ModernDocumentCard';
import { useApp } from '../contexts/AppContext';

const ModernDocumentList = ({ documents, onDelete, onUpdate, onView }) => {
  const { actions } = useApp();



  const handleDelete = async (documentId) => {
    try {
      await onDelete(documentId);
    } catch (error) {
      actions.showNotification('error', 'Erreur lors de la suppression du document');
    }
  };

  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-content">
          <div className="empty-state-icon">
            <i className="fas fa-folder-open"></i>
          </div>
          <h3 className="empty-state-title">Aucun document trouvé</h3>
          <p className="empty-state-description">
            Vous n'avez pas encore de documents correspondant à vos critères de recherche.
            Commencez par ajouter votre premier document !
          </p>
          <div className="empty-state-actions">
            <button className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>
              Ajouter un document
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="modern-documents-grid">
        {documents.map((document) => (
          <ModernDocumentCard
            key={document.id}
            document={document}
            onDelete={handleDelete}
            onUpdate={onUpdate}
            onView={onView}
          />
        ))}
      </div>


    </>
  );
};

export default ModernDocumentList;
