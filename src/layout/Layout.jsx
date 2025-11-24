//todo Importo Outlet da react-router-dom per il rendering delle route figlie
import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import Toast from "../components/common/Toast";
import { Toaster } from 'react-hot-toast';

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

    useEffect(() => {
        const handler = (e) => {
            const detail = e?.detail || {};
            const message = detail.message || 'Operazione completata';
            const type = detail.type || 'info';
            const duration = detail.duration || 3000;
            setNotification({ message, type, duration });
        };
        window.addEventListener('showNotification', handler);
        return () => window.removeEventListener('showNotification', handler);
    }, []);

    return (
        <>
        <header>
            <NavBar />
        </header>
        <main>
            <Outlet />
        </main>
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