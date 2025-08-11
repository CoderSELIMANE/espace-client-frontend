import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import adminService from '../services/adminService';

const ModernNavbar = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { state } = useApp();
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await adminService.checkAdminStatus();
      setIsAdmin(adminStatus);
    };
    checkAdminStatus();
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  const goToAdmin = () => {
    navigate('/admin-panel');
    setShowUserMenu(false);
  };

  const getInitials = (user) => {
    if (!user) return 'U';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || user.email.charAt(0).toUpperCase();
  };

  return (
    <nav className="modern-navbar enhanced-navbar">
      <div className="navbar-container">
        {/* Logo et Brand */}
        <div className="navbar-brand-section">
          <div className="brand-logo">
            <div className="logo-icon">
              <i className="fas fa-cloud-upload-alt"></i>
            </div>
            <div className="brand-text">
              <span className="brand-name">Espace Client</span>
              <span className="brand-tagline">Gestion documentaire</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="navbar-nav">
          {/* Navigation links supprimés */}
        </div>

        {/* Actions et Profil */}
        <div className="navbar-actions">
          {/* User Menu */}
          <div className="user-menu-container">
            <button 
              className="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {getInitials(state.user)}
              </div>
              <div className="user-info">
                <span className="user-name">
                  {state.user?.full_name || state.user?.email || 'Utilisateur'}
                </span>
                <span className="user-role">Utilisateur</span>
              </div>
              <i className={`fas fa-chevron-${showUserMenu ? 'up' : 'down'} chevron-icon`}></i>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="user-avatar large">
                    {getInitials(state.user)}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{state.user?.full_name || 'Utilisateur'}</div>
                    <div className="user-email">{state.user?.email}</div>
                  </div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <div className="dropdown-menu-items">
                  <button className="dropdown-item" onClick={() => navigate('/profile')}>
                    <i className="fas fa-user"></i>
                    <span>Mon Profil</span>
                  </button>
                  {isAdmin && (
                    <button className="dropdown-item" onClick={goToAdmin}>
                      <i className="fas fa-shield-alt"></i>
                      <span>Administration</span>
                    </button>
                  )}
                  <button className="dropdown-item">
                    <i className="fas fa-question-circle"></i>
                    <span>Aide</span>
                  </button>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="breadcrumb-container">
        <div className="breadcrumb">
          <span className="breadcrumb-item active">
            <i className="fas fa-home"></i>
            Espace Client
          </span>
        </div>
      </div>
    </nav>
  );
};

export default ModernNavbar;
