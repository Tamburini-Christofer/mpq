import "./cardExp.css" 

function CardExp ({ product }) {
  if (!product) return null;

  return (
    <div className="card fancy-card">
      <div className="card-image-wrapper">
        <img src={product.image} alt={product.name} className="card-image" />
      </div>

      <div className="card-body">
        <h3>{product.name}</h3>
        <p className="price">{product.price.toFixed(2)}€</p>
      </div>
    </div>
  )
}
export default CardExp;