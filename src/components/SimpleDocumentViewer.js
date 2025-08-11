import React from 'react';
import documentService from '../services/documentService';

const SimpleDocumentViewer = ({ document, onClose }) => {
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

  const getFileExtension = (filename) => {
    if (!filename) return '';
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  };

  const extension = getFileExtension(document.file_name);



  const renderDocumentContent = () => {
    console.log('🔍 Analyse du document:', {
      fileName: document.file_name,
      extension: extension,
      documentType: document.document_type,
      fileSize: document.file_size,
      id: document.id
    });

    // Vérifier si c'est un PDF
    const isPdf = extension === 'pdf' ||
                  document.file_name?.toLowerCase().includes('.pdf') ||
                  document.document_type === 'pdf';

    if (isPdf) {
      const token = localStorage.getItem('access_token');
      const previewUrl = `http://localhost:8000/documents/${document.id}/preview/?token=${token}`;

      console.log('📄 Chargement PDF:', { fileName: document.file_name, url: previewUrl });

      return (
        <iframe
          src={previewUrl}
          style={{
            width: '100%',
            height: '980px',
            border: 'none'
          }}
          title={`Aperçu de ${document.title}`}
        />
      );
    }

    // Vérifier si c'est une image (plusieurs méthodes de détection)
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const isImage = imageExtensions.includes(extension) ||
                    document.file_name?.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i) ||
                    document.document_type?.includes('image') ||
                    // Si pas d'extension claire, essayer de détecter par le nom de fichier
                    (extension === '' && document.file_name?.match(/^\d+_\d+/)) || // Pattern comme "468358500_878..."
                    // Détecter par taille de fichier (images typiques entre 10KB et 10MB)
                    (extension === '' && document.file_size && document.file_size > 10000 && document.file_size < 10000000) ||
                    // Forcer l'affichage comme image pour les fichiers sans extension
                    (extension === '' || extension.length > 4);

    if (isImage) {
      const token = localStorage.getItem('access_token');
      const imageUrl = `http://localhost:8000/documents/${document.id}/preview/?token=${token}`;

      // Déterminer la méthode de détection utilisée
      let detectionMethod = 'inconnue';
      if (imageExtensions.includes(extension)) detectionMethod = 'extension';
      else if (document.file_name?.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i)) detectionMethod = 'regex extension';
      else if (document.document_type?.includes('image')) detectionMethod = 'document_type';
      else if (extension === '' && document.file_name?.match(/^\d+_\d+/)) detectionMethod = 'pattern numérique';
      else if (extension === '' && document.file_size && document.file_size > 10000 && document.file_size < 10000000) detectionMethod = 'taille fichier';
      else if (extension === '' || extension.length > 4) detectionMethod = 'fallback sans extension';

      console.log('🖼️ Chargement image:', {
        fileName: document.file_name,
        extension: extension,
        detectionMethod: detectionMethod,
        url: imageUrl
      });

      return (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <img
            src={imageUrl}
            alt={document.title}
            style={{
              maxWidth: '100%',
              maxHeight: '900px',
              objectFit: 'contain',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onLoad={() => console.log('✅ Image chargée avec succès')}
            onError={(e) => console.error('❌ Erreur chargement image:', e)}
          />
        </div>
      );
    }

    // Fallback : essayer d'afficher comme image si pas d'extension claire
    if (!extension || extension === '') {
      const token = localStorage.getItem('access_token');
      const fallbackUrl = `http://localhost:8000/documents/${document.id}/preview/?token=${token}`;

      console.log('🔄 Tentative fallback image pour:', {
        fileName: document.file_name,
        url: fallbackUrl
      });

      return (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ marginBottom: '1rem', color: '#6c757d' }}>
            <small>Tentative d'affichage comme image...</small>
          </div>
          <img
            src={fallbackUrl}
            alt={document.title}
            style={{
              maxWidth: '100%',
              maxHeight: '900px',
              objectFit: 'contain',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onLoad={() => {
              console.log('✅ Fallback image chargée avec succès');
            }}
            onError={(e) => {
              console.error('❌ Fallback image échoué:', e);
              // Afficher le message d'erreur
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div style={{
            display: 'none',
            textAlign: 'center',
            padding: '2rem',
            color: '#6c757d'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <h5>Aperçu non disponible</h5>
            <p>Ce fichier ne peut pas être prévisualisé.</p>
            <p>Cliquez sur "Télécharger" pour ouvrir le fichier.</p>
          </div>
        </div>
      );
    }

    // Autres types de fichiers
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        color: '#6c757d'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
        <h5>Aperçu non disponible</h5>
        <p>Ce type de fichier (.{extension || 'inconnu'}) ne peut pas être prévisualisé.</p>
        <p>Cliquez sur "Télécharger" pour ouvrir le fichier.</p>
      </div>
    );
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '95%',
          maxHeight: '95%',
          width: '1800px',
          height: '1200px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8f9fa'
        }}>
          <h5 style={{ margin: 0, color: '#495057' }}>
            📄 {document.title}
          </h5>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6c757d',
              padding: '0',
              width: '30px',
              height: '30px'
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: '1.5rem',
          flexGrow: 1,
          overflow: 'auto'
        }}>
          {/* Info */}
          <div style={{
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            borderLeft: '4px solid #007bff'
          }}>
            {document.description && (
              <div><strong>Description :</strong> {document.description}</div>
            )}
          </div>

          {/* Content */}
          <div style={{
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            overflow: 'hidden',
            minHeight: '1000px',
            height: '1000px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {renderDocumentContent()}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #dee2e6',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.5rem'
        }}>
          <button
            className="btn btn-outline-success"
            onClick={handleDownload}
          >
            📥 Télécharger
          </button>
          <button
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

export default SimpleDocumentViewer;
