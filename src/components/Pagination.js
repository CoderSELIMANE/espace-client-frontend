import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  onItemsPerPageChange 
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="d-flex justify-content-between align-items-center mt-4">
      {/* Informations sur les éléments */}
      <div className="d-flex align-items-center">
        <span className="text-muted me-3">
          Affichage de {startItem} à {endItem} sur {totalItems} documents
        </span>
        
        {/* Sélecteur d'éléments par page */}
        <div className="d-flex align-items-center">
          <label htmlFor="itemsPerPage" className="form-label me-2 mb-0">
            Par page :
          </label>
          <select
            id="itemsPerPage"
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              onItemsPerPageChange(value === 'all' ? totalItems : parseInt(value));
            }}
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={20}>20</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
            <option value="all">Tous ({totalItems})</option>
          </select>
        </div>
      </div>

      {/* Navigation de pagination */}
      <nav aria-label="Navigation des pages">
        <ul className="pagination pagination-sm mb-0">
          {/* Bouton Précédent */}
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Page précédente"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
          </li>

          {/* Numéros de page */}
          {getVisiblePages().map((page, index) => (
            <li key={index} className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}>
              {page === '...' ? (
                <span className="page-link">...</span>
              ) : (
                <button
                  className="page-link"
                  onClick={() => onPageChange(page)}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </li>
          ))}

          {/* Bouton Suivant */}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Page suivante"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
