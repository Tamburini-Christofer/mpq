# Sistema Card Prodotto Unificato

## 📦 Componenti Creati

### 1. **ProductCard** (`src/components/common/ProductCard.jsx`)
Componente card base riutilizzabile per visualizzare prodotti.

#### Props:
- `product` (object, required) - Oggetto prodotto con `{name, price, image}`
- `badge` (string) - Tipo badge: `"popular"`, `"new"`, `"sale"`, `null`
- `variant` (string) - Layout: `"carousel"`, `"grid"`, `"compact"`
- `onViewDetails` (function) - Callback clic su "Dettagli"
- `onAddToCart` (function) - Callback clic su "Acquista"
- `showActions` (boolean) - Mostra/nascondi pulsanti (default: `true`)

#### Esempio:
```jsx
<ProductCard
  product={product}
  badge="popular"
  variant="carousel"
  onViewDetails={handleViewDetails}
  onAddToCart={handleAddToCart}
/>
```

---

### 2. **ProductCarousel** (`src/components/home/ProductCarousel.jsx`)
Carosello orizzontale scorrevole con frecce di navigazione.

#### Props:
- `title` (string) - Titolo del carosello
- `products` (array, required) - Array di prodotti
- `badge` (string) - Badge per tutte le card
- `onViewDetails` (function) - Callback dettagli
- `onAddToCart` (function) - Callback carrello

#### Esempio HomePage:
```jsx
import ProductCarousel from '../components/home/ProductCarousel';

<ProductCarousel
  title="Più Popolari"
  products={bestSellers}
  badge="popular"
  onViewDetails={handleViewDetails}
  onAddToCart={handleAddToCart}
/>

<ProductCarousel
  title="Ultimi Arrivi"
  products={latestArrivals}
  badge="new"
  onViewDetails={handleViewDetails}
  onAddToCart={handleAddToCart}
/>
```

---

### 3. **ProductGrid** (`src/components/shop/ProductGrid.jsx`)
Griglia responsive per visualizzare prodotti nello Shop.

#### Props:
- `products` (array, required) - Array di prodotti
- `onViewDetails` (function) - Callback dettagli
- `onAddToCart` (function) - Callback carrello
- `variant` (string) - Layout: `"grid"` (default), `"compact"`

#### Esempio Shop:
```jsx
import ProductGrid from '../components/shop/ProductGrid';

<ProductGrid
  products={filteredProducts}
  onViewDetails={handleViewDetails}
  onAddToCart={handleAddToCart}
  variant="grid"
/>
```

---

## 🎨 Stili CSS

### ProductCard.css
Stili base per le card con varianti:
- `.product-card` - Stile base
- `.product-card--carousel` - Per caroselli (150px larghezza)
- `.product-card--grid` - Per griglie (max 280px)
- `.product-card--compact` - Versione compatta

### Badge disponibili:
- `.product-card__badge--popular` - Blu (#4d82f4)
- `.product-card__badge--new` - Rosso (#d62121)
- `.product-card__badge--sale` - Verde (#10b981)

---

## 📱 Responsive

Tutti i componenti sono completamente responsive:
- **Desktop**: Layout ottimale
- **Tablet**: Griglia adattiva
- **Mobile**: Touch-friendly con swipe

---

## ✅ Vantaggi

1. **Riutilizzabilità**: Stesso componente per Home, Shop, e altre pagine
2. **Consistenza**: Design uniforme in tutta l'app
3. **Manutenibilità**: Un solo file CSS da modificare
4. **Flessibilità**: Varianti e badge personalizzabili
5. **Performance**: Componenti ottimizzati

---

## 🔄 Migrazione da CardExp

**Prima:**
```jsx
<CardExp 
  product={product}
  onViewDetails={handleViewDetails}
  onAddToCart={handleAddToCart}
/>
```

**Dopo:**
```jsx
<ProductCard
  product={product}
  badge="popular"
  variant="carousel"
  onViewDetails={handleViewDetails}
  onAddToCart={handleAddToCart}
/>
```
