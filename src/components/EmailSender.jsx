
//todo Importo useState per gestire lo stato del form
import { useState } from "react";
//todo Importo emailjs per l'invio delle email
import emailjs from "emailjs-com";
//todo Importo il CSS per gli stili del componente
import "./EmailSender.css";

//todo Componente per l'invio di email tramite un form
export default function EmailSender() {
    //todo Stato per i dati del form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

    //todo Stato per il messaggio di stato dell'invio
  const [status, setStatus] = useState("");

    //todo Funzione per gestire i cambiamenti nei campi del form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    //todo Funzione per inviare l'email
  const sendEmail = (e) => {
    e.preventDefault();
    setStatus("Registrazione in corso...");

    //todo Configurazione EmailJS per inviare l'email
    emailjs
    //todo Invio dell'email utilizzando il servizio, template e user ID di EmailJS
      .send(
        //todo Qui va impostato l'email service Gmail
        "service_yrfxb13",
        //todo Qui va impostato il template creato su EmailJS
        "template_93d9uh2",
        formData,
        //todo Qui viene impostata la key
        "-wnk8k24vEMFJaNQS"
      )
    //todo Gestione del successo o fallimento dell'invio
      .then(() => {
        setStatus("Registrazione completata! Controlla la tua email per il messaggio di benvenuto.");
        setFormData({ name: "", email: "", message: "" });
      })
      .catch(() => {
        setStatus("Errore nella registrazione. Riprova più tardi.");
      });
  };

  //todo Funzione per determinare il tipo di classe del messaggio di stato
  const getStatusClass = () => {
    if (status.includes("completata")) return "status-success";
    if (status.includes("Errore")) return "status-error";
    if (status.includes("corso")) return "status-loading";
    return "";
  };

  return (
    <div className="email-sender-container">
      <div className="email-form-card">
        <h2 className="email-form-title">Unisciti a MyPocketQuest!</h2>
        <p className="email-form-subtitle">
          Registrati per ricevere la tua email di benvenuto e per iniziare a livellare
        </p>
        
        <form className="email-form" onSubmit={sendEmail}>
          <div className="input-group">
            <label className="input-label" htmlFor="name">Il Vostro nome, My Lord</label>
            <input
              id="name"
              className="email-input"
              type="text"
              name="name"
              placeholder="Chi siete Voi?"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="email">La Vostra email, Mio Sire</label>
            <input
              id="email"
              className="email-input"
              type="email"
              name="email"
              placeholder="Qual'è la Vostra email?"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="email-submit-btn"
            type="submit"
            disabled={status === "Registrazione in corso..."}
          >
            {status === "Registrazione in corso..." ? (
              <>
                <span className="loading-spinner"></span>
                Registrazione...
              </>
            ) : (
              "Registrati Ora!"
            )}
          </button>
        </form>
        
        {/* todo: Mostro il messaggio di stato se presente */}
        {status && (
          <div className={`status-message ${getStatusClass()}`}>
            {status === "Registrazione in corso..." && <span className="loading-spinner"></span>}
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
