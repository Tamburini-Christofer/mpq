import "./cardExp.css" 

function CardExp () {

  return (
    <>
    <div className="products">
      {products.map((p) => (
        <div key={p.id} className="card fancy-card">

          <div className="card-image-wrapper">
            <img src={p.image} alt={p.name} className="card-image" />
          </div>

          <div className="card-body">
            <h3>{p.name}</h3>
            <p className="price">{p.price.toFixed(2)}€</p>
              <button className="buy-btn" onClick={() => addToCart(p)}>
            Aggiungi
          </button>
          </div>

        
        </div>
      ))}
    </div>
    </>
  )
}
export default CardExp;