
//todo Importo useState per gestire lo stato del form
import { useState } from "react";
//todo Importo emailjs per l'invio delle email
import emailjs from "emailjs-com";

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
    setStatus("Invio...");

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
        setStatus("Email inviata!");
        setFormData({ name: "", email: "", message: "" });
      })
      .catch(() => {
        setStatus("Errore nell'invio");
      });
  };

  return (
    <div>
      <form onSubmit={sendEmail}>
        <input
          type="text"
          name="name"
          placeholder="Nome"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="La tua email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <textarea
          name="message"
          placeholder="Messaggio"
          value={formData.message}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
        >
          Invia
        </button>
      </form>
    </div>
  );
}
