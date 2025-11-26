// services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mypocketfive@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * @param {string} to - destinatario
 * @param {number} amount - importo totale
 * @param {string} currency - valuta
 * @param {string} paymentIntentId - ID transazione Stripe
 * @param {string} date - data ordine
 * @param {array} products - array di prodotti acquistati
 * @param {boolean} isInternal - true se email interna all'azienda
 * @param {object} customerData - dati cliente (solo email interna)
 */
async function sendPaymentConfirmationEmail({ to, amount, currency = 'EUR', paymentIntentId, date, products = [], isInternal = false, customerData = {} }) {
  console.log('Provo a inviare email a', to);

  // Generiamo la lista prodotti in HTML
  const productListHtml = products.length
    ? `<ul>${products.map(p => `<li>${p.name} x${p.qty} — ${p.price}€</li>`).join('')}</ul>`
    : '<p>Nessun prodotto dettagliato disponibile.</p>';

  let subject, html;

  if (isInternal) {
    subject = `Nuovo Ordine da ${customerData.customer_email || 'Cliente'}`;
    html = `
      <h2>Nuovo Ordine Ricevuto!</h2>
      <p>Cliente: ${customerData.customer_name || 'N/A'} (${customerData.customer_email || 'N/A'})</p>
      <p>Data: ${date}</p>
      <p>Indirizzo spedizione: ${customerData.shipping_address || 'N/A'}</p>
      <p>Codice transazione: ${paymentIntentId}</p>
      <p>Prodotti acquistati: ${productListHtml}</p>
    `;
  } else {
    subject = 'Il tuo pacchetto è pronto — MyPocketQuest';
    html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Il tuo pacchetto è pronto — MyPocketQuest</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body, html { margin:0; padding:0; background:#0A0911; font-family:system-ui,sans-serif; color:#FFFFFF; }
    .wrapper { padding:32px 0; }
    a { color:#D4A74F; }
    ul {color: #fff;}
    .gs li{ color: #FFF;}
    p { color: #FFFFFF;}
    .products {font-size:14px; line-height:1.7; color:#FFFFFF !important; margin-bottom:14px;}
    .white { color:#FFF !important;}
    .container { max-width:620px; margin:auto; background:#1B0B2E; border-radius:24px; border:2px solid #2D1546; overflow:hidden; box-shadow:0 0 30px rgba(0,0,0,0.45); }
    .minimal-header { padding:60px 20px 50px; text-align:center; background:#4A127A; border-bottom:2px solid #D4A74F; position:relative; }
    .minimal-header:before { content:""; position:absolute; top:-40px; left:50%; transform:translateX(-50%); width:260px; height:260px; background:radial-gradient(circle,rgba(212,167,79,0.45),transparent 70%); filter:blur(28px); opacity:0.6; }
    .title { font-size:28px; font-weight:900; letter-spacing:0.08em; text-transform:uppercase; position:relative; z-index:2}
    .title span { color:#D4A74F; }
    .tagline { margin-top:10px; font-size:12px; letter-spacing:0.22em; text-transform:uppercase; opacity:1; color:#FFFFFF !important;}
    .hero { padding:32px 30px 10px; text-align:center; background:#1B0B2E; }
    .hero-title { font-size:22px; font-weight:700; color:#D4A74F; margin-bottom:10px; }
    .hero-text { font-size:15px; opacity:0.9; line-height:1.6; color:#EFE6FF; }
    .card { margin:28px 26px; padding:28px 22px; background:#26123F; border-radius:18px; border:1px solid rgba(255,255,255,0.12); }
    .greeting { font-size:16px; margin-bottom:14px; }
    .paragraph { font-size:14px; line-height:1.7; color:#FFFFFF; margin-bottom:14px; }
    .btn-area { margin:26px 0; text-align:center; }
    .btn { padding:12px 34px; border-radius:12px; background:linear-gradient(180deg,#D4A74F,#8A6B2D); color:#1B0B2E !important; font-weight:800; letter-spacing:0.08em; text-decoration:none; text-transform:uppercase; display:inline-block; }
    .small-info { font-size:12px; opacity:0.75; margin-top:6px; text-align:center; }
    .footer { text-align:center; padding:24px 20px; font-size:11px; color:#C6B2DD; }
    .divider { height:1px; background:linear-gradient(90deg,transparent,#D4A74F55,transparent); border:none; margin-bottom:12px; }
    @media screen and (max-width:480px) {
      .wrapper { padding:16px 0; }
      .minimal-header { padding:40px 16px 36px; }
      .title { font-size:22px; }
      .hero { padding:22px 16px 6px; }
      .hero-title { font-size:18px; }
      .card { margin:18px 16px; padding:22px 16px; }
      .btn { padding:10px 28px; font-size:13px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">

      <div class="minimal-header">
        <div class="title white">MyPocket<span>Quest</span></div>
        <div class="tagline white">Next Level: Real Life</div>
      </div>

      <div class="hero">
        <div class="hero-title white">Acquisto completato!</div>
        <div class="hero-text">
          L’avventura che hai scelto ti sta aspettando.<br>
          Preparati a calarti in una storia epica... nella vita reale.
        </div>
      </div>

      <div class="card">
        <p class="greeting white">Ciao avventuriero,</p>

        <p class="paragraph">
          Complimenti! Hai appena sbloccato un nuovo <strong>Pacchetto Quest</strong>.
        </p>

        <p class="paragraph">
          Abbiamo ricevuto correttamente <strong>${amount} ${currency}</strong> in data <strong>${date}</strong>.<br>
          Codice transazione: <code>${paymentIntentId}</code>
        </p>

        <p class="products white">
          Prodotti acquistati: ${productListHtml}
        </p>

        <p class="paragraph">
          La Box con la tua avventura è pronta. Aprila, preparati, e inizia il viaggio!
        </p>

        <p class="paragraph">
          Condividi le tue imprese con #MyPocketQuest su Instagram: <a href="https://www.instagram.com/_mypocketquest_/">@_mypocketquest_</a>
        </p>

        <p class="paragraph" style="margin-bottom:0;">
          Che il tuo viaggio abbia inizio!<br>
          <strong>Il team Pocket5</strong>
        </p>
      </div>

      <div class="footer">
        <hr class="divider">
        Hai ricevuto questa email perché hai acquistato su MyPocketQuest.<br>
        © 2025 MyPocketQuest
      </div>

    </div>
  </div>
</body>
</html>
    `;
  }

  try {
    await transporter.sendMail({ from: '"MyPocketQuest" <mypocketfive@gmail.com>', to, subject, html });
    console.log(`✅ Email inviata a ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Errore invio Gmail:', error.message);
    throw error;
  }
}

module.exports = { sendPaymentConfirmationEmail };
