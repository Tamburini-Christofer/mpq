// Importiamo useState per gestire lo stato locale del componente
import { useState } from 'react';

// todo: Oggetto con i valori iniziali dei filtri
const DEFAULT_FILTERS = {
  priceRange: { min: 0, max: 100, current: 50 }, // todo: Range di prezzo con valore corrente
  categories: [],    // todo: Array vuoto per le categorie selezionate
  difficulties: [], // todo: Array vuoto per le difficoltà selezionate
  matureContent: false, // todo: Booleano per contenuti +18
  accessibility: false // todo: Booleano per accessibilità
};

// todo: Componente sidebar dei filtri che riceve funzioni dal parent
export default function FilterSidebar({ 
  onFiltersChange, // todo: Funzione callback per inviare i filtri al componente padre
  initialFilters = {} // todo: Filtri iniziali opzionali (default oggetto vuoto)
}) {
  // todo: Stato locale che combina filtri di default con quelli iniziali
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS, // todo: Spread dei filtri di default
    ...initialFilters   // todo: Sovrascrivi con eventuali filtri iniziali
  });

  // todo: Funzione che gestisce tutti i cambiamenti dei filtri
  const handleFilterChange = (e) => {
    // todo: Estrai proprietà dall'elemento che ha scatenato l'evento
    const { name, value, type, checked } = e.target;

    // todo: Aggiorna lo stato usando la funzione precedente per evitare problemi di concorrenza
    setFilters((prevFilters) => {
      // todo: Controlla se il campo è un array (per categorie e difficoltà)
      if (Array.isArray(prevFilters[name])) {
        return {
          ...prevFilters, // todo: Mantieni tutti gli altri filtri
          [name]: checked
            ? [...prevFilters[name], value] // todo: Se checked, aggiungi il valore all'array
            : prevFilters[name].filter((item) => item !== value) // todo: Se unchecked, rimuovi il valore dall'array
        };
      }

      // todo: Gestione speciale per lo slider del prezzo
      if (name === 'priceRange') {
        return {
          ...prevFilters,
          priceRange: { ...prevFilters.priceRange, current: parseInt(value) } // todo: Aggiorna solo il valore corrente
        };
      }

      // todo: Gestione per checkbox semplici (true/false)
      if (type === 'checkbox') {
        return { ...prevFilters, [name]: checked }; // todo: Usa il valore checked per booleani
      }

      // todo: Fallback per input di testo normale
      return { ...prevFilters, [name]: value };
    });
  };

  // todo: Funzione che calcola lo stile dinamico dello slider
  const getSliderStyle = () => {
    // todo: Estrai min, max e current dal range di prezzo
    const { min, max, current } = filters.priceRange;
    // todo: Calcola la percentuale di riempimento dello slider
    const percentage = ((current - min) / (max - min)) * 100;
    
    // todo: Ritorna un oggetto style con gradiente CSS dinamico
    return {
      background: `linear-gradient(to right, #d4af37 0%, #d4af37 ${percentage}%, #444 ${percentage}%, #444 100%)`
    };
  };

  // todo: Funzione chiamata quando si clicca "Applica filtri"
  const handleApplyFilters = () => {
    // todo: Se esiste la funzione callback, chiamala passando i filtri attuali
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  };

  return (
    // todo: Container principale della sidebar dei filtri
    <aside className="filters-sidebar">
      {/* todo: Titolo principale della sezione filtri */}
      <h3 className="filters-title">FILTRI</h3>

      {/* todo: Sezione filtri per categoria */}
      <div className="filter-group">
        <h4>Categoria</h4>
        {/* todo: Checkbox per Serie TV */}
        <div className="filter-option">
          <input 
            type="checkbox" 
            id="cat-series" 
            name="categories" // todo: Nome del campo nello stato
            value="series" // todo: Valore aggiunto all'array quando selezionato
            checked={filters.categories.includes('series')} // todo: Controlla se "series" è nell'array
            onChange={handleFilterChange} // todo: Chiama la funzione quando cambia
          />
          <label htmlFor="cat-series">Serie TV</label>
        </div>
        {/* todo: Checkbox per Anime */}
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
        {/* todo: Checkbox per Film */}
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

      {/* todo: Sezione filtro prezzo con slider */}
      <div className="filter-group">
        <h4>Prezzo</h4>
        <div className="price-slider-container">
          <div className="price-range-wrapper">
            {/* todo: Slider range con stile dinamico */}
            <input 
              type="range" 
              name="priceRange"
              min={filters.priceRange.min} // todo: Valore minimo dal range
              max={filters.priceRange.max} // todo: Valore massimo dal range
              value={filters.priceRange.current} // todo: Valore corrente del slider
              onChange={handleFilterChange}
              style={getSliderStyle()} // todo: Applica lo stile calcolato dinamicamente
              className="price-slider" 
            />
          </div>
          {/* todo: Etichette che mostrano min, current e max del prezzo */}
          <div className="price-labels">
            <span className="price-label">€{filters.priceRange.min}</span>
            <span className="price-label active">€{filters.priceRange.current}</span>
            <span className="price-label">€{filters.priceRange.max}</span>
          </div>
        </div>
      </div>

      {/* todo: Sezione filtri difficoltà con loop dinamico */}
      <div className="filter-group">
        <h4>Difficoltà</h4>
        {/* todo: Crea checkbox per ogni livello usando map */}
        {['high', 'medium', 'low'].map((level) => (
          <div key={level} className="filter-option">
            <input 
              type="checkbox" 
              id={`diff-${level}`} // todo: ID unico generato dinamicamente
              name="difficulties"
              value={level}
              checked={filters.difficulties.includes(level)}
              onChange={handleFilterChange}
            />
            <label htmlFor={`diff-${level}`}>
              {/* todo: Operatore ternario per tradurre i valori in italiano */}
              {level === 'high' ? 'Difficile' : level === 'medium' ? 'Media' : 'Facile'}
            </label>
          </div>
        ))}
      </div>

      {/* todo: Sezione altri filtri (contenuti +18 e accessibilità) */}
      <div className="filter-group">
        <h4>Altro</h4>
        {/* todo: Checkbox per contenuti maturi */}
        <div className="filter-option">
          <input 
            type="checkbox" 
            id="mature-content" 
            name="matureContent" // todo: Nome del campo booleano
            checked={filters.matureContent} // todo: Stato del checkbox
            onChange={handleFilterChange}
          />
          <label htmlFor="mature-content">Contenuti +18</label>
        </div>
        {/* todo: Checkbox per accessibilità */}
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
      
      {/* todo: Pulsante per applicare tutti i filtri */}
      <button 
        className="apply-filters-btn"
        onClick={handleApplyFilters} // todo: Chiama funzione quando cliccato
      >
        APPLICA FILTRI
      </button>
    </aside>
  );
}