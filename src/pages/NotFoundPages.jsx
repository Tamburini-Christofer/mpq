import "./NotFoundPages.css"
import NotFoundImg from "/logo/404.jpeg";
import { Link } from "react-router-dom";

function NotFoundPages() {
    return (
        <>  
            <div className="notfound">
                <div className="notfoundbox">
                <h1>Devi aver tirato l'incantesimo sbagliato!</h1>
                <img src={NotFoundImg} alt="not_found" />
                <Link to={'/'}><button>Torna alla home!</button></Link>
                </div>
            </div>

        </>
    )
}
export default NotFoundPages;