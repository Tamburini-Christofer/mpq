import { Link } from "react-router-dom"
import "../styles/pages/successPayment.css"

const SuccessPayment = () => {
 return (
    <div className="success-wrapper">
        <div className="container_success">
            <p className="stato-pagamento">
                IL TUO PAGAMENTO E' ANDATO A BUON FINE! <br></br> TI VERRÀ SPEDITO NEI PROSSIMI GIORNI!
            </p>
        </div>
        <button><Link to="/">Torna alla Pagina Iniziale</Link></button>
    </div>
 )
}

export default SuccessPayment