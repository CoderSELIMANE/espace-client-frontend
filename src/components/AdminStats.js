import React from 'react';
import '../styles/AdminPanel.css';

const AdminStats = ({ stats }) => {
  const statsCards = [
    {
      title: 'Total Utilisateurs',
      value: stats.total_users || 0,
      icon: 'fas fa-users',
      color: 'primary',
      description: 'Utilisateurs enregistrés',
      trend: stats.recent_users ? `+${stats.recent_users} cette semaine` : null
    },
    {
      title: 'Administrateurs',
      value: stats.admin_users || 0,
      icon: 'fas fa-user-shield',
      color: 'danger',
      description: 'Comptes administrateur',
      percentage: stats.total_users > 0 ? ((stats.admin_users / stats.total_users) * 100).toFixed(1) : 0
    },
    {
      title: 'Utilisateurs Actifs',
      value: stats.active_users || 0,
      icon: 'fas fa-check-circle',
      color: 'success',
      description: 'Comptes actifs',
      percentage: stats.total_users > 0 ? ((stats.active_users / stats.total_users) * 100).toFixed(1) : 0
    },
    {
      title: 'Documents',
      value: stats.total_documents || 0,
      icon: 'fas fa-file-alt',
      color: 'info',
      description: 'Documents partagés',
      trend: stats.recent_documents ? `+${stats.recent_documents} cette semaine` : null
    }
  ];

  return (
    <div className="row mb-3">
      {statsCards.map((stat, index) => (
        <div key={index} className="col-lg-3 col-md-6 mb-3">
          <div 
            className="admin-card h-100 stat-card" 
            style={{ 
              background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)', 
              color: 'white', 
              minHeight: 120,
              borderRadius: '15px',
              padding: '15px',
              boxShadow: '0 4px 15px rgba(39, 174, 96, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="admin-card-body d-flex align-items-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center me-2" style={{ background: 'rgba(255,255,255,0.15)', width: 40, height: 40 }}>
                <i className={`${stat.icon}`} style={{ color: 'white', fontSize: 20 }}></i>
              </div>
              <div className="flex-grow-1">
                <h6 className="mb-1 small text-uppercase fw-semibold" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                  {stat.title}
                </h6>
                <h4 className="mb-0 fw-bold stat-value" style={{ color: 'white', fontSize: '1.5rem' }}>
                  {stat.value.toLocaleString()}
                </h4>
                <small style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>{stat.description}</small>
              </div>
            </div>
            {/* Footer avec pourcentage ou tendance */}
            <div className="card-footer bg-transparent border-0 pt-0">
              {stat.percentage !== undefined && (
                <div className="d-flex align-items-center justify-content-between">
                  <div className="progress flex-grow-1 me-2" style={{ height: '4px', background: 'rgba(255,255,255,0.2)' }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${stat.percentage}%`, background: 'white' }}
                    ></div>
                  </div>
                  <small className="admin-badge admin-badge-success" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                    {stat.percentage}%
                  </small>
                </div>
              )}
              {stat.trend && (
                <small className="admin-badge admin-badge-success ms-2" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                  <i className="fas fa-arrow-up me-1"></i>
                  {stat.trend}
                </small>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;
