// API BASE URL
const API_BASE_URL = 'http://localhost:3000';

// Genera o recupera session ID (persistente in localStorage per tab/finestre)
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Legge eventuale parametro `cart` dalla querystring, decodifica da Base64 JSON
const readCartParam = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('cart');
    if (!encoded) return null;
    const json = decodeURIComponent(atob(encoded));
    const items = JSON.parse(json);
    if (Array.isArray(items)) return items;
  } catch (e) {
    console.warn('Errore parsing cart param:', e);
  }
  return null;
};

// Applica il cart dalla querystring al carrello server per la sessione corrente.
// Questa operazione viene eseguita solo una volta per sessione (flag in localStorage).
const applyCartFromUrlIfPresent = async () => {
  try {
    if (localStorage.getItem('cartFromUrlApplied') === '1') return;
    const items = readCartParam();
    if (!items || items.length === 0) return;

    localStorage.setItem('cartFromUrlApplied', '1');

    const sessionId = getSessionId();
    console.log('Applying shared cart to session', sessionId, items);

    // Svuota il carrello corrente (ignora errori)
    try { await fetch(`${API_BASE_URL}/cart/${sessionId}`, { method: 'DELETE' }); } catch (e) { /* ignore */ }

    // Aggiungi tutti gli item al server
    for (const it of items) {
      const productId = it.productId ?? it.id ?? it.product_id;
      const quantity = it.quantity ?? 1;
      if (!productId) continue;
      try {
        await fetch(`${API_BASE_URL}/cart/${sessionId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity })
        });
      } catch (e) {
        console.warn('Errore aggiunta item shared cart:', e);
      }
    }

    // Rimuovi il parametro `cart` dall'URL per non riapplicarlo
    const url = new URL(window.location.href);
    url.searchParams.delete('cart');
    window.history.replaceState({}, document.title, url.toString());
  } catch (e) {
    console.error('applyCartFromUrlIfPresent error', e);
  }
};

// ===== PRODUCTS API =====

export const productsAPI = {
  // Ottieni tutti i prodotti con paginazione
  // Accetta un oggetto `options` o un semplice `categoryId` (per compatibilità).
  getAll: async (options = {}) => {
    try {
      const TTL = 700; // ms
      // normalizza l'argomento: se è un ID (number/string) lo trattiamo come categoryId
      let opts = options;
      if (options === null || options === undefined) opts = {};
      if (typeof options !== 'object') opts = { categoryId: options };

      // costruisci query params dalla options
      const params = new URLSearchParams();
      if (opts.page) params.set('page', String(opts.page));
      if (opts.limit) params.set('limit', String(opts.limit));
      // backend expects `search` (not `q`)
      if (opts.search) params.set('search', String(opts.search));
      // backend expects `sortBy`
      if (opts.sortBy) params.set('sortBy', String(opts.sortBy));
      if (opts.priceMin != null) params.set('priceMin', String(opts.priceMin));
      if (opts.priceMax != null) params.set('priceMax', String(opts.priceMax));
      // backend compares string 'true' for these flags
      if (opts.onSale) params.set('onSale', 'true');
      if (opts.matureContent) params.set('matureContent', 'true');
      if (opts.accessibility) params.set('accessibility', 'true');
      if (opts.categoryId) params.set('category_id', String(opts.categoryId));

      const url = `${API_BASE_URL}/products${params.toString() ? `?${params.toString()}` : ''}`;

      // cache/dedupe per-URL
      if (!productsAPI._cacheMap) productsAPI._cacheMap = {};
      const entry = productsAPI._cacheMap[url] || { lastResult: null, lastTime: 0, lastPromise: null };
      const now = Date.now();

      if (entry.lastPromise) return entry.lastPromise;
      if (entry.lastResult && (now - entry.lastTime) < TTL) return entry.lastResult;

      const p = (async () => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error('Errore nel caricamento dei prodotti');
          const data = await response.json();
          entry.lastResult = data;
          entry.lastTime = Date.now();
          productsAPI._cacheMap[url] = entry;
          return data;
        } catch (error) {
          console.error('Errore API getAll:', error);
          throw error;
        } finally {
          entry.lastPromise = null;
          productsAPI._cacheMap[url] = entry;
        }
      })();

      entry.lastPromise = p;
      productsAPI._cacheMap[url] = entry;
      return p;
    } catch (error) {
      console.error('Errore API getAll (outer):', error);
      throw error;
    }
  },

  // Ottieni tutti i prodotti senza paginazione (compatibilità)
  // Reuse `getAll` (with a large `limit`) so we benefit from the per-URL
  // dedupe/cache implemented there and avoid duplicate simultaneous requests.
  getAllUnpaginated: async (categoryId = null) => {
    try {
      const opts = { limit: 1000 };
      if (categoryId) opts.categoryId = categoryId;
      const data = await productsAPI.getAll(opts);
      // `getAll` returns the same shape { products, pagination }
      return data && data.products ? data.products : data;
    } catch (error) {
      console.error('Errore API getAllUnpaginated (via getAll):', error);
      throw error;
    }
  },

  // Ottieni prodotto per slug
  getBySlug: async (slug) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${slug}`);
      if (!response.ok) throw new Error('Prodotto non trovato');
      return await response.json();
    } catch (error) {
      console.error('Errore API getBySlug:', error);
      throw error;
    }
  }
};

// ===== CART API =====

export const cartAPI = {
  // Ottieni carrello
  get: async () => {
    // simple in-flight dedupe + short TTL cache to avoid many duplicate requests
    if (!cartAPI._cache) {
      cartAPI._cache = { lastResult: null, lastTime: 0, lastPromise: null };
    }
    const now = Date.now();
    const TTL = 700; // ms - batch calls within this window

    // if there's an ongoing fetch, return the same promise
    if (cartAPI._cache.lastPromise) {
      return cartAPI._cache.lastPromise;
    }

    // if we have a recent cached result, return it immediately
    if (cartAPI._cache.lastResult && (now - cartAPI._cache.lastTime) < TTL) {
      return cartAPI._cache.lastResult;
    }

    // otherwise perform fetch and store promise in cache
    const p = (async () => {
      try {
        const sessionId = getSessionId();
        const response = await fetch(`${API_BASE_URL}/cart/${sessionId}`);
        if (!response.ok) throw new Error('Errore nel caricamento del carrello');
        const data = await response.json();
        cartAPI._cache.lastResult = data;
        cartAPI._cache.lastTime = Date.now();
        return data;
      } catch (error) {
        console.error('Errore API cart.get:', error);
        return [];
      } finally {
        // clear the in-flight promise reference after resolution so next calls can start a new one when needed
        cartAPI._cache.lastPromise = null;
      }
    })();

    cartAPI._cache.lastPromise = p;
    return p;
  },

  // Aggiungi al carrello
  add: async (productId, quantity = 1) => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      });
      if (!response.ok) throw new Error('Errore nell\'aggiunta al carrello');
      return await response.json();
    } catch (error) {
      console.error('Errore API cart.add:', error);
      throw error;
    }
  },

  // Aggiorna quantità
  update: async (productId, quantity) => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/items/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      if (!response.ok) throw new Error('Errore nell\'aggiornamento');
      return await response.json();
    } catch (error) {
      console.error('Errore API cart.update:', error);
      throw error;
    }
  },

  // Aumenta quantità
  increase: async (productId) => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/items/${productId}/increase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      // If item or cart is missing on server, try to recover: create the item instead
      if (!response.ok) {
        let body = null;
        try { body = await response.json(); } catch (e) { /* ignore */ }
        const msg = body && body.message ? body.message : '';
        // If backend reports product not in cart or cart not found, fallback to add
        if (response.status === 404 && /Prodotto non nel carrello|Carrello non trovato/i.test(msg)) {
          // create the item on the server
          try {
            return await cartAPI.add(productId, 1);
          } catch (e) {
            console.warn('Fallback add after increase failed', e);
            throw e;
          }
        }
        throw new Error('Errore nell\'aumento della quantità');
      }
      return await response.json();
    } catch (error) {
      console.error('Errore API cart.increase:', error);
      throw error;
    }
  },

  // Diminuisci quantità
  decrease: async (productId) => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/items/${productId}/decrease`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        let body = null;
        try { body = await response.json(); } catch (e) { /* ignore */ }
        const msg = body && body.message ? body.message : '';
        // If cart or item not found, return current cart state to keep UI in sync
        if (response.status === 404 && /Carrello non trovato|Prodotto non nel carrello/i.test(msg)) {
          try { return await cartAPI.get(); } catch (e) { /* ignore */ }
        }
        throw new Error('Errore nella diminuzione della quantità');
      }
      return await response.json();
    } catch (error) {
      console.error('Errore API cart.decrease:', error);
      throw error;
    }
  },

  // Rimuovi dal carrello
  remove: async (productId) => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/items/${productId}`, {
        method: 'DELETE'
      });

      // If backend returned an error body, try to include it in the thrown Error
      if (!response.ok) {
        let msg = 'Errore nella rimozione';
        let body = null;
        try { body = await response.json(); } catch (e) { /* ignore */ }
        if (body && body.message) msg = body.message;
        // If cart not found, return an empty cart to keep UI consistent
        if (response.status === 404 && /Carrello non trovato/i.test(msg)) {
          return [];
        }
        const err = new Error(msg);
        err.status = response.status;
        throw err;
      }

      return await response.json();
    } catch (error) {
      console.error('Errore API cart.remove:', error);
      throw error;
    }
  },

  // Svuota carrello
  clear: async () => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Errore nello svuotamento');
      return await response.json();
    } catch (error) {
      console.error('Errore API cart.clear:', error);
      throw error;
    }
  }
};

// ===== CHECKOUT API =====

export const checkoutAPI = {
  // Crea ordine
  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/checkout/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) throw new Error('Errore nella creazione dell\'ordine');
      return await response.json();
    } catch (error) {
      console.error('Errore API checkout.createOrder:', error);
      throw error;
    }
  },

  // Ottieni ordine
  getOrder: async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/checkout/orders/${orderId}`);
      if (!response.ok) throw new Error('Ordine non trovato');
      return await response.json();
    } catch (error) {
      console.error('Errore API checkout.getOrder:', error);
      throw error;
    }
  },

  // Ottieni ordini utente
  getUserOrders: async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/checkout/user/${encodeURIComponent(email)}/orders`);
      if (!response.ok) throw new Error('Errore nel caricamento degli ordini');
      return await response.json();
    } catch (error) {
      console.error('Errore API checkout.getUserOrders:', error);
      throw error;
    }
  }
};

// Evento personalizzato per sincronizzare il carrello tra componenti
import { logAction } from '../utils/logger';
import ACTIONS from '../utils/actionTypes';

// small dedupe for emitted logs to avoid rapid duplicate console entries
const _recentLog = { label: null, payload: null, time: 0 };
const _shouldLog = (label, payload, windowMs = 800) => {
  try {
    const p = payload ? JSON.stringify({ id: payload.id, name: payload.name }) : '';
    const now = Date.now();
    if (label === _recentLog.label && p === _recentLog.payload && (now - _recentLog.time) < windowMs) {
      return false;
    }
    _recentLog.label = label;
    _recentLog.payload = p;
    _recentLog.time = now;
    return true;
  } catch {
    return true;
  }
};

// Debounce/dedup control for emitCartUpdate dispatches
let _emitCooldownMs = 600; // cooldown window
let _lastEmitTime = 0;
let _emitScheduled = false;

export const emitCartUpdate = () => {
  const now = Date.now();
  // If we're within cooldown, schedule a single emit after cooldown (if not already scheduled)
  if (now - _lastEmitTime < _emitCooldownMs) {
    if (!_emitScheduled) {
      _emitScheduled = true;
      setTimeout(() => {
        _emitScheduled = false;
        emitCartUpdate();
      }, _emitCooldownMs);
    }
    return;
  }
  _lastEmitTime = now;

  // Fetch latest cart once and dispatch it to listeners to avoid multiple components re-fetching
  (async () => {
    try {
      const data = await cartAPI.get();
      window.dispatchEvent(new CustomEvent('cartUpdate', { detail: { cart: data } }));
      if (_shouldLog(ACTIONS.CART_UPDATE, { note: 'cartUpdate dispatched' })) {
        logAction(ACTIONS.CART_UPDATE, { note: 'cartUpdate dispatched' });
      }
    } catch {
      // fallback: still dispatch event without data so listeners can decide to fetch
      try { window.dispatchEvent(new CustomEvent('cartUpdate')); } catch { /* ignore */ }
    }
  })();
};

// Emit a cart action event with details { action: 'add'|'remove', product: { id, name } }
export const emitCartAction = (action, product) => {
  try {
    window.dispatchEvent(new CustomEvent('cartAction', { detail: { action, product } }));
    // map action to label
    const label = action === 'add' ? ACTIONS.CART_ADD : ACTIONS.CART_REMOVE;
    if (_shouldLog(label, product)) {
      logAction(label, { id: product?.id, name: product?.name });
    }
  } catch {
    // ignore
  }
};
