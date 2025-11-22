// TODO: Importiamo React per creare componenti
import React from 'react';
// TODO: Importiamo il file CSS per gli stili di questa pagina
import '../../styles/components/ShopComponent.css';
// TODO: Importiamo i componenti figli
import FilterSidebar from './FilterSidebar.jsx';

// TODO: Componente principale della pagina Shop
export default function Shop({ 
  filters, 
  onFiltersChange,

  /** ➕ AGGIUNTA PER LA SEARCH */
  searchValue,
  onSearchChange
}) {

  // TODO: Funzione che gestisce i cambiamenti dei filtri
  const handleFiltersChange = (newFilters, isExplicitApply = false) => {
    if (isExplicitApply && onFiltersChange) {
      onFiltersChange(newFilters);
      console.log('Filtri applicati:', newFilters);
    }
  };

  return (
    <div className="shop-container">

      {/* COLONNA FILTRI */}
      <FilterSidebar
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}

        /** ➕ PASSIAMO LA SEARCH ALLA SIDEBAR */
        searchValue={searchValue}
        onSearchChange={onSearchChange}
      />
      
    </div>
  );
}
