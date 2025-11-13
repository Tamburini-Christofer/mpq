import './Shop.css'; 
import CardExp from '../components/CardExp.jsx'; 
export default function Shop() {

  return (
    <div className="shop-container"> 

      {/* Colonna Filtri (Sinistra)  */}
      <aside className="filters-sidebar">
        <h3 className="filters-title">FILTRI</h3>

        {/* Gruppo Categoria */}
        <div className="filter-group">
          <h4>Categoria</h4>
          <div className="filter-option">
            <input type="checkbox" id="cat-series" name="cat-series" />
            <label htmlFor="cat-series">Serie TV</label>
          </div>
          <div className="filter-option">
            <input type="checkbox" id="cat-anime" name="cat-anime" />
            <label htmlFor="cat-anime">Anime</label>
          </div>
          <div className="filter-option">
            <input type="checkbox" id="cat-videogames" name="cat-videogames" />
            <label htmlFor="cat-videogames">Videogiochi</label>
          </div>
          {/* ... Aggiungi altre categorie */}
        </div>

        {/* Gruppo Prezzo */}
        <div className="filter-group">
          <h4>Prezzo</h4>
          <div className="price-inputs">
            {/* prossimamente uno slider, per ora semplici input */}
            <input type="number" placeholder="Min" className="price-input" />
            <span>-</span>
            <input type="number" placeholder="Max" className="price-input" />
          </div>
        </div>

        {/* Gruppo Difficoltà */}
        <div className="filter-group">
          <h4>Difficoltà</h4>
          <div className="filter-option">
            <input type="checkbox" id="diff-high" name="diff-high" />
            <label htmlFor="diff-high">Difficile</label>
          </div>
          <div className="filter-option">
            <input type="checkbox" id="diff-medium" name="diff-medium" />
            <label htmlFor="diff-medium">Media</label>
          </div>
          <div className="filter-option">
            <input type="checkbox" id="diff-low" name="diff-low" />
            <label htmlFor="diff-low">Facile</label>
          </div>
          {/* altre opzioni */}
        </div>
        
        <button className="apply-filters-btn">APPLICA FILTRI</button>
      </aside>

      {/* Area Risultati (Destra)    */}
      <main className="results-content">

        {/* Barra Cerca e Ordina */}
        <div className="search-sort-bar">
          <div className="search-wrapper">
            <input type="text" placeholder="Cerca per titolo, categoria..." className="search-input" />
          </div>
          <div className="sort-wrapper">
            <label htmlFor="sort-by">Ordina per:</label>
            <select id="sort-by" name="sort-by" className="sort-select">
              <option value="recent">Più Recenti</option>
              <option value="price-asc">Prezzo (Crescente)</option>
              <option value="price-desc">Prezzo (Decrescente)</option>
              <option value="name-asc">Nome (A-Z)</option>
              <option value="name-desc">Nome (Z-A)</option>
              <option value="rating-asc">Valutazione (Bassa - Alta)</option>
              <option value="rating-desc">Valutazione (Alta - Bassa)</option>
            </select>
          </div>
        </div>

        {/* Griglia dei Risultati */}
        <div className="results-grid">
          <CardExp />
          <CardExp />
          <CardExp />
        </div>

      </main>
      
    </div>
  );
}