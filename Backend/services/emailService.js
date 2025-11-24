const nodemailer = require('nodemailer');

// Configurazione del trasportatore email
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Template HTML dell'email
const getOrderConfirmationHTML = (customerName, orderNumber, pdfLink) => {
    const currentYear = new Date().getFullYear();
    
    const htmlTemplate = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<title>Il tuo pacchetto è pronto — MyPocketQuest</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
  body, html {
    margin: 0;
    padding: 0;
    background: #0A0911;
    font-family: system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    color: #FFFFFF;
  }

  .wrapper {
    padding: 32px 0;
  }

  a{
    color: #D4A74F;
  }

  .container {
    max-width: 620px;
    margin: auto;
    background: #1B0B2E;
    border-radius: 24px;
    border: 2px solid #2D1546;
    overflow: hidden;
    box-shadow: 0 0 30px rgba(0,0,0,0.45);
  }

  /* HEADER */
  .minimal-header {
    padding: 60px 20px 50px;
    text-align: center;
    background: #4A127A;
    border-bottom: 2px solid #D4A74F;
    position: relative;
  }

  .minimal-header:before {
    content: "";
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    width: 260px;
    height: 260px;
    background: radial-gradient(circle, rgba(212,167,79,0.45), transparent 70%);
    filter: blur(28px);
    opacity: 0.6;
  }

  .title {
    font-size: 28px;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    position: relative;
    z-index: 2;
  }

  .title span { color: #D4A74F; }

  .tagline {
    margin-top: 10px;
    font-size: 12px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    opacity: 0.85;
  }

  /* HERO */
  .hero {
    padding: 32px 30px 10px;
    text-align: center;
    background: #1B0B2E;
  }

  .hero-title {
    font-size: 22px;
    font-weight: 700;
    color: #D4A74F;
    margin-bottom: 10px;
  }

  .hero-text {
    font-size: 15px;
    opacity: 0.9;
    line-height: 1.6;
    color: #EFE6FF;
  }

  /* CONTENT CARD */
  .card {
    margin: 28px 26px;
    padding: 28px 22px;
    background: #26123F;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.12);
  }

  .greeting {
    font-size: 16px;
    margin-bottom: 14px;
  }

  .paragraph {
    font-size: 14px;
    line-height: 1.7;
    color: #E8DAFF;
    margin-bottom: 14px;
  }

  .btn-area {
    margin: 26px 0;
    text-align: center;
  }

  .btn {
    padding: 12px 34px;
    border-radius: 12px;
    background: linear-gradient(180deg, #D4A74F, #8A6B2D);
    color: #1B0B2E !important;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-decoration: none;
    text-transform: uppercase;
    border: none;
    display: inline-block;
  }

  .small-info {
    font-size: 12px;
    opacity: 0.75;
    margin-top: 6px;
    text-align: center;
  }

  /* FOOTER */
  .footer {
    text-align: center;
    padding: 24px 20px;
    font-size: 11px;
    color: #C6B2DD;
  }

  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #D4A74F55, transparent);
    border: none;
    margin-bottom: 12px;
  }

  /* RESPONSIVE */
  @media screen and (max-width: 480px) {
    .wrapper { padding: 16px 0; }

    .minimal-header { padding: 40px 16px 36px; }
    .title { font-size: 22px; }

    .hero { padding: 22px 16px 6px; }
    .hero-title { font-size: 18px; }
    .hero-text { font-size: 14px; }

    .card { margin: 18px 16px; padding: 22px 16px; }
    .paragraph, .greeting { font-size: 14px; }

    .btn { padding: 10px 28px; font-size: 13px; }
  }
</style>

</head>
<body>
<div class="wrapper">
  <div class="container">

    <!-- HEADER -->
    <div class="minimal-header">
      <div class="title">MyPocket<span>Quest</span></div>
      <div class="tagline">Next Level: Real Life</div>
    </div>

    <!-- HERO -->
    <div class="hero">
      <div class="hero-title">Acquisto completato!</div>
      <div class="hero-text">
        L'avventura che hai scelto ti sta aspettando.<br>
        Preparati a calarti in una storia epica... nella vita reale.
      </div>
    </div>

    <!-- CONTENUTO -->
    <div class="card">

      <p class="greeting">Ciao ${customerName},</p>

      <p class="paragraph">
        Complimenti! Hai appena sbloccato un nuovo <strong>Pacchetto Quest</strong>.  
        Questo significa una cosa sola: <strong>sta per iniziare una nuova campagna.</strong>
      </p>

      <p class="paragraph">
        Dentro troverai <strong>20 missioni + 1 quest finale</strong> che metteranno alla prova il tuo spirito d'avventura.  
        Niente magie… o forse sì  
        Diciamo solo che il vero potere sei tu.
      </p>

      <p class="paragraph">
        Il PDF con la tua avventura è pronto per essere scaricato.  
        Aprilo, preparati, e inizia il viaggio!
      </p>

      <!-- CTA DOWNLOAD -->
      <div class="btn-area">
        <a href="${pdfLink}" class="btn">Scarica il tuo PDF</a>
        <div class="small-info">*Se il link non funziona, copia e incolla l'URL nel browser.</div>
      </div>

      <p class="paragraph">
        E ricordati una cosa fondamentale, avventuriero:<br>
        <strong>"Non tutte le quest iniziano in un dungeon. Alcune iniziano con un clic."</strong>
      </p>

      <p class="paragraph">
        Condividi le tue imprese con l'hashtag <strong>#MyPocketQuest</strong> e unisciti alla nostra compagnia su Instagram:<br>
        <a href="https://www.instagram.com/_mypocketquest_/">@_mypocketquest_</a>
      </p>

      <p class="paragraph" style="margin-bottom:0;">
        Che il tuo viaggio abbia inizio!<br>
        <strong>Il team Pocket5</strong>
      </p>

    </div>

    <!-- FOOTER -->
    <div class="footer">
      <hr class="divider">
      Hai ricevuto questa email perché hai acquistato un pacchetto su MyPocketQuest.<br>
      © ${currentYear} MyPocketQuest
    </div>

  </div>
</div>
</body>
</html>`;

    return htmlTemplate;
};

// Funzione per inviare email di conferma ordine
exports.sendOrderConfirmation = async (customerEmail, customerName, orderNumber, pdfLink = '#') => {
    try {
        const htmlContent = getOrderConfirmationHTML(customerName, orderNumber, pdfLink);

        const mailOptions = {
            from: `"MyPocketQuest" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `🎮 Il tuo pacchetto è pronto — Ordine ${orderNumber}`,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email inviata:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Errore invio email:', error);
        return { success: false, error: error.message };
    }
};

// Test della configurazione email
exports.verifyEmailConfig = async () => {
    try {
        await transporter.verify();
        console.log('✅ Configurazione email OK');
        return true;
    } catch (error) {
        console.error('❌ Configurazione email non valida:', error);
        return false;
    }
};
