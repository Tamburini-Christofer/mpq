
//todo Importo useState per gestire lo stato del form
import { useState } from "react";
//todo Importo emailjs per l'invio delle email
import emailjs from "emailjs-com";
//todo Importo il CSS per gli stili del componente
import "./EmailSender.css";

//todo Componente per l'invio di email tramite un form
export default function EmailSender({ onClose }) {
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
        {/* todo: Logo MyPocketQuest */}
        <div className="logo-box">
          <h1 className="logo-title">MyPocket<span>Quest</span></h1>
          <p className="logo-subtitle">Next Level: Real Life</p>
        </div>
        
        <h2 className="email-form-title">Unisciti alla Missione!</h2>
        <p className="email-form-subtitle">
          Compila il form per ricevere la tua email di benvenuto
        </p>
        
        <form className="email-form" onSubmit={sendEmail}>
          <div className="input-group">
            <input
              id="name"
              className="email-input"
              type="text"
              name="name"
              placeholder="Il Vostro nome, My Lord"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              id="email"
              className="email-input"
              type="email"
              name="email"
              placeholder="La Vostra email, Mio Sire"
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
                Invio email tramite piccione viaggiatore...
              </>
            ) : (
              "Voglio la mia email di benvenuto!"
            )}
          </button>
        </form>
        
        {/* todo: Pulsante per saltare la registrazione */}
        <button
          className="skip-btn"
          type="button"
          onClick={onClose}
        >
          Salta presentazioni e partiamo subito con l'avventura!
        </button>
        
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
