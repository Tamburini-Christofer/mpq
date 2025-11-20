// TODO: Importiamo React per creare componenti
import React from 'react';
// TODO: Importiamo icone specifiche dal pacchetto react-icons/fi (Feather Icons)
// FiSearch = icona lente di ingrandimento per la ricerca
// FiChevronDown = icona freccia giù per il dropdown
import { FiSearch, FiChevronDown } from 'react-icons/fi';

// TODO: Componente funzionale che gestisce la barra di ricerca e ordinamento
// Riceve 4 props dal componente padre (Shop):
// - searchValue: il valore corrente dell'input di ricerca (stringa)
// - onSearchChange: funzione callback che viene chiamata quando l'utente digita
// - sortValue: il valore corrente del select ordinamento (es. 'recent', 'price-asc')
// - onSortChange: funzione callback chiamata quando l'utente cambia ordinamento
export default function SearchSortBar({ 
  searchValue, 
  onSearchChange, 
  sortValue, 
  onSortChange 
}) {
  // TODO: Il return restituisce il JSX (struttura HTML-like) del componente
  return (
    // TODO: Contenitore principale della barra ricerca e ordinamento
    <div className="search-sort-bar">
      
      {/* TODO: Sezione RICERCA - contiene icona + input di testo */}
      <div className="search-wrapper">
        {/* TODO: Icona lente di ingrandimento - solo decorativa, non cliccabile */}
        <FiSearch className="search-icon" />
        {/* TODO: Input di ricerca controllato (controlled component)
             - type="text": campo di testo normale
             - placeholder: testo che appare quando è vuoto
             - className: per applicare stili CSS
             - value={searchValue}: il valore è controllato dal componente padre
             - onChange: quando l'utente digita, chiama onSearchChange con il nuovo valore */}
        <input 
          type="text" 
          placeholder="Cerca per titolo, categoria..." 
          className="search-input"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* TODO: Sezione ORDINAMENTO - contiene label + select dropdown */}
      <div className="sort-wrapper">
        {/* TODO: Label collegata al select tramite htmlFor="sort-by" 
             Quando clicchi la label, si apre automaticamente il select */}
        <label htmlFor="sort-by">Ordina per:</label>
        
        {/* TODO: Container del select con icona personalizzata */}
        <div className="select-container">
          {/* TODO: Select dropdown controllato per scegliere l'ordinamento
               - id="sort-by": collegato alla label sopra
               - name="sort-by": nome del campo per i form
               - className: per applicare stili CSS personalizzati
               - value={sortValue}: valore controllato dal componente padre
               - onChange: quando cambia selezione, chiama onSortChange */}
          <select 
            id="sort-by" 
            name="sort-by" 
            className="sort-select"
            value={sortValue}
            onChange={(e) => onSortChange(e.target.value)}
          >
            {/* TODO: Opzioni del dropdown - ogni option ha un value che viene passato a onSortChange */}
            {/* TODO: 'recent' = ordinamento predefinito per articoli più recenti */}
            <option value="recent">Più Recenti</option>
            {/* TODO: 'discount-desc' = sconto decrescente (maggiore sconto prima) */}
            <option value="discount-desc">Sconto (Maggiore)</option>
            {/* TODO: 'price-asc' = prezzo crescente (dal più economico al più caro) */}
            <option value="price-asc">Prezzo (Crescente)</option>
            {/* TODO: 'price-desc' = prezzo decrescente (dal più caro al più economico) */}
            <option value="price-desc">Prezzo (Decrescente)</option>
            {/* TODO: 'name-asc' = nome alfabetico A-Z */}
            <option value="name-asc">Nome (A-Z)</option>
            {/* TODO: 'name-desc' = nome alfabetico Z-A */}
            <option value="name-desc">Nome (Z-A)</option>
            {/* TODO: 'rating-asc' = valutazione dal più basso al più alto */}
            <option value="rating-asc">Valutazione (Bassa - Alta)</option>
            {/* TODO: 'rating-desc' = valutazione dal più alto al più basso */}
            <option value="rating-desc">Valutazione (Alta - Bassa)</option>
          </select>
          {/* TODO: Icona freccia giù decorativa per il select - migliora la UX */}
          <FiChevronDown className="select-icon" />
        </div>
      </div>
    </div>
  );
}

/* TODO: COME FUNZIONA LA COMUNICAZIONE:
   1. L'utente digita nell'input → onChange scatta → onSearchChange(nuovoValore)
   2. Il componente padre (Shop) riceve il nuovo valore → aggiorna searchValue
   3. Il nuovo searchValue viene passato di nuovo a questo componente come prop
   4. L'input mostra il valore aggiornato (controlled component)
   
   Stesso processo per il select ordinamento con onSortChange e sortValue.
   
   VANTAGGI:
   - Single source of truth (una sola fonte di verità per ogni dato)
   - Il componente padre controlla completamente lo stato
   - Facile da debuggare e testare
   - Prevedibile e sicuro
*/