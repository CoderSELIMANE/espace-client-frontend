import React, { useState } from 'react';
import adminService from '../services/adminService';

const UsersTable = ({
  users,
  currentUser,
  filters,
  onFiltersChange,
  onEditUser,
  onDeleteUser,
  onToggleAdmin,
  onToggleActive
}) => {
  const [sortBy, setSortBy] = useState('date_joined');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return 'fas fa-sort text-muted';
    return sortOrder === 'asc' ? 'fas fa-sort-up text-primary' : 'fas fa-sort-down text-primary';
  };

  const sortedUsers = [...users].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'date_joined' || sortBy === 'last_login') {
      aValue = new Date(aValue || 0);
      bValue = new Date(bValue || 0);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getInitials = (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    return user.email ? user.email.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="fas fa-users me-2"></i>
            Gestion des Utilisateurs
            <span className="badge bg-primary ms-2">{users.length}</span>
          </h5>
        </div>
      </div>

      {/* Filtres */}
      <div className="card-body border-bottom bg-light">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher par email, nom..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <option value="">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="user">Utilisateurs</option>
            </select>
          </div>
          <div className="col-md-2">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => onFiltersChange({ search: '', role: '' })}
            >
              <i className="fas fa-times me-1"></i>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th 
                scope="col" 
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('email')}
              >
                <i className={getSortIcon('email')}></i> Utilisateur
              </th>
              <th scope="col">Rôle</th>
              <th scope="col">Téléphone</th>
              <th scope="col">Documents</th>
              <th
                scope="col"
                className="cursor-pointer user-select-none"
                onClick={() => handleSort('date_joined')}
              >
                <i className={getSortIcon('date_joined')}></i> Inscription
              </th>
              <th scope="col" className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  <i className="fas fa-users fa-2x mb-2 d-block"></i>
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : (
              sortedUsers.map((user) => {
                const roleBadge = adminService.getUserRoleBadge(user.is_staff);
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                          {getInitials(user)}
                        </div>
                        <div>
                          <div className="fw-semibold">{user.email}</div>
                          {(user.first_name || user.last_name) && (
                            <small className="text-muted">
                              {user.first_name} {user.last_name}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={roleBadge.class}>
                        <i className={`${roleBadge.icon} me-1`}></i>
                        {roleBadge.text}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted">
                        {user.phone_number ? (
                          <span>
                            <i className="fas fa-phone me-1"></i>
                            {user.phone_number}
                          </span>
                        ) : (
                          <span className="text-muted fst-italic">Non renseigné</span>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info">
                        {user.documents_count || 0}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted">
                        {adminService.formatDate(user.date_joined)}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex gap-1 justify-content-center">
                        {/* Masquer les actions pour l'utilisateur connecté */}
                        {currentUser && user.id === currentUser.id ? (
                          <span className="text-muted fst-italic small">
                            <i className="fas fa-user-shield me-1"></i>
                            Votre compte
                          </span>
                        ) : (
                          <>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => onEditUser(user)}
                              title="Modifier"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className={`btn btn-sm ${user.is_staff ? 'btn-outline-warning' : 'btn-outline-success'}`}
                              onClick={() => onToggleAdmin(user)}
                              title={user.is_staff ? 'Rétrograder' : 'Promouvoir admin'}
                            >
                              <i className={`fas ${user.is_staff ? 'fa-user-minus' : 'fa-user-plus'}`}></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => onDeleteUser(user)}
                              title="Supprimer"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
