//todo Importo Outlet da react-router-dom per il rendering delle route figlie
import { Outlet, useLocation } from "react-router-dom"
import { useEffect } from "react"

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
        </>
    )
}

export default Layout;