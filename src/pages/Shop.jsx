// TODO: Importiamo React e il hook useState per gestire gli stati del componente
import React, { useState } from 'react';
// TODO: Importiamo il file CSS per gli stili di questa pagina
import './Shop.css'; 
// TODO: Importiamo i componenti figli che verranno renderizzati in questa pagina
import SearchSortBar from '../components/SearchSortBar.jsx';
import ResultsGrid from '../components/ResultsGrid.jsx';
import FilterSidebar from '../components/FilterSidebar.jsx'; 

// TODO: Componente principale della pagina Shop - è il "cervello" che coordina tutto
// Questo è un componente PADRE che gestisce gli stati e li passa ai componenti FIGLI
export default function Shop() {
  // TODO: STATI PER RICERCA E ORDINAMENTO
  // useState() crea una variabile di stato che può cambiare nel tempo
  // Quando lo stato cambia, il componente si ri-renderizza automaticamente
  
  // TODO: searchValue = valore corrente dell'input di ricerca (stringa)
  // setSearchValue = funzione per aggiornare searchValue
  // useState('') = valore iniziale è stringa vuota
  const [searchValue, setSearchValue] = useState('');
  
  // TODO: sortValue = criterio di ordinamento selezionato (es. 'recent', 'price-asc')
  // setSort Value = funzione per aggiornare sortValue  
  // useState('recent') = valore iniziale è 'recent' (più recenti)
  const [sortValue, setSortValue] = useState('recent');
  
  // TODO: STATI PER I FILTRI
  // Oggetto complesso che contiene tutti i filtri della sidebar
  // filters = oggetto corrente con tutti i filtri attivi
  // setFilters = funzione per aggiornare l'oggetto filters
  const [filters, setFilters] = useState({
    // TODO: priceRange = oggetto che gestisce il filtro del prezzo
    priceRange: { 
      min: 0,       // Prezzo minimo (valore fisso)
      max: 100,     // Prezzo massimo (valore fisso)
      current: 50   // Valore corrente dello slider (valore iniziale)
    },
    // TODO: categories = array delle categorie selezionate (es. ['anime', 'series'])
    // Inizialmente vuoto = nessuna categoria filtrata
    categories: [],
    // TODO: difficulties = array delle difficoltà selezionate (es. ['high', 'medium'])
    // Inizialmente vuoto = nessuna difficoltà filtrata
    difficulties: []
  });
  
  // TODO: STATI PER I PRODOTTI DAL DATABASE
  // Questi stati gestiranno i dati che arriveranno dal backend
  
  // TODO: products = array dei prodotti da mostrare nella griglia
  // Attualmente è vuoto [] perché non abbiamo ancora il database collegato
  // FUTURO: conterrà oggetti come [{ id: 1, title: "Puzzle", price: 25.99, ... }]
  const [products] = useState([]);
  
  // TODO: loading = boolean che indica se stiamo caricando i dati
  // false = non stiamo caricando (nessuna richiesta API in corso)
  // FUTURO: diventerà true durante le chiamate al database
  const [loading] = useState(false);

  // TODO: FUNZIONE PRINCIPALE - Gestisce i cambiamenti dei filtri dal FilterSidebar
  // Questa è una funzione di callback che viene passata al FilterSidebar
  // Parametri:
  // - newFilters: oggetto con i nuovi filtri aggiornati
  // - isExplicitApply: boolean che indica se l'utente ha cliccato "APPLICA FILTRI"
  const handleFiltersChange = (newFilters, isExplicitApply = false) => {
    // TODO: Aggiorniamo lo stato filters con i nuovi valori ricevuti
    // Questo triggerà un re-render del componente con i filtri aggiornati
    setFilters(newFilters);
    
    // TODO: Log di debug per vedere cosa sta succedendo durante lo sviluppo
    // Questo aiuta a capire se la comunicazione tra componenti funziona
    // DA RIMUOVERE O SOSTITUIRE con chiamata API in produzione
    console.log('Filtri aggiornati:', {
      search: searchValue,      // Valore corrente della ricerca
      sort: sortValue,          // Criterio di ordinamento corrente
      filters: newFilters,      // Nuovi filtri appena ricevuti
      explicitApply: isExplicitApply  // Se è stato cliccato il bottone "APPLICA"
    });
    
    // TODO: Se l'utente ha cliccato esplicitamente "APPLICA FILTRI"
    // Questo è il momento giusto per fare una chiamata al database
    if (isExplicitApply) {
      console.log('➡️ Trigger esplicito - Eseguire fetch prodotti dal database');
      // TODO: FUTURO - Qui andrà la chiamata API:
      // fetchProducts(searchValue, sortValue, newFilters);
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

      {/* TODO: COLONNA DESTRA - Contenuti principali */}
      <main className="results-content">

        {/* TODO: BARRA RICERCA E ORDINAMENTO */}
        {/* Passiamo props per controllare completamente gli input:
             - searchValue/onSearchChange: per l'input di ricerca
             - sortValue/onSortChange: per il select di ordinamento */}
        <SearchSortBar 
          searchValue={searchValue}          // Valore controllato input ricerca
          onSearchChange={setSearchValue}    // Callback per aggiornare ricerca
          sortValue={sortValue}              // Valore controllato select ordinamento
          onSortChange={setSortValue}        // Callback per aggiornare ordinamento
        />

        {/* TODO: GRIGLIA DEI RISULTATI */}
        {/* Passiamo i dati e lo stato di loading per il rendering condizionale */}
        <ResultsGrid 
          products={products}  // Array dei prodotti da mostrare
          loading={loading}    // Stato di caricamento per UX
        />

      </main>
      
    </div>
  );
}

