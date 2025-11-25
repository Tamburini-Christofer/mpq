// Backend/services/emailService.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPaymentConfirmationEmail({ to, amount, currency = 'EUR', paymentIntentId, date }) {
  try {
    await resend.emails.send({
      from: 'Il tuo negozio <mypocketfive@gmail.com>', 
      to,
      subject: 'Pagamento ricevuto – Grazie per il tuo acquisto!',
      html: `
        <h2>Grazie per il tuo pagamento!</h2>
        <p>Abbiamo ricevuto correttamente <strong>${amount} ${currency}</strong> in data ${date}.</p>
        <p>Codice transazione: <code>${paymentIntentId}</code></p>
        <hr>
        <p>Speriamo che la box che hai acquistato ti aiuti a scoprire nuove cose sul mondo tuo interiore, immergendoti con quello esterno.</p>
        <br>
        <p>A presto!<br><strong>MyPocketQuest!/strong></p>
      `,
    });
    console.log(`Email inviata con successo a ${to}`);
  } catch (error) {
    console.error('Errore invio email con Resend:', error);
  }
}

module.exports = { sendPaymentConfirmationEmail };