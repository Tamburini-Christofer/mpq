//todo Componente carosello riutilizzabile con scroll orizzontale
import { useRef } from 'react';
import ProductCard from '../common/ProductCard';
import '../../styles/components/ProductCarousel.css';

//todo Props:
//todo - title: titolo del carosello
//todo - products: array di prodotti
//todo - badge: tipo di badge per tutte le card ("popular", "new", "sale")
//todo - onViewDetails: callback dettagli
//todo - onAddToCart: callback carrello
export default function ProductCarousel({ 
  title = "Prodotti",
  products = [], 
  badge = null,
  onViewDetails, 
  onAddToCart 
}) {
  const carouselRef = useRef(null);

  //todo Funzione scroll con frecce
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const cardWidth = window.innerWidth < 768 ? 200 : 270;
      const cardsToScroll = window.innerWidth < 768 ? 1 : 4;
      const scrollAmount = cardWidth * cardsToScroll;

      carouselRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  //todo Gestione touch per mobile
  const handleTouchStart = (e) => {
    if (carouselRef.current) {
      carouselRef.current.touchStartX = e.touches[0].clientX;
      carouselRef.current.scrollStartX = carouselRef.current.scrollLeft;
    }
  };

  const handleTouchMove = (e) => {
    if (!carouselRef.current || !carouselRef.current.touchStartX) return;
    
    const touch = e.touches[0];
    const diff = carouselRef.current.touchStartX - touch.clientX;
    carouselRef.current.scrollLeft = carouselRef.current.scrollStartX + diff;
  };

  const handleTouchEnd = () => {
    if (carouselRef.current) {
      carouselRef.current.touchStartX = null;
      carouselRef.current.scrollStartX = null;
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="product-carousel">
      {/* todo: Titolo carosello */}
      <h2 className="product-carousel__title">{title}</h2>

      <div className="product-carousel__wrapper">
        {/* todo: Freccia sinistra */}
        <button
          className="product-carousel__arrow product-carousel__arrow--left"
          onClick={() => scrollCarousel(-1)}
        >
          &lt;
        </button>

        {/* todo: Container scrollabile */}
        <div
          ref={carouselRef}
          className="product-carousel__list"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {products.map((product, index) => (
            <ProductCard
              key={index}
              product={product}
              badge={badge}
              variant="carousel"
              onViewDetails={onViewDetails}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        {/* todo: Freccia destra */}
        <button
          className="product-carousel__arrow product-carousel__arrow--right"
          onClick={() => scrollCarousel(1)}
        >
          &gt;
        </button>
      </div>
    </section>
  );
}
