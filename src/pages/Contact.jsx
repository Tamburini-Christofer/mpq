//todo Importo useState per gestire lo stato del form
import { useState } from "react";
//todo Importo il CSS per gli stili del componente
import "../styles/pages/Contact.css";

//todo Componente pagina contatti per assistenza
export default function Contact() {
  //todo Stato per i dati del form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  //todo Stato per il messaggio di stato dell'invio
  const [status, setStatus] = useState("");

  //todo Funzione per gestire i cambiamenti nei campi del form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //todo Funzione per inviare l'email tramite mailto
  const sendEmail = (e) => {
    e.preventDefault();
    
    //todo Costruisco il corpo dell'email
    const emailBody = `Nome: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0A%0D%0AMessaggio:%0D%0A${formData.message}`;
    
    //todo Creo il link mailto
    const mailtoLink = `mailto:mypocketfive@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${emailBody}`;
    
    //todo Apro il client email
    window.location.href = mailtoLink;
    
    //todo Resetto il form
    setStatus("Client email aperto! Completa l'invio dal tuo programma di posta.");
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 2000);
  };

  //todo Funzione per determinare il tipo di classe del messaggio di stato
  const getStatusClass = () => {
    if (status.includes("aperto")) return "status-success";
    return "";
  };

  return (
    <div className="contact-page-container">
      <div className="contact-content">
        {/* todo: Sezione informazioni contatto */}
        <div className="contact-info-section">
          <h1 className="contact-main-title">Contatta l'Assistenza</h1>
          <p className="contact-description">
            Hai bisogno di aiuto? Il nostro team di supporto è qui per assisterti.
            Compila il form e ti risponderemo il prima possibile.
          </p>

            <div className="contact-detail-item">
              <div className="contact-icon"><img src="/public/icon/EmailOffice.png" alt="" /></div>
              <div>
                <h3>Tempo di risposta</h3>
                <p>Entro 24-48 ore</p>
              </div>
            </div>
          
          <div className="contact-details">
            <div className="contact-detail-item">
              <div className="contact-icon"><img src="/public/icon/EmailSend.png" alt="" /></div>
              <div>
                <h3>Email</h3>
                <p>mypocketfive@gmail.com</p>
              </div>
            </div>
          
          </div>
        </div>

        {/* todo: Sezione form contatto */}
        <div className="contact-form-section">
          <div className="contact-form-card">
            <h2 className="contact-form-title">Invia un Messaggio</h2>
            
            <form className="contact-form" onSubmit={sendEmail}>
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label" htmlFor="name">
                    Nome Completo *
                  </label>
                  <input
                    id="name"
                    className="contact-input"
                    type="text"
                    name="name"
                    placeholder="Il tuo nome"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="email">
                    Email *
                  </label>
                  <input
                    id="email"
                    className="contact-input"
                    type="email"
                    name="email"
                    placeholder="tua@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="subject">
                  Oggetto *
                </label>
                <input
                  id="subject"
                  className="contact-input"
                  type="text"
                  name="subject"
                  placeholder="Di cosa hai bisogno?"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="message">
                  Messaggio *
                </label>
                <textarea
                  id="message"
                  className="contact-textarea"
                  name="message"
                  placeholder="Scrivi qui il tuo messaggio..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="2"
                />
              </div>

              <button
                className="contact-submit-btn"
                type="submit"
              >
                Invia Messaggio
              </button>
            </form>

            {/* todo: Mostro il messaggio di stato se presente */}
            {status && (
              <div className={`status-message ${getStatusClass()}`}>
                {status}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
