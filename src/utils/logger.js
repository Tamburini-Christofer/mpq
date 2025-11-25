// Enhanced dev-only logger helper
// Usage: import { logAction, info, error } from '../utils/logger'
// In dev prints concise colored messages with emoji + compact payload

const isDev = typeof import.meta !== 'undefined' ? import.meta.env?.DEV : (process.env.NODE_ENV !== 'production');

const iconFor = (label) => {
  if (!label) return '🔔';
  if (label.includes('cart:add')) return '🛒';
  if (label.includes('cart:remove')) return '🗑️';
  if (label.includes('wishlist')) return '❤';
  if (label.includes('update')) return '🔁';
  return '🔔';
};

const colorFor = (label) => {
  if (!label) return '#555';
  if (label.includes('add')) return '#16a34a'; // green
  if (label.includes('remove')) return '#dc2626'; // red
  if (label.includes('wishlist')) return '#ef4444'; // pink/red
  return '#0ea5e9'; // blue
};

const compact = (payload) => {
  if (!payload) return '';
  try {
    if (typeof payload === 'string') return payload;
    // Show small JSON one-liner with selected keys
    const keys = ['id', 'name', 'quantity'];
    const out = {};
    for (const k of keys) if (payload[k] !== undefined) out[k] = payload[k];
    const str = Object.keys(out).length ? JSON.stringify(out) : JSON.stringify(payload);
    return str;
  } catch (e) {
    return String(payload);
  }
};

export const logAction = (label, payload) => {
  if (!isDev) return;
  try {
    const time = new Date().toLocaleTimeString();
    const icon = iconFor(label);
    const color = colorFor(label);
    const payloadStr = compact(payload);
    // styled console for better visual scan
    console.log(`%c ${icon} ${time} — ${label} %c ${payloadStr}`, `color:${color};font-weight:600`, 'color:#666');
  } catch (e) {
    // ignore
  }
};

export const info = (label, payload) => {
  if (!isDev) return;
  console.log(`%c ℹ️ ${label}`, 'color:#0ea5e9;font-weight:600', payload || '');
};

export const error = (label, err) => {
  // always show errors
  console.error(`❌ ${label}`, err);
};
