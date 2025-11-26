import React from 'react';
import '../../styles/components/Pagination.css';
import CustomSelect from '../../components/common/CustomSelect';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  hasNextPage, 
  hasPrevPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50]
}) => {
  // Genera array di pagine da mostrare
  const getVisiblePages = () => {
    const delta = 2; // Numero di pagine da mostrare prima e dopo la pagina corrente
    const range = [];
    const rangeWithDots = [];

    // Calcola il range di pagine da mostrare
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    // Aggiungi sempre la prima pagina
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    // Aggiungi il range calcolato
    rangeWithDots.push(...range);

    // Aggiungi sempre l'ultima pagina
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>
          Visualizzando {startItem}-{endItem} di {totalItems} prodotti
        </span>
        
        <div className="items-per-page">
          <label htmlFor="items-select">Prodotti per pagina:</label>
          <CustomSelect
            id="items-select"
            ariaLabel="Seleziona prodotti per pagina"
            value={itemsPerPage}
            options={itemsPerPageOptions}
            onChange={(v) => {
              const parsed = parseInt(v);
              onItemsPerPageChange(parsed);
              // after changing items per page, go to top so user sees updated list
              try {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } catch {
                window.scrollTo(0, 0);
              }
            }}
            placeholder={String(itemsPerPage)}
          />
        </div>
      </div>

      <div className="pagination-controls">
        {/* Pulsante Previous */}
        <button 
          className={`pagination-btn ${!hasPrevPage ? 'disabled' : ''}`}
          onClick={() => hasPrevPage && onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
        >
          ← Precedente
        </button>

        {/* Numeri di pagina */}
        <div className="pagination-numbers">
          {getVisiblePages().map((page, index) => (
            page === '...' ? (
              <span key={`dots-${index}`} className="pagination-dots">
                ...
              </span>
            ) : (
              <button
                key={page}
                className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Pulsante Next */}
        <button 
          className={`pagination-btn ${!hasNextPage ? 'disabled' : ''}`}
          onClick={() => hasNextPage && onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
        >
          Successiva →
        </button>
      </div>
    </div>
  );
};

export default Pagination;