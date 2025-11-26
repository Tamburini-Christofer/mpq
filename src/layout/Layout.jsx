//todo Importo Outlet da react-router-dom per il rendering delle route figlie
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import '../styles/components/SwalDark.css';
import '../styles/components/CheckoutSuccess.css';
import { cartAPI, emitCartUpdate } from '../services/api';
import Toast from "../components/common/Toast";
import { Toaster } from 'react-hot-toast';
import { toast } from 'react-hot-toast';

//todo Importo il componente NavBar
import NavBar from "../components/common/NavBar";

//todo importo il componente Footer
import Footer from "../components/common/Footer";

const Layout = () => {
    //todo Hook per rilevare cambio di route
    const location = useLocation();

    //todo Scroll smooth a top quando cambia pagina
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [location.pathname]);

    const [notification, setNotification] = useState(null);
    const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            const detail = e?.detail || {};
            const message = detail.message || 'Operazione completata';
            const type = detail.type || 'info';
            const duration = detail.duration || 4000;
            setNotification({ message, type, duration });
        };
        window.addEventListener('showNotification', handler);
        // central listener for cart add/remove events to show lateral toasts
        const cartHandler = (e) => {
            const d = e?.detail || {};
            // Ignore events originating from Details: Details shows its own toast
            if (d.origin === 'details') return;
            const action = d.action;
            const product = d.product || {};
            const name = product.name || product || 'Prodotto';
            if (action === 'add') {
                toast.success(`"${name}" aggiunto al carretto!`);
            } else if (action === 'remove') {
                toast.error(`"${name}" rimosso dal carretto`);
            }
        };
            window.addEventListener('cartAction', cartHandler);
            return () => {
                window.removeEventListener('showNotification', handler);
                window.removeEventListener('cartAction', cartHandler);
            };
    }, []);

    // Detect Stripe Checkout success (frontend receives ?checkout=success)
    const navigate = useNavigate();
    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            // Some integrations redirect to `/success` (backend default), others append `?checkout=success`.
            // Treat both as a successful checkout.
            const ok = params.get('checkout');
            const pathname = window.location.pathname || '';
            const isSuccessPath = pathname.endsWith('/success') || pathname === '/success';
            if (ok === 'success' || isSuccessPath) {
                // Normalize URL: remove checkout params or move to `/shop` so overlay is shown on the shop page
                try {
                    // if we are on /success path, navigate/replace to /shop without adding a new history entry
                    if (isSuccessPath) {
                        const shopBase = '/shop';
                        window.history.replaceState({}, document.title, shopBase);
                    } else {
                        params.delete('checkout');
                        params.delete('session_id');
                        const base = window.location.pathname;
                        const newSearch = params.toString();
                        const newUrl = newSearch ? `${base}?${newSearch}` : base;
                        window.history.replaceState({}, document.title, newUrl);
                    }
                } catch (e) {
                    console.warn('Could not clean URL params after checkout success', e);
                }

                // perform immediate cleanup: clear local storage and server-side cart, then show overlay
                try {
                    (async () => {
                        try {
                            // preserve the welcome flag so the welcome modal isn't shown again
                            const _seen = localStorage.getItem('hasSeenWelcome');
                            localStorage.clear();
                            if (_seen) localStorage.setItem('hasSeenWelcome', _seen);
                        } catch (e) { console.warn('Errore durante la pulizia di localStorage', e); }
                        try { await cartAPI.clear(); emitCartUpdate(); } catch (e) { console.warn('Errore svuotamento carrello server-side after checkout:', e); }
                        try { setShowCheckoutSuccess(true); } catch (e) { console.warn('Could not show checkout overlay', e); }
                    })();
                } catch (e) { console.warn('Could not run checkout cleanup', e); }

                // no interval/timer: user will close via button
                return () => {
                    try { setShowCheckoutSuccess(false); } catch { /* ignore */ }
                };
            }
        } catch (err) {
            // non-blocking
            console.warn('Error checking checkout success param', err);
        }
        // run when location.search changes
    }, [location.search, navigate]);

    // Allow user to immediately close the overlay and return to shop
    const handleCloseNow = async () => {
        try {
            // preserve the welcome flag so the welcome modal isn't shown again
            const _seen = localStorage.getItem('hasSeenWelcome');
            localStorage.clear();
            if (_seen) localStorage.setItem('hasSeenWelcome', _seen);
        } catch (e) { console.warn('Errore durante la pulizia di localStorage', e); }
        try { await cartAPI.clear(); emitCartUpdate(); } catch (e) { console.warn('Errore svuotamento carrello server-side on manual close:', e); }
        try { setShowCheckoutSuccess(false); } catch (e) { console.warn('Could not hide checkout overlay', e); }
        try { navigate('/shop'); } catch (e) { console.warn('Could not navigate after checkout', e); }
    };

    return (
        <>
        <header>
            <NavBar />
        </header>
                <main>
                        <Outlet />
                </main>
                {showCheckoutSuccess && (
                    <div className="checkout-success-overlay" role="dialog" aria-live="polite">
                        <div className="checkout-success-card" role="document" aria-label="Pagamento avvenuto">
                            <div className="checkout-success-visual" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10" fill="url(#g)" opacity="0.06" />
                                    <path d="M7.5 12.5l2.5 2.5 6-7" stroke="url(#g)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                    <defs>
                                        <linearGradient id="g" x1="0" x2="1">
                                            <stop offset="0%" stopColor="#6c21ff" />
                                            <stop offset="100%" stopColor="#d8a928" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <div className="checkout-success-content">
                                <div className="checkout-success-title">Pagamento avvenuto</div>
                                <div className="checkout-success-msg">Grazie! Il pagamento è andato a buon fine. Riceverai a breve una email con il riepilogo dell'ordine.</div>
                                <div className="checkout-success-row">
                                    <button className="checkout-success-btn" onClick={handleCloseNow}>Vai allo shop</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        <footer>
            <Footer />
        </footer>

        <div className="toast-stack">
            {notification && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    duration={notification.duration}
                    onClose={() => setNotification(null)}
                />
            )}
            <Toaster
                position="top-left"
                reverseOrder={false}
            />
        </div>
        </>
    )
}

export default Layout;