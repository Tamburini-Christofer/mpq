/* ========================================
   FREE SHIPPING BANNER COMPONENT
   Banner informativo per spedizione gratuita sopra 40€
   ======================================== */

import '../../styles/components/FreeShippingBanner.css';

/**
 * Componente FreeShippingBanner
 * Mostra una barra con progresso per raggiungere la spedizione gratuita
 * 
 * @param {number} subtotal - Totale del carrello (senza spedizione)
 * @param {number} threshold - Soglia per spedizione gratuita (default: 40)
 * @param {boolean} promoApplied - Se il codice promo è stato applicato (default: false)
 */
export default function FreeShippingBanner({ subtotal = 0, threshold = 40, promoApplied = false }) {
  //todo: Calcoliamo quanto manca per raggiungere la soglia
  const remaining = threshold - subtotal;
  
  //todo: Calcoliamo la percentuale di progresso (max 100%)
  //todo: Se il codice promo è applicato, la barra è sempre al 100%
  const progress = promoApplied ? 100 : Math.min((subtotal / threshold) * 100, 100);
  
  //todo: Verifichiamo se la spedizione gratuita è stata raggiunta
  const isFreeShippingActive = subtotal >= threshold || promoApplied;

  return (
    <div className={`free-shipping-banner ${isFreeShippingActive ? 'active' : ''}`}>
      {/* todo: Messaggio informativo */}
      <div className="shipping-message">
        {isFreeShippingActive ? (
          <>
            <span className="shipping-icon">✓</span>
            <span className="shipping-text">
              <strong>Complimenti!</strong> Hai ottenuto la spedizione gratuita!
            </span>
          </>
        ) : (
          <>
            <span className="shipping-icon">📦</span>
            <span className="shipping-text">
              Aggiungi ancora <strong>{remaining.toFixed(2)}€</strong> per la spedizione gratuita!
            </span>
          </>
        )}
      </div>
      
      {/* todo: Barra di progresso */}
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        >
          {progress > 15 && (
            <span className="progress-text">{progress.toFixed(0)}%</span>
          )}
        </div>
      </div>
      
      {/* todo: Indicatori soglia */}
      <div className="shipping-threshold-info">
        <span className="current-amount">{subtotal.toFixed(2)}€</span>
        <span className="threshold-amount">{threshold.toFixed(2)}€</span>
      </div>
    </div>
  );
}
