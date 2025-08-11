import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/authService';

const AdvancedStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { state, actions } = useApp();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      actions.showNotification('error', 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeColor = (type) => {
    const colors = {
      'pdf': '#dc3545',
      'planning': '#17a2b8',
      'fiche': '#ffc107',
      'image': '#28a745',
      'other': '#6c757d'
    };
    return colors[type] || '#6c757d';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'pdf': 'fas fa-file-pdf',
      'planning': 'fas fa-calendar',
      'fiche': 'fas fa-file-alt',
      'image': 'fas fa-image',
      'other': 'fas fa-file'
    };
    return icons[type] || 'fas fa-file';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement des statistiques...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="row mb-4">
      {/* Statistiques générales */}
      <div className="col-md-8">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">
              <i className="fas fa-chart-bar me-2"></i>
              Répartition par Type de Document
            </h5>
          </div>
          <div className="card-body">
            {Object.keys(stats.types_distribution).length > 0 ? (
              <div className="row">
                {Object.entries(stats.types_distribution).map(([type, data]) => (
                  <div key={type} className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <div 
                        className="me-3 rounded-circle d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          backgroundColor: getTypeColor(type),
                          color: 'white'
                        }}
                      >
                        <i className={getTypeIcon(type)}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold">{data.label}</span>
                          <span className="badge bg-secondary">{data.count}</span>
                        </div>
                        <div className="progress mt-1" style={{ height: '6px' }}>
                          <div 
                            className="progress-bar" 
                            style={{ 
                              width: `${(data.count / stats.total_documents) * 100}%`,
                              backgroundColor: getTypeColor(type)
                            }}
                          ></div>
                        </div>
                        <small className="text-muted">{formatFileSize(data.size)}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3">
                <i className="fas fa-chart-bar fa-2x text-muted mb-2"></i>
                <p className="text-muted">Aucune donnée à afficher</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Métriques détaillées */}
      <div className="col-md-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">
              <i className="fas fa-info-circle me-2"></i>
              Métriques Détaillées
            </h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">
                  <i className="fas fa-file me-2"></i>
                  Total Documents
                </span>
                <span className="fw-bold">{stats.total_documents}</span>
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">
                  <i className="fas fa-hdd me-2"></i>
                  Espace Total
                </span>
                <span className="fw-bold">{formatFileSize(stats.total_size)}</span>
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">
                  <i className="fas fa-clock me-2"></i>
                  Ajouts Récents
                </span>
                <span className="fw-bold">{stats.recent_uploads}</span>
              </div>
              <small className="text-muted">Cette semaine</small>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">
                  <i className="fas fa-balance-scale me-2"></i>
                  Taille Moyenne
                </span>
                <span className="fw-bold">{formatFileSize(stats.average_file_size)}</span>
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">
                  <i className="fas fa-tags me-2"></i>
                  Types Utilisés
                </span>
                <span className="fw-bold">{Object.keys(stats.types_distribution).length}</span>
              </div>
            </div>

            <hr />

            <div className="text-center">
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={loadStats}
                disabled={loading}
              >
                <i className="fas fa-sync-alt me-2"></i>
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedStats;
