// TODO: Importiamo React per creare componenti
import React from 'react';
// TODO: Importiamo il file CSS per gli stili di questa pagina
import '../../styles/components/ShopComponent.css'; 
// TODO: Importiamo i componenti figli che verranno renderizzati in questa pagina
import FilterSidebar from './FilterSidebar.jsx'; 

// TODO: Componente principale della pagina Shop - è il "cervello" che coordina tutto
// Questo è un componente PADRE che gestisce gli stati e li passa ai componenti FIGLI
export default function Shop({ filters, onFiltersChange }) {

  // TODO: FUNZIONE PRINCIPALE - Gestisce i cambiamenti dei filtri dal FilterSidebar
  // Questa è una funzione di callback che viene passata al FilterSidebar
  // Parametri:
  // - newFilters: oggetto con i nuovi filtri aggiornati
  // - isExplicitApply: boolean che indica se l'utente ha cliccato "APPLICA FILTRI"
  const handleFiltersChange = (newFilters, isExplicitApply = false) => {
    // TODO: Applica i filtri solo quando l'utente clicca "APPLICA FILTRI"
    if (isExplicitApply && onFiltersChange) {
      onFiltersChange(newFilters);
      
      // TODO: Log di debug per vedere cosa sta succedendo durante lo sviluppo
      console.log('Filtri applicati:', newFilters);
    }
  };

  // TODO: FUNZIONI FUTURE PER IL DATABASE (attualmente commentate)
  
  // TODO: useEffect per fare fetch automatico quando cambiano search/sort
  // useEffect si attiva automaticamente quando le dipendenze [searchValue, sortValue] cambiano
  // Questo significa che ogni volta che l'utente digita o cambia ordinamento,
  // verrà fatta automaticamente una nuova ricerca nel database
  // useEffect(() => {
  //   fetchProducts(searchValue, sortValue, filters);
  // }, [searchValue, sortValue]);

  // TODO: Funzione asincrona per recuperare i prodotti dal backend
  // Questa funzione farà una chiamata HTTP al server con i parametri di ricerca
  // const fetchProducts = async (search, sort, filterParams) => {
  //   setLoading(true);  // Mostra loading spinner
  //   try {
  //     // Chiamata API al backend con tutti i parametri
  //     const response = await api.getProducts({ search, sort, ...filterParams });
  //     setProducts(response.data);  // Aggiorna la lista prodotti
  //   } catch (error) {
  //     console.error('Errore fetch prodotti:', error);
  //     // TODO: Gestire errori (mostrare messaggio all'utente)
  //   } finally {
  //     setLoading(false);  // Nasconde loading spinner
  //   }
  // };

  // TODO: RENDERING DEL COMPONENTE
  // return restituisce la struttura JSX della pagina
  return (
    // TODO: Container principale della pagina shop con layout a due colonne
    <div className="shop-container"> 

      {/* TODO: COLONNA SINISTRA - Filtri */}
      {/* Passiamo props al FilterSidebar per la comunicazione bidirezionale:
           - onFiltersChange: callback per ricevere i cambiamenti dei filtri
           - initialFilters: stato attuale dei filtri per sincronizzazione */}
      <FilterSidebar 
        onFiltersChange={handleFiltersChange}  // Funzione che riceve i filtri aggiornati
        initialFilters={filters}              // Stato corrente per sincronizzare i valori
      />
      
    </div>
  );
}
