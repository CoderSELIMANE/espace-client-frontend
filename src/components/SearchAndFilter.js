import React from 'react';
import { useApp } from '../contexts/AppContext';

const SearchAndFilter = () => {
  const { state, actions } = useApp();

  const handleSearchChange = (e) => {
    actions.setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    actions.setSearchQuery('');
  };

  return (
    <div className="search-filter-container mb-4">
      {/* Search Bar */}
      <div className="row mb-3">
        <div className="col-md-12">
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              className="form-control search-input"
              placeholder="Rechercher dans vos documents..."
              value={state.searchQuery}
              onChange={handleSearchChange}
            />
            {state.searchQuery && (
              <button
                className="btn btn-link position-absolute"
                style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                onClick={clearSearch}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      {state.searchQuery && (
        <div className="search-results-info">
          <div className="alert alert-info d-flex align-items-center">
            <i className="fas fa-info-circle me-2"></i>
            <span>
              {actions.getFilteredDocuments().length} document(s) trouvé(s)
              {state.searchQuery && (
                <span> pour "<strong>{state.searchQuery}</strong>"</span>
              )}
            </span>
            <button
              className="btn btn-sm btn-outline-primary ms-auto"
              onClick={() => {
                actions.setSearchQuery('');
              }}
            >
              <i className="fas fa-times me-1"></i>
              Effacer la recherche
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;
