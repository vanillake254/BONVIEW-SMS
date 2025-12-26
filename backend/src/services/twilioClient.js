const twilio = require('twilio');

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    const err = new Error('Twilio credentials are not configured');
    err.statusCode = 500;
    throw err;
  }

  return twilio(accountSid, authToken);
}

function getTwilioSmsFrom() {
  const from = process.env.TWILIO_SMS_FROM;
  if (!from) {
    const err = new Error('TWILIO_SMS_FROM is not configured');
    err.statusCode = 500;
    throw err;
  }
  return from;
}

function getTwilioWhatsappFrom() {
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!from) {
    const err = new Error('TWILIO_WHATSAPP_FROM is not configured');
    err.statusCode = 500;
    throw err;
  }
  if (!String(from).toLowerCase().startsWith('whatsapp:')) {
    return `whatsapp:${from}`;
  }
  return from;
}

module.exports = {
  getTwilioClient,
  getTwilioSmsFrom,
  getTwilioWhatsappFrom,
};
