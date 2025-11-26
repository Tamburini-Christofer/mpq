// test-gmail.js
require('dotenv').config();
const { sendPaymentConfirmationEmail } = require('./services/emailService');

sendPaymentConfirmationEmail({
  to: 'christofer.tamburini92@gmail.com',
  amount: '19.99',
  currency: 'EUR',
  paymentIntentId: 'pi_test_123456',
  date: new Date().toLocaleDateString('it-IT'),
}).then(() => console.log('EMAIL GMAIL INVIATA! Controlla la posta in arrivo'));