import React from 'react';

const ConfirmModal = ({ 
  show, 
  title = 'Confirmation', 
  message, 
  onConfirm, 
  onCancel, 
  confirmButtonText = 'Confirmer',
  cancelButtonText = 'Annuler',
  confirmButtonClass = 'btn-primary',
  icon = 'fas fa-question-circle'
}) => {
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
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ 
        margin: 'auto',
        maxWidth: '500px', 
        width: '100%',
        transform: 'none'
      }}>
        <div className="modal-content" style={{ 
          borderRadius: '15px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          border: 'none'
        }}>
          <div className="modal-header" style={{ borderRadius: '15px 15px 0 0', borderBottom: '1px solid #dee2e6' }}>
            <h5 className="modal-title">
              <i className={`${icon} me-2`} style={{ color: '#27ae60' }}></i>
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
              style={{ 
                fontSize: '1.2rem',
                opacity: 0.8,
                transition: 'opacity 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.8'}
            ></button>
          </div>
          
          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>
          
          <div className="modal-footer" style={{ borderRadius: '0 0 15px 15px', borderTop: '1px solid #dee2e6' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              style={{ borderRadius: '8px', padding: '8px 20px' }}
            >
              {cancelButtonText}
            </button>
            <button
              type="button"
              className={`btn ${confirmButtonClass}`}
              onClick={onConfirm}
              style={{ borderRadius: '8px', padding: '8px 20px' }}
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
