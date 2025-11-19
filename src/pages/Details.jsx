import "../styles/pages/Details.css"
//todo useParams: hook per estrarre parametri dinamici dalla URL (es: /details/:slug)
//todo useNavigate: hook per navigazione programmatica
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
//todo Importiamo il database dei prodotti
import productsData from "../JSON/products.json"

//todo Funzione per generare slug SEO-friendly dal nome prodotto (deve essere identica a ProductCard)
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

function Details() {
  //todo Estraiamo lo slug dalla URL (es: /details/il-padrino => slug = "il-padrino")
  const { slug } = useParams()
  const navigate = useNavigate()
  //todo Cerchiamo il prodotto confrontando lo slug generato dal nome con quello dell'URL
  const product = productsData.find(p => generateSlug(p.name) === slug)
  
  const [quantity, setQuantity] = useState(1)
  const [notification, setNotification] = useState(null)

  //todo Scroll istantaneo all'inizio della pagina quando si carica
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  //todo Funzione per aggiungere il prodotto al carrello dalla pagina Details
  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    //todo Cerchiamo il prodotto nel carrello confrontando per nome (non per id)
    const existingItem = cart.find(item => item.name === product.name)
    
    if (existingItem) {
      //todo Se esiste già, aggiungiamo la quantità selezionata
      existingItem.quantity += quantity
      showNotification(`Quantità di "${product.name}" aumentata nel carrello!`)
    } else {
      //todo Se è nuovo, aggiungiamo l'intero oggetto prodotto con la quantità
      cart.push({ ...product, quantity })
      showNotification(`"${product.name}" aggiunto al carrello!`)
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    
    //todo Trigger storage event per sincronizzare con Shop e altre pagine aperte
    window.dispatchEvent(new Event('storage'))
  }

  if (!product) {
    return <div className="product-page"><h1>Prodotto non trovato</h1></div>
  }
  return (
    <>
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' ? '✓' : 'ℹ'}
            </span>
            <span className="notification-message">{notification.message}</span>
            <button 
              className="notification-close"
              onClick={() => setNotification(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <button className="back-to-home-btn" onClick={() => navigate('/')}>
        ← Torna alla Home
      </button>

{/*     // TODO: wrapper principale della pagina prodotto
 */}<div className="product-page">

  {/* Colonna immagini */}
{/*   // TODO: sezione che contiene tutte le immagini del prodotto
 */}  <div className="product-gallery">

{/*     // TODO: immagine principale grande del prodotto
 */}    <div className="product-main-image">
{/*       // TODO: immagine animata (GIF) visualizzata come anteprima principale
 */}      <img
        src={product.image}
        alt={product.name}
      />
    </div>

  </div>

  {/* Colonna info prodotto */}
{/*   // TODO: sezione di destra con tutte le informazioni testuali
 */}  <div className="product-info">

{/*     // TODO: wrapper per categoria, titolo e sottotitolo
 */}    <div>
{/*       // TODO: categoria del prodotto, usata come label decorativa
 */}      <div className="product-category">QUEST • ADVENTURE</div>

{/*       // TODO: titolo principale del prodotto
 */}      <h1 className="product-title">{product.name}</h1>

{/*       // TODO: breve descrizione subito sotto il titolo
 */}      <p className="product-subtitle">
        Avventura epica e contenuti esclusivi.
      </p>
    </div>

    {/* Rating (commentato) */}
    {/* 
    // TODO: sezione delle stelle e recensioni (momentaneamente disattivata)
    <div className="product-rating">
      <span className="stars">★★★★☆</span>
      <span>4,8 / 5 • 328 recensioni</span>
    </div>
    */}

{/*     TODO: wrapper del prezzo e del badge
 */}    <div>

{/*       // TODO: sezione prezzo con prezzo nuovo + prezzo vecchio sbarrato
 */}      <div className="product-price-row">
        <span className="product-price">{product.price.toFixed(2)}€</span>
        <span className="product-old-price">{(product.price * 1.25).toFixed(2)}€</span>
      </div>

{/*       // TODO: badge visuale che evidenzia la quest come “Featured”
 */}      <div className="product-badge-wrapper">
        <span className="product-badge">Featured Quest</span>
      </div>
    </div>

{/*     // TODO: descrizione principale del prodotto
 */}    <p className="product-short-desc">
      {product.description}
    </p>

    {/* Opzioni */}
{/*     // TODO: sezione che gestisce le varie opzioni selezionabili dal prodotto
 */}    <div className="product-options">

{/*       // TODO: scelta del formato (digitale, fisico, ecc.)
 */}      <div>
{/*         // TODO: label della categoria opzioni
 */}        <div className="option-group-label">Formato</div>

{/*         // TODO: pulsanti selezionabili per scegliere il formato
 */}        <div className="size-options">
          <button className="size-pill selected">Digitale</button>
          {/* <button className="size-pill">Fisico</button>
          <button className="size-pill">Bundle</button> */}
        </div>
      </div>

{/*       // TODO: scelta della lingua disponibile
 */}      <div>
        <div className="option-group-label">Lingua</div>

{/*         // TODO: pilloline selezionabili - qui solo IT disponibile
 */}        <div className="size-options">
          <button className="size-pill selected">IT</button>
        </div>
      </div>
    </div>

    {/* Azioni */}
{/*     // TODO: sezione dedicata alle azioni dell’utente (quantità, pulsante acquisto)
 */}    <div className="product-actions">

{/*       // TODO: selezione della quantità desiderata
 */}      <div className="product-quantity-row">
        <span className="qty-label">Quantità</span>

{/*         // TODO: input numerico per impostare la quantità
 */}        <input
          type="number"
          className="qty-input"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
        />
      </div>

{/*       // TODO: pulsante che permette di aggiungere il prodotto al carrello
 */}      <button className="add-to-cart-btn" onClick={addToCart}>
        <span>🪙 Aggiungi al carrello</span>
      </button>

{/*       // TODO: testo che indica la disponibilità del prodotto
 */}      <div className="stock-status">
        Disponibile • Consegna digitale immediata
      </div>

{/*       // TODO: informazioni extra sotto il pulsante
 */}      <div className="extra-info">
        Contenuti esclusivi sbloccabili • Aggiornamenti futuri inclusi
      </div>
    </div>

    {/* Tabs */}
{/*     // TODO: sezione con i tab per cambiare contenuto (Descrizione / cosa è incluso)
 */}    <div className="product-tabs">

{/*       // TODO: pulsanti che cambiano tab
 */}      <div className="tab-buttons">
        <button className="tab-btn">Descrizione</button>
        <button className="tab-btn active">Cosa è incluso</button>
      </div>

{/*       // TODO: contenuto visualizzato del tab selezionato
 */}      <div className="tab-content">
        <p>
          📜 Sarai chiamato a…

          Percorrere sentieri misteriosi come se stessi camminando lungo i confini di Bosco Atro.

          Raccogliere ingredienti “elfici” o preparare piccoli manufatti, proprio come abili artigiani di Gran Burrone.

          Ritrovare oggetti perduti, decifrare rune e superare enigmi nascosti dal potere degli antichi.

          Collaborare con la tua Compagnia per portare a termine missioni che richiedono intuito, agilità, leadership e spirito di sacrificio.

          Compiere gesti di gentilezza, coraggio o generosità, rispecchiando le virtù degli eroi della Terra di Mezzo.

          🔥 Ogni Quest è un capitolo della tua personale epopea:
          ti immergerai in storie che parlano di amicizia, perseveranza e meraviglia — valori che rendono l’avventura non solo un gioco, ma un’esperienza che rimane nel cuore.

          🌄 Che la tua strada possa sempre elevarsi davanti a te, viandante.
          La Terra di Mezzo ti aspetta… e ogni scelta può trasformarsi in una leggenda.
        </p>

{/*         // TODO: lista delle specifiche incluse nel prodotto
 */}        <ul className="specs-list">
          <li>
            <span className="spec-label">Durata:</span> 20 quest
          </li>
          <li>
            <span className="spec-label">File inclusi:</span> pdf
          </li>
          <li>
            <span className="spec-label">Bonus:</span> 1 quest finale extra
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>
    </>
  )
}
export default Details;
