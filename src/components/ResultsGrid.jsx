// TODO: Importiamo React per creare componenti
import React from 'react';
// TODO: Importiamo il componente CardExp che renderizza ogni singolo prodotto
import CardExp from './CardExp.jsx';

// TODO: Componente funzionale che gestisce la griglia dei risultati di ricerca
// Riceve 2 props dal componente padre (Shop):
// - products: array di oggetti prodotto (default = array vuoto se non passato)
// - loading: boolean che indica se stiamo caricando i dati (default = false)
export default function ResultsGrid({ products = [], loading = false }) {
  // TODO: PRIMO CHECK - Se stiamo caricando i dati dal database
  // Mostra un messaggio di caricamento invece della griglia vuota
  // Questo migliora la user experience (UX) perché l'utente sa che sta succedendo qualcosa
  if (loading) {
    return (
      <div className="results-grid">
        {/* TODO: Placeholder che appare durante il caricamento */}
        <div className="loading-placeholder">Caricamento prodotti...</div>
      </div>
    );
  }

  // TODO: SECONDO CHECK - Se l'array prodotti è vuoto (nessun risultato trovato)
  // products.length === 0 controlla se l'array è vuoto
  if (products.length === 0) {
    return (
      <div className="results-grid">
        {/* TODO: Messaggio user-friendly quando non ci sono risultati */}
        <div className="no-products">Nessun prodotto trovato</div>
      </div>
    );
  }

  // TODO: TERZO CASO - Se abbiamo prodotti da mostrare, renderizziamo la griglia
  return (
    <div className="results-grid">
      {/* TODO: Mappiamo ogni prodotto dell'array in un componente CardExp
           - products.map() itera su ogni elemento dell'array
           - (product, index) => product è l'oggetto corrente, index la posizione
           - Ogni iterazione restituisce un componente <CardExp />
           - key è OBBLIGATORIO per React per ottimizzare il rendering
           - Usiamo product.id se esiste, altrimenti l'index come fallback */}
      {products.map((product, index) => (
        <CardExp 
          key={product.id || index} 
          product={product} 
        />
      ))}
    </div>
  );
}

/* TODO: PATTERN DI RENDERING CONDIZIONALE:
   Questo componente usa il pattern "early return" per gestire diversi stati:
   
   1. if (loading) return <Loading /> → ESCE dalla funzione
   2. if (empty) return <Empty /> → ESCE dalla funzione
   3. return <Grid /> → Caso normale
   
   VANTAGGI:
   - Codice pulito e leggibile
   - Ogni caso è gestito esplicitamente
   - Evita if/else annidati complessi
   - Facile aggiungere nuovi stati (errore, etc.)
   
   STRUTTURA OGGETTO PRODUCT (esempio):
   {
     id: 1,
     title: "Puzzle Naruto",
     price: 25.99,
     category: "anime",
     difficulty: "medium",
     image: "url...",
     rating: 4.5
   }
*/