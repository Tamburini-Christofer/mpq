
//todo Importo useState per gestire lo stato del form
import { useState } from "react";
//todo Importo emailjs per l'invio delle email
import emailjs from "emailjs-com";
//todo Importo il CSS per gli stili del componente
import "../styles/components/EmailSender.css";

//todo Componente per l'invio di email tramite un form
export default function EmailSender({ onClose }) {
  // Stato per i dati del form
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  // Stato testuale per messaggi brevi all'utente
  const [status, setStatus] = useState("");
  // Flag booleani per gestire il rendering dello stato in modo affidabile
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  //todo Funzione per gestire i cambiamenti nei campi del form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Funzione semplice per validare la struttura di un indirizzo email
  const isValidEmail = (email) => {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  //todo Funzione per inviare l'email
  const sendEmail = async (e) => {
    e.preventDefault();
    // Controllo validità email: se non valida, mostro messaggio specifico
    if (!isValidEmail(formData.email)) {
      setStatus('errore inserimento valore email');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    setStatus("Invio in corso...");
    setIsLoading(true);
    setIsError(false);
    setIsSuccess(false);

    const templateParams = {
      name: formData.name,
      from_name: formData.name,
      user_name: formData.name,

      email: formData.email,
      to_email: formData.email,
      user_email: formData.email,

      // messaggio plain (se servisse nel template)
      message: formData.message || "",

      // Campi che il template EmailJS utilizza: nome_utente, nome e year
      // mantenere sia `nome_utente` che `nome` per compatibilità con template diversi
      nome_utente: formData.name,
      nome: formData.name,
      year: new Date().getFullYear(),
    };

    try {
      console.log('EmailSender: invio email a', templateParams.to_email, 'params:', templateParams);
      const sendPromise = emailjs.send(
        "service_yrfxb13",
        "template_93d9uh2",
        templateParams,
        "-wnk8k24vEMFJaNQS"
      );

      const timeoutMs = 20000; // 20s
      const timeoutPromise = new Promise((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error('timeout'));
        }, timeoutMs);
      });

      await Promise.race([sendPromise, timeoutPromise]);

      console.log('EmailSender: invio completato');
      setStatus("Invio completato! Controlla la tua email per il messaggio di benvenuto.");
      setIsSuccess(true);
      setIsLoading(false);
      setFormData({ name: "", email: "", message: "" });
      if (onClose) setTimeout(() => onClose(), 4000);
    } catch (err) {
      console.error('EmailSender: errore invio email', err);
      if (err && err.message === 'timeout') {
        setStatus('Errore: timeout invio. Riprova.');
      } else {
        setStatus('Errore nell\'invio. Riprova più tardi.');
      }
      setIsError(true);
      setIsLoading(false);
    }
  };

  //todo Funzione per determinare il tipo di classe del messaggio di stato
  const getStatusClass = () => {
    if (isSuccess) return "status-success";
    if (isError) return "status-error";
    if (isLoading) return "status-loading";
    return "";
  };

  return (
    <div className="email-sender-container">
      <div className="email-form-card">
        {/* todo: Logo MyPocketQuest */}
        <h2 className="email-form-title">Unisciti alla Missione!</h2>
        <p className="email-form-subtitle">Compila il form per ricevere la tua email di benvenuto</p>

        <form className="email-form" onSubmit={sendEmail}>
          <div className="input-group">
            <label className="input-label" htmlFor="name">Nome</label>
            <input
              id="name"
              className="email-input"
              type="text"
              name="name"
              placeholder="Inserisci il tuo nome"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="email-input"
              type="email"
              name="email"
              placeholder="La tua email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <button className="email-submit-btn" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Invio in corso...
              </>
            ) : (
              "Voglio la mia email di benvenuto!"
            )}
          </button>
        </form>

        {/* todo: Pulsante per saltare la registrazione */}
        <button className="skip-btn" type="button" onClick={onClose}>
          Salta presentazioni e partiamo subito con l'avventura!
        </button>

        {/* todo: Mostro il messaggio di stato se presente */}
        {status && (
          <div className={`status-message ${getStatusClass()}`}>
            {isLoading && <span className="loading-spinner"></span>}
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
