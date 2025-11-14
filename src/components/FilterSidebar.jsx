import { useState, useEffect } from 'react';

export default function FilterSidebar({ 
  onFiltersChange,
  initialFilters = {
    priceRange: { min: 0, max: 100, current: 50 },
    categories: [],
    difficulties: []
  }
}) {
  // Stati per gestire tutti i filtri
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange);
  const [selectedCategories, setSelectedCategories] = useState(initialFilters.categories);
  const [selectedDifficulties, setSelectedDifficulties] = useState(initialFilters.difficulties);

  // Funzione per aggiornare il gradiente dello slider
  const updateSliderBackground = (value, minVal = 0, maxVal = 100) => {
    const percentage = ((value - minVal) / (maxVal - minVal)) * 100;
    const slider = document.getElementById('price-range');
    if (slider) {
      slider.style.background = `linear-gradient(to right, #d4af37 0%, #d4af37 ${percentage}%, #444 ${percentage}%, #444 100%)`;
    }
  };

  // Gestisce il cambiamento dello slider
  const handlePriceChange = (e) => {
    const newValue = parseInt(e.target.value);
    const newPriceRange = { ...priceRange, current: newValue };
    setPriceRange(newPriceRange);
    updateSliderBackground(newValue, priceRange.min, priceRange.max);
    
    // Notifica il cambiamento al componente padre
    if (onFiltersChange) {
      onFiltersChange({
        priceRange: newPriceRange,
        categories: selectedCategories,
        difficulties: selectedDifficulties
      });
    }
  };

  // Gestisce il cambiamento delle categorie
  const handleCategoryChange = (categoryId) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(newCategories);
    
    if (onFiltersChange) {
      onFiltersChange({
        priceRange,
        categories: newCategories,
        difficulties: selectedDifficulties
      });
    }
  };

  // Gestisce il cambiamento delle difficoltà
  const handleDifficultyChange = (difficultyId) => {
    const newDifficulties = selectedDifficulties.includes(difficultyId)
      ? selectedDifficulties.filter(id => id !== difficultyId)
      : [...selectedDifficulties, difficultyId];
    
    setSelectedDifficulties(newDifficulties);
    
    if (onFiltersChange) {
      onFiltersChange({
        priceRange,
        categories: selectedCategories,
        difficulties: newDifficulties
      });
    }
  };

  // Applica tutti i filtri esplicitamente
  const handleApplyFilters = () => {
    if (onFiltersChange) {
      onFiltersChange({
        priceRange,
        categories: selectedCategories,
        difficulties: selectedDifficulties
      }, true); // true indica applicazione esplicita
    }
  };

  // Aggiorna il gradiente al mount del componente e quando cambia priceRange
  useEffect(() => {
    updateSliderBackground(priceRange.current, priceRange.min, priceRange.max);
  }, [priceRange]);

  return (
    <aside className="filters-sidebar">
      <h3 className="filters-title">FILTRI</h3>

      {/* Gruppo Categoria */}
      <div className="filter-group">
        <h4>Categoria</h4>
        <div className="filter-option">
          <input 
            type="checkbox" 
            id="cat-series" 
            name="cat-series"
            checked={selectedCategories.includes('series')}
            onChange={() => handleCategoryChange('series')}
          />
          <label htmlFor="cat-series">Serie TV</label>
        </div>
        <div className="filter-option">
          <input 
            type="checkbox" 
            id="cat-anime" 
            name="cat-anime"
            checked={selectedCategories.includes('anime')}
            onChange={() => handleCategoryChange('anime')}
          />
          <label htmlFor="cat-anime">Anime</label>
        </div>
        <div className="filter-option">
          <input 
            type="checkbox" 
            id="cat-videogames" 
            name="cat-videogames"
            checked={selectedCategories.includes('videogames')}
            onChange={() => handleCategoryChange('videogames')}
          />
          <label htmlFor="cat-videogames">Videogiochi</label>
        </div>
        {/* ... Aggiungi altre categorie */}
      </div>

      {/* Gruppo Prezzo */}
      <div className="filter-group">
        <h4>Prezzo</h4>
        <div className="price-slider-container">
          <div className="price-range-wrapper">
            <input 
              type="range" 
              min={priceRange.min}
              max={priceRange.max}
              value={priceRange.current}
              onChange={handlePriceChange}
              className="price-slider" 
              id="price-range"
            />
          </div>
          <div className="price-labels">
            <span className="price-label">€{priceRange.min}</span>
            <span className="price-label">€{priceRange.current}</span>
            <span className="price-label">€{priceRange.max}</span>
          </div>
        </div>
      </div>

      {/* Gruppo Difficoltà */}
      <div className="filter-group">
        <h4>Difficoltà</h4>
        <div className="filter-option">
          <input 
            type="checkbox" 
            id="diff-high" 
            name="diff-high"
            checked={selectedDifficulties.includes('high')}
            onChange={() => handleDifficultyChange('high')}
          />
          <label htmlFor="diff-high">Difficile</label>
        </div>
        <div className="filter-option">
          <input 
            type="checkbox" 
            id="diff-medium" 
            name="diff-medium"
            checked={selectedDifficulties.includes('medium')}
            onChange={() => handleDifficultyChange('medium')}
          />
          <label htmlFor="diff-medium">Media</label>
        </div>
        <div className="filter-option">
          <input 
            type="checkbox" 
            id="diff-low" 
            name="diff-low"
            checked={selectedDifficulties.includes('low')}
            onChange={() => handleDifficultyChange('low')}
          />
          <label htmlFor="diff-low">Facile</label>
        </div>
        {/* altre opzioni */}
      </div>
      
      <button 
        className="apply-filters-btn"
        onClick={handleApplyFilters}
      >
        APPLICA FILTRI
      </button>
    </aside>
  );
}