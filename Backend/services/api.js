import { getSessionId } from "./api";

const BASE_URL = "http://localhost:3000";
const sessionId = getSessionId();

// --------------------------------------
// 🟣 PRODOTTI
// --------------------------------------
export const productsAPI = {
  async getAll() {
    const res = await fetch(`${BASE_URL}/products`);
    return res.json();
  },

  async getBySlug(slug) {
    const res = await fetch(`${BASE_URL}/products/${slug}`);
    return res.json();
  }
};

// --------------------------------------
// 🟡 CARRELLO (rotte corrette)
// --------------------------------------
export const cartAPI = {

  async get() {
    const res = await fetch(`${BASE_URL}/cart/${sessionId}`);
    return res.json();
  },

  async add(productId, quantity = 1) {
    const res = await fetch(`${BASE_URL}/cart/${sessionId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity })
    });

    const data = await res.json();
    emitCartUpdate();
    return data;
  },

  async update(productId, quantity) {
    const res = await fetch(`${BASE_URL}/cart/${sessionId}/items/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity })
    });

    const data = await res.json();
    emitCartUpdate();
    return data;
  },

  async remove(productId) {
    const res = await fetch(`${BASE_URL}/cart/${sessionId}/items/${productId}`, {
      method: "DELETE"
    });

    const data = await res.json();
    emitCartUpdate();
    return data;
  },

  async clear() {
    const res = await fetch(`${BASE_URL}/cart/${sessionId}`, {
      method: "DELETE"
    });

    const data = await res.json();
    emitCartUpdate();
    return data;
  }
};

// --------------------------------------
// 🟢 EVENTO NAVBAR
// --------------------------------------
export function emitCartUpdate() {
  window.dispatchEvent(new Event("cartUpdate"));
}
