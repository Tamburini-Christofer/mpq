import { loadStripe } from '@stripe/stripe-js';

// Centralizza il promise di Stripe per evitare caricamenti duplicati in dev
const stripePromise = (window.__stripePromise = window.__stripePromise || loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY'));

export default stripePromise;
