import './Details.css';
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from 'axios';
import CardExp from "../components/CardExp";

function Details() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('descrizione');

  const showNotification = (msg) => alert(msg);

  const addToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.name === product.name);

    if (existingItem) {
      existingItem.quantity += quantity;
      showNotification(`Quantità di "${product.name}" aumentata nel carrello!`);
    } else {
      cart.push({ ...product, quantity });
      showNotification(`"${product.name}" aggiunto al carrello!`);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
  }

  useEffect(() => {
    if (!slug) return;

    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/products`);
        const foundProduct = Array.isArray(response.data)
          ? response.data.find(item => item.slug === slug)
          : response.data;

        setProduct(foundProduct || null);
      } catch (err) {
        console.error("Errore caricamento prodotto:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  if (loading) return <p>Caricamento in corso...</p>;
  if (!product) return <p>Prodotto non trovato.</p>;

  return (
    <div className="product-page">
      <button onClick={() => navigate("/")}>← Torna alla Home</button>
      <div className='container'>
        <CardExp slug={slug} />
        <div className="container-info">
          <div className='title-info'>
          <span className='product-title'>{product.name}</span>
          <span className='product-category'>{product.category_name} </span>
          </div>
          <div className="product-price-row">
            <span className="product-price">{product.price}€</span>
            <span className="product-old-price">{(product.price * 1.25).toFixed(2)}€</span>
          </div>

          <div className="product-badge-wrapper">
            <span className="product-badge">Featured Quest</span>
          </div>

          <p className="product-short-desc">{product.description}</p>

          <div className="product-options">
            <div>
              <div className="option-group-label">Formato</div>
              <div className="size-options">
                <button className="size-pill selected">Digitale</button>
              </div>
            </div>
          </div>
          <div className="product-actions">
            <div className="product-quantity-row">
              <span className="qty-label">Quantità</span>
              <input
                type="number"
                className="qty-input"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            <button className="add-to-cart-btn" onClick={addToCart}>
              🪙 Aggiungi al carrello
            </button>
            <div className="stock-status">
              Disponibile • Consegna digitale immediata
            </div>

            <div className="extra-info">
              Contenuti esclusivi sbloccabili • Aggiornamenti futuri inclusi
            </div>
          </div>
          <div className="product-tabs">
            <div className="tab-buttons">
              <button
                className={`tab-btn ${activeTab === 'descrizione' ? 'active' : ''}`}
                onClick={() => setActiveTab('descrizione')}
              >
                Descrizione
              </button>
              <button
                className={`tab-btn ${activeTab === 'incluso' ? 'active' : ''}`}
                onClick={() => setActiveTab('incluso')}
              >
                Cosa è incluso
              </button>
            </div>


            <div className="tab-content">
              {activeTab === 'descrizione' && (
                <p>
                  📜 Sarai chiamato a…
                  Percorrere sentieri misteriosi come se stessi camminando lungo i confini di Bosco Atro.
                  Raccogliere ingredienti “elfici” o preparare piccoli manufatti, proprio come abili artigiani di Gran Burrone.
                  Ritrovare oggetti perduti, decifrare rune e superare enigmi nascosti dal potere degli antichi.
                  Collaborare con la tua Compagnia per portare a termine missioni che richiedono intuito, agilità, leadership e spirito di sacrificio.
                  Compiere gesti di gentilezza, coraggio o generosità, rispecchiando le virtù degli eroi della Terra di Mezzo.
                  🔥 Ogni Quest è un capitolo della tua personale epopea: ti immergerai in storie che parlano di amicizia, perseveranza e meraviglia.
                </p>
              )}
              {activeTab === 'incluso' && (
                <ul className="specs-list">
                  <li><span className="spec-label">Durata:</span> 20 quest</li>
                  <li><span className="spec-label">File inclusi:</span> pdf</li>
                  <li><span className="spec-label">Bonus:</span> 1 quest finale extra</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Details;
