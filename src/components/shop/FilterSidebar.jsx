import { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';

const DEFAULT_FILTERS = {
  priceRange: { min: 0, max: 200 },
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

  /** 🔄 Ogni volta che i filtri cambiano → aggiorna Shop */
  useEffect(() => {
    onFiltersChange && onFiltersChange(filters);
  }, [filters]);

  /** 🔍 SEARCH */
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

  /** MIN */
  const handleMinPrice = (val) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        min: val
      }
    }));
  };

  /** MAX */
  const handleMaxPrice = (val) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        max: val
      }
    }));
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
            name="categories"
            value="series"
            checked={filters.categories.includes('series')}
            onChange={handleFilterChange}
          />
          <label>Serie TV</label>
        </div>

        <div className="filter-option">
          <input
            type="checkbox"
            name="categories"
            value="anime"
            checked={filters.categories.includes('anime')}
            onChange={handleFilterChange}
          />
          <label>Anime</label>
        </div>

        <div className="filter-option">
          <input
            type="checkbox"
            name="categories"
            value="film"
            checked={filters.categories.includes('film')}
            onChange={handleFilterChange}
          />
          <label>Film</label>
        </div>
      </div>

      {/* 💰 PREZZO MIN–MAX */}
      <div className="filter-group">
        <h4>Prezzo</h4>

        <div className="price-inputs">

          <div className="price-input-wrapper">
            <label>Min</label>
            <input
              type="number"
              value={filters.priceRange.min}
              min="0"
              onChange={(e) => handleMinPrice(parseFloat(e.target.value) || 0)}
              className="price-number-input"
            />
          </div>

          <div className="price-input-wrapper">
            <label>Max</label>
            <input
              type="number"
              value={filters.priceRange.max}
              min={filters.priceRange.min}
              onChange={(e) => handleMaxPrice(parseFloat(e.target.value) || 0)}
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
            name="onSale"
            checked={filters.onSale}
            onChange={handleFilterChange}
          />
          <label>Prodotti in Promozione</label>
        </div>

        <div className="filter-option">
          <input
            type="checkbox"
            name="matureContent"
            checked={filters.matureContent}
            onChange={handleFilterChange}
          />
          <label>Contenuti +18</label>
        </div>

        <div className="filter-option">
          <input
            type="checkbox"
            name="accessibility"
            checked={filters.accessibility}
            onChange={handleFilterChange}
          />
          <label>Contenuti accessibili</label>
        </div>
      </div>

    </aside>
  );
}
