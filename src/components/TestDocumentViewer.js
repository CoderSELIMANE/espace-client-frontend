import React from 'react';

const TestDocumentViewer = ({ document, onClose }) => {
  if (!document) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // URLs de test - CORRECTION: ajouter le token pour l'authentification
  const token = localStorage.getItem('access_token');
  const previewUrl = `http://127.0.0.1:8000/documents/${document.id}/preview/?token=${token}`;
  const downloadUrl = `http://127.0.0.1:8000/api/documents/${document.id}/download/`;
  
  console.log('=== DEBUG DOCUMENT VIEWER ===');
  console.log('Document complet:', document);
  console.log('ID:', document.id);
  console.log('Titre:', document.title);
  console.log('Nom fichier:', document.file_name);
  console.log('URL preview:', previewUrl);
  console.log('URL download:', downloadUrl);
  console.log('==============================');

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
          maxWidth: '90%',
          maxHeight: '90%',
          width: '900px',
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
          {/* Debug Info */}
          <div style={{
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}>
            <h6>🔍 Informations de Debug</h6>
            <div><strong>ID:</strong> {document.id}</div>
            <div><strong>Titre:</strong> {document.title}</div>
            <div><strong>Fichier:</strong> {document.file_name}</div>
            <div><strong>Type:</strong> {document.document_type}</div>
            <div><strong>Taille:</strong> {document.file_size} bytes</div>
            <div><strong>URL Preview:</strong> {previewUrl}</div>
          </div>

          {/* Test des URLs */}
          <div style={{
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#fff3cd',
            borderRadius: '6px'
          }}>
            <h6>🧪 Test des URLs</h6>
            <div style={{ marginBottom: '0.5rem' }}>
              <a 
                href={previewUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ marginRight: '1rem' }}
              >
                🔗 Tester Preview
              </a>
              <a 
                href={downloadUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                🔗 Tester Download
              </a>
            </div>
          </div>

          {/* Tentative d'affichage */}
          <div style={{
            border: '2px solid #007bff',
            borderRadius: '6px',
            overflow: 'hidden',
            minHeight: '400px',
            backgroundColor: '#f8f9fa'
          }}>
            <div style={{
              padding: '1rem',
              backgroundColor: '#007bff',
              color: 'white',
              fontWeight: 'bold'
            }}>
              📺 Tentative d'affichage du document
            </div>
            
            <div style={{ padding: '1rem' }}>
              <p><strong>Prévisualisation du document</strong></p>
              <iframe
                src={previewUrl}
                style={{
                  width: '100%',
                  height: '500px',
                  border: '1px solid #ccc'
                }}
                title="Prévisualisation du document"
                onLoad={() => console.log('✅ Document chargé avec succès')}
                onError={(e) => console.log('❌ Erreur de chargement:', e)}
              />
            </div>
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
            className="btn btn-outline-primary"
            onClick={() => window.open(previewUrl, '_blank')}
          >
            🔗 Ouvrir Preview
          </button>
          <button
            className="btn btn-outline-success"
            onClick={() => window.open(downloadUrl, '_blank')}
          >
            📥 Ouvrir Download
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

export default TestDocumentViewer;
