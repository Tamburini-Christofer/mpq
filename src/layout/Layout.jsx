//todo Importo Outlet da react-router-dom per il rendering delle route figlie
import { Outlet, } from "react-router-dom"

//todo Importo il componente NavBar
import NavBar from "../components/NavBar";

//todo importo il componente Footer
import Footer from "../components/Footer";

const Layout = () => {

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