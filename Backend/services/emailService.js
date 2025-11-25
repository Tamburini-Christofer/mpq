// Backend/services/emailService.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPaymentConfirmationEmail({ to, amount, currency = 'EUR', paymentIntentId, date }) {
  try {
    const from = `MyPocketFive <${process.env.EMAIL_USER || 'mypocketfive@gmail.com'}>`;
    await resend.emails.send({
      from,
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

async function sendOrderConfirmation(toCustomerEmail, customerName, orderNumber, pdfLink = '#') {
  try {
    const from = `MyPocketFive <${process.env.EMAIL_USER || 'mypocketfive@gmail.com'}>`;
    // Email to customer
    await resend.emails.send({
      from,
      to: toCustomerEmail,
      subject: `Conferma ordine ${orderNumber}`,
      html: `
        <h2>Grazie per il tuo ordine, ${customerName}!</h2>
        <p>Il tuo ordine <strong>${orderNumber}</strong> è stato ricevuto correttamente.</p>
        <p>Troverai il riepilogo e la ricevuta all'indirizzo email indicato.</p>
        <p>Link riepilogo: <a href="${pdfLink}">${pdfLink}</a></p>
        <hr>
        <p>Grazie per aver scelto MyPocketFive.</p>
      `,
    });

    // Email to company
    const companyEmail = process.env.EMAIL_USER || 'mypocketfive@gmail.com';
    await resend.emails.send({
      from,
      to: companyEmail,
      subject: `Nuovo ordine ricevuto: ${orderNumber}`,
      html: `
        <h2>Nuovo ordine: ${orderNumber}</h2>
        <p>Cliente: ${customerName} &lt;${toCustomerEmail}&gt;</p>
        <p>Apri il pannello ordini per il dettaglio, oppure scarica il riepilogo: <a href="${pdfLink}">${pdfLink}</a></p>
      `,
    });

    console.log(`Order emails sent for ${orderNumber} to ${toCustomerEmail} and ${companyEmail}`);
  } catch (error) {
    console.error('Errore invio email ordine:', error);
    throw error;
  }
}

module.exports = { sendPaymentConfirmationEmail, sendOrderConfirmation };