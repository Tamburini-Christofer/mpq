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
    const [checkoutCountdown, setCheckoutCountdown] = useState(6);

    useEffect(() => {
        const handler = (e) => {
            const detail = e?.detail || {};
            const message = detail.message || 'Operazione completata';
            const type = detail.type || 'info';
            const duration = detail.duration || 3000;
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
                toast.success(`"${name}" aggiunto al carrello!`);
            } else if (action === 'remove') {
                toast.error(`"${name}" rimosso dal carrello`);
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
            const ok = params.get('checkout');
            if (ok === 'success') {
                // show custom overlay with countdown then run cleanup
                try {
                    setCheckoutCountdown(6);
                    setShowCheckoutSuccess(true);
                } catch (e) { console.warn('Could not set checkout overlay', e) }

                let intervalId = null;
                let finished = false;

                const startCountdown = () => {
                    intervalId = setInterval(() => {
                        setCheckoutCountdown((c) => {
                            if (c <= 1) {
                                // stop interval
                                clearInterval(intervalId);
                                finished = true;
                                // perform cleanup when countdown reaches 0
                                (async () => {
                                    try { localStorage.clear(); } catch (e) { console.warn('Errore durante la pulizia di localStorage', e); }
                                    try { await cartAPI.clear(); emitCartUpdate(); } catch (e) { console.warn('Errore svuotamento carrello server-side after checkout:', e); }
                                    try { setShowCheckoutSuccess(false); } catch (e) { console.warn('Could not hide checkout overlay', e); }
                                })();
                                return 0;
                            }
                            return c - 1;
                        });
                    }, 1000);
                };

                startCountdown();

                // cleanup if effect re-runs before countdown ends
                return () => {
                    if (intervalId) clearInterval(intervalId);
                    if (!finished) setShowCheckoutSuccess(false);
                };
            }
        } catch (err) {
            // non-blocking
            console.warn('Error checking checkout success param', err);
        }
        // run when location.search changes
    }, [location.search, navigate]);

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
                        <div className="checkout-success-card">
                            <div className="checkout-success-title">Pagamento avvenuto</div>
                            <div className="checkout-success-msg">Grazie! Il pagamento è andato a buon fine. Riceverai a breve una email con il riepilogo dell'ordine.</div>
                            <div className="checkout-success-timer">L'overlay si chiuderà automaticamente in {checkoutCountdown}s</div>
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