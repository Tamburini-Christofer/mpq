# API Backend MPQ - Documentazione

## Base URL
```
http://localhost:3000
```

## API Endpoints

### 📦 Products API

#### GET /products
Ottieni tutti i prodotti o filtra per categoria.

**Query Parameters:**
- `category_id` (optional): ID della categoria (1=film, 2=series, 3=anime)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Il Padrino",
    "slug": "il-padrino",
    "category_id": 1,
    "category_name": "Film",
    "description": "...",
    "image": "...",
    "price": 19.99,
    "discount": 0,
    "popularity": 10
  }
]
```

#### GET /products/:slug
Ottieni un singolo prodotto tramite slug.

**Response:**
```json
{
  "id": 1,
  "name": "Il Padrino",
  "slug": "il-padrino",
  "category_id": 1,
  "category_name": "Film",
  "description": "...",
  "image": "...",
  "price": 19.99,
  "discount": 0,
  "popularity": 10
}
```

---

### 🛒 Cart API

#### GET /cart/:sessionId
Ottieni il carrello per una sessione.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Il Padrino",
    "price": 19.99,
    "quantity": 2,
    "image": "...",
    "category_name": "Film"
  }
]
```

#### POST /cart/:sessionId/items
Aggiungi un prodotto al carrello.

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 1
}
```

**Response:**
```json
{
  "message": "Prodotto aggiunto al carrello",
  "cart": [...]
}
```

#### PUT /cart/:sessionId/items/:productId
Aggiorna la quantità di un prodotto.

**Request Body:**
```json
{
  "quantity": 3
}
```

#### DELETE /cart/:sessionId/items/:productId
Rimuovi un prodotto dal carrello.

#### DELETE /cart/:sessionId
Svuota completamente il carrello.

---

### 💳 Checkout API

#### POST /checkout/create-order
Crea un nuovo ordine.

**Request Body:**
```json
{
  "customerName": "Mario Rossi",
  "customerEmail": "mario@example.com",
  "customerPhone": "+39 123456789",
  "shippingAddress": {
    "address": "Via Roma 1",
    "city": "Milano",
    "postalCode": "20100",
    "country": "Italia"
  },
  "billingAddress": { ... },
  "items": [
    {
      "id": 1,
      "name": "Il Padrino",
      "price": 19.99,
      "discount": 0,
      "quantity": 2
    }
  ],
  "totalAmount": 44.97,
  "paymentMethod": "card"
}
```

**Response:**
```json
{
  "message": "Ordine creato con successo",
  "orderId": 123,
  "orderNumber": "MPQ-000123"
}
```

#### GET /checkout/orders/:orderId
Ottieni dettagli di un ordine.

**Response:**
```json
{
  "id": 123,
  "customer_name": "Mario Rossi",
  "customer_email": "mario@example.com",
  "total_amount": 44.97,
  "status": "pending",
  "created_at": "2025-11-20T10:30:00Z",
  "items": [...]
}
```

#### GET /checkout/user/:email/orders
Ottieni tutti gli ordini di un utente.

**Response:**
```json
[
  {
    "id": 123,
    "customer_name": "Mario Rossi",
    "total_amount": 44.97,
    "status": "pending",
    "created_at": "2025-11-20T10:30:00Z",
    "items_count": 3
  }
]
```

---

## Frontend Integration

### Setup
Il frontend utilizza il servizio API centralizzato in `src/services/api.js`.

### Session Management
Il frontend genera automaticamente un `sessionId` univoco che viene salvato in `sessionStorage` e utilizzato per tutte le chiamate al carrello.

### Uso delle API

```javascript
import { productsAPI, cartAPI, checkoutAPI } from './services/api';

// Carica prodotti
const products = await productsAPI.getAll();
const product = await productsAPI.getBySlug('il-padrino');

// Gestione carrello
const cart = await cartAPI.get();
await cartAPI.add(productId, quantity);
await cartAPI.update(productId, newQuantity);
await cartAPI.remove(productId);
await cartAPI.clear();

// Checkout
const order = await checkoutAPI.createOrder(orderData);
```

### Eventi Personalizzati
Il sistema emette un evento `cartUpdate` ogni volta che il carrello viene modificato:

```javascript
// Emetti evento
emitCartUpdate();

// Ascolta evento
window.addEventListener('cartUpdate', handleCartUpdate);
```

---

## Note Tecniche

### Carrello In-Memory
Il carrello è attualmente salvato in memoria (Map) nel backend. In produzione, usare Redis o database per persistenza.

### CORS
Il server accetta richieste da:
- `http://localhost:5173`
- `http://localhost:5174`
- `http://localhost:5175`

### Gestione Errori
Tutti gli endpoint utilizzano il middleware `errorHandler` per gestione centralizzata degli errori.
