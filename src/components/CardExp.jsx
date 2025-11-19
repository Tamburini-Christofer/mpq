import axios from "axios";
import "./cardExp.css" 

import { useEffect, useState } from "react";

function CardExp({ slug }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

function CardExp ({ product }) {

  if (!product) return null;

  useEffect(() => {
    if (!slug) return;

    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/products`);

        let foundProduct = null;

        if (Array.isArray(response.data)) {
          foundProduct = response.data.find(item => item.slug === slug);
        } else {
          foundProduct = response.data;
        }

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

  if (loading) return <p className="loading-text">Evocazione della Quest in corso...</p>;

  if (!product)
    return (
      <div className="card-details-error">
        <h2>Quest non trovata!</h2>
        <p>Sembra che questa avventura sia andata perduta nelle nebbie.</p>
      </div>
    );

  // Calcola il prezzo scontato se c'è uno sconto
  const hasDiscount = product.discount && product.discount > 0;
  const discountedPrice = hasDiscount ? product.price * (1 - product.discount / 100) : product.price;

  return (
 
    <div className="container">
      <div className="fancy-card">
        {/* Wrapper immagine */}
        <div className="card-image-wrapper">
          <img className="card-image" src={product.image} alt={product.name} />
        </div>
      </div>
    </div>
  );
}

export default CardExp;
