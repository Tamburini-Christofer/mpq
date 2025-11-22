import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

export default function SearchSortBar({ sortValue, onSortChange }) {
  return (
    <div className="search-sort-bar">

      <div className="sort-wrapper">
        <label htmlFor="sort-by">Ordina per:</label>

        <div className="select-container">
          <select
            id="sort-by"
            name="sort-by"
            className="sort-select"
            value={sortValue}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="recent">Più Recenti</option>
            <option value="discount-desc">Sconto (Maggiore)</option>
            <option value="price-asc">Prezzo (Crescente)</option>
            <option value="price-desc">Prezzo (Decrescente)</option>
            <option value="name-asc">Nome (A-Z)</option>
            <option value="name-desc">Nome (Z-A)</option>
            <option value="rating-asc">Valutazione (Bassa - Alta)</option>
            <option value="rating-desc">Valutazione (Alta - Bassa)</option>
          </select>

          <FiChevronDown className="select-icon" />
        </div>
      </div>

    </div>
  );
}
