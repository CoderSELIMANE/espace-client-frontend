import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useApp } from '../contexts/AppContext';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const goToDashboard = () => {
    navigate('/dashboard');
    setIsDropdownOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getInitials = (user) => {
    if (!user) return 'A';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return user.email ? user.email.charAt(0).toUpperCase() : 'A';
  };

  return (
    <nav className="admin-navbar navbar navbar-expand-lg shadow-sm">
      <div className="container-fluid">
        {/* Brand */}
        <div className="navbar-brand d-flex align-items-center">
          <i className="fas fa-shield-alt me-2" style={{ color: '#27ae60' }}></i>
          <div>
            <span className="fw-bold" style={{ color: 'white' }}>Administration</span>
            <small className="d-block text-light opacity-75" style={{ fontSize: '0.75rem' }}>
              Panneau de contrôle
            </small>
          </div>
        </div>
        {/* Toggle button for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbar"
          aria-controls="adminNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        {/* Navigation items */}
        <div className="collapse navbar-collapse" id="adminNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <span className="nav-link active" style={{ color: 'white' }}>
                <i className="fas fa-users me-1"></i>
                Utilisateurs
              </span>
            </li>
          </ul>
          {/* User menu */}
          <div className="d-flex align-items-center">
            <div className="dropdown" style={{ position: 'relative', zIndex: 1001 }}>
              <button
                className="admin-btn admin-btn-success dropdown-toggle d-flex align-items-center"
                type="button"
                id="adminUserDropdown"
                onClick={toggleDropdown}
                style={{ background: 'linear-gradient(45deg, #27ae60, #2ecc71)', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '18px', boxShadow: '0 4px 16px rgba(39,174,96,0.15)' }}
              >
                <div className="me-2 avatar-circle" style={{ background: 'linear-gradient(45deg, #27ae60, #2ecc71)', color: 'white', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(39,174,96,0.12)' }}>
                  {getInitials(state.user)}
                </div>
                <div className="text-start">
                  <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'white', lineHeight: 1 }}>
                    {state.user?.first_name && state.user?.last_name 
                      ? `${state.user.first_name} ${state.user.last_name}`
                      : state.user?.email || 'Administrateur'
                    }
                  </div>
                  <small className="text-light opacity-75" style={{ fontSize: '0.85rem' }}>Administrateur</small>
                </div>
              </button>
              {isDropdownOpen && (
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="adminUserDropdown" style={{ 
                  borderRadius: '16px', 
                  boxShadow: '0 8px 32px rgba(39,174,96,0.13)', 
                  minWidth: 220,
                  zIndex: 99999,
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  border: '1px solid rgba(39,174,96,0.1)',
                  backgroundColor: 'white',
                  transform: 'none !important',
                  display: 'block'
                }}>
                <li>
                  <button className="dropdown-item" onClick={goToDashboard} style={{ 
                    padding: '12px 16px', 
                    border: 'none', 
                    background: 'transparent',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background-color 0.2s ease'
                  }}>
                    <i className="fas fa-home me-2" style={{ color: '#27ae60' }}></i>
                    Retour au Dashboard
                  </button>
                </li>
                <li><hr className="dropdown-divider" style={{ margin: '8px 0', borderColor: 'rgba(39,174,96,0.1)' }} /></li>
                <li>
                  <button className="dropdown-item" onClick={handleProfileClick} style={{ 
                    padding: '12px 16px', 
                    border: 'none', 
                    background: 'transparent',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background-color 0.2s ease'
                  }}>
                    <i className="fas fa-user-cog me-2" style={{ color: '#27ae60' }}></i>
                    Mon Profil
                  </button>
                </li>
                <li><hr className="dropdown-divider" style={{ margin: '8px 0', borderColor: 'rgba(39,174,96,0.1)' }} /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout} style={{ 
                    padding: '12px 16px', 
                    border: 'none', 
                    background: 'transparent',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background-color 0.2s ease'
                  }}>
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Déconnexion
                  </button>
                </li>
              </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
