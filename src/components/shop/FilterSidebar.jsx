import { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';

const DEFAULT_FILTERS = {
  priceRange: { min: 0, max: 100, current: 100 },
  categories: [],
  matureContent: false,
  accessibility: false,
  onSale: false
};

export default function FilterSidebar({
  searchValue,
  onSearchChange,
  onFiltersChange,
  initialFilters = {}
}) {

  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    ...initialFilters
  });

  /** 🔄 Ogni volta che i filtri cambiano → aggiorna il parent */
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters, false);
    }
  }, [filters]);

  /** 🔍 Ricerca */
  const handleSearchChange = (e) => {
    onSearchChange(e.target.value);
  };

  /** 🟣 Gestione filtri */
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFilters(prev => {
      if (Array.isArray(prev[name])) {
        return {
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter(item => item !== value)
        };
      }

      if (type === "checkbox") {
        return { ...prev, [name]: checked };
      }

      return { ...prev, [name]: value };
    });
  };

  /** Applica filtri */
  const handleApplyFilters = () => {
    if (onFiltersChange) onFiltersChange(filters, true);
  };

  /** Reset filtri */
  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    if (onFiltersChange) onFiltersChange(DEFAULT_FILTERS, true);
  };

  return (
    <aside className="filters-sidebar">

      {/* 🔍 SEARCH */}
      <div className="filter-group">
        <h4>Ricerca</h4>

        <div className="filter-option search-in-filters">
          <FiSearch className="search-icon" />

          <input
            type="text"
            className="search-input"
            placeholder="Cerca per titolo..."
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* 📂 CATEGORIE */}
      <div className="filter-group">
        <h4>Categoria</h4>

        <div className="filter-option">
          <input
            type="checkbox"
            id="cat-series"
            name="categories"
            value="series"
            checked={filters.categories.includes('series')}
            onChange={handleFilterChange}
          />
          <label htmlFor="cat-series">Serie TV</label>
        </div>

        <div className="filter-option">
          <input
            type="checkbox"
            id="cat-anime"
            name="categories"
            value="anime"
            checked={filters.categories.includes('anime')}
            onChange={handleFilterChange}
          />
          <label htmlFor="cat-anime">Anime</label>
        </div>

        <div className="filter-option">
          <input
            type="checkbox"
            id="cat-film"
            name="categories"
            value="film"
            checked={filters.categories.includes('film')}
            onChange={handleFilterChange}
          />
          <label htmlFor="cat-film">Film</label>
        </div>
      </div>

      {/* 💰 FILTRO PREZZO MIN – MAX */}
      <div className="filter-group">
        <h4>Prezzo</h4>

        <div className="price-inputs">

          {/* MIN PRICE */}
          <div className="price-input-wrapper">
            <label htmlFor="price-min">Min</label>
            <input
              type="number"
              id="price-min"
              name="priceMin"
              min="0"
              value={filters.priceRange.min}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setFilters(prev => ({
                  ...prev,
                  priceRange: {
                    ...prev.priceRange,
                    min: value
                  }
                }));
              }}
              className="price-number-input"
            />
          </div>

          {/* MAX PRICE */}
          <div className="price-input-wrapper">
            <label htmlFor="price-max">Max</label>
            <input
              type="number"
              id="price-max"
              name="priceMax"
              min="0"
              value={filters.priceRange.max}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setFilters(prev => ({
                  ...prev,
                  priceRange: {
                    ...prev.priceRange,
                    max: value,
                    current: value
                  }
                }));
              }}
              className="price-number-input"
            />
          </div>

        </div>
      </div>

      {/* ALTRO */}
      <div className="filter-group">
        <h4>Altro</h4>

        <div className="filter-option">
          <input
            type="checkbox"
            id="on-sale"
            name="onSale"
            checked={filters.onSale}
            onChange={handleFilterChange}
          />
          <label htmlFor="on-sale">Prodotti in Promozione</label>
        </div>

        <div className="filter-option">
          <input
            type="checkbox"
            id="mature-content"
            name="matureContent"
            checked={filters.matureContent}
            onChange={handleFilterChange}
          />
          <label htmlFor="mature-content">Contenuti +18</label>
        </div>

        <div className="filter-option">
          <input
            type="checkbox"
            id="accessibility"
            name="accessibility"
            checked={filters.accessibility}
            onChange={handleFilterChange}
          />
          <label htmlFor="accessibility">Contenuti accessibili</label>
        </div>
      </div>

      <button className="apply-filters-btn" onClick={handleApplyFilters}>
        APPLICA FILTRI
      </button>

      <button className="apply-filters-btn reset-filters-btn" onClick={handleResetFilters}>
        AZZERA FILTRI
      </button>

    </aside>
  );
}
