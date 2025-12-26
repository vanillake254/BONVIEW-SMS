const { DateTime } = require('luxon');

const STOP_KEYWORDS = ['stop', 'stopall', 'unsubscribe', 'cancel', 'end', 'quit'];

function isStopMessage(body) {
  const text = String(body || '').trim().toLowerCase();
  if (!text) return false;
  const firstToken = text.split(/\s+/)[0];
  return STOP_KEYWORDS.includes(firstToken);
}

function assertWithinSendingHours() {
  const tz = process.env.CHURCH_TIMEZONE || 'America/New_York';
  const now = DateTime.now().setZone(tz);

  const startHour = Number(process.env.SEND_START_HOUR || 6);
  const endHour = Number(process.env.SEND_END_HOUR || 22);

  const hour = now.hour;
  if (hour < startHour || hour >= endHour) {
    const err = new Error(
      `Sending is restricted to ${startHour}:00–${endHour}:00 (${tz}). Please try again during approved hours.`
    );
    err.statusCode = 403;
    throw err;
  }
}

function assertNoSpamWording(message) {
  const text = String(message || '').toLowerCase();

  const blocked = [
    'free money',
    'winner',
    'win big',
    'act now',
    'urgent',
    'limited time',
    'click here',
    'guaranteed',
  ];

  const hits = blocked.filter((w) => text.includes(w));
  if (hits.length > 0) {
    const err = new Error('Message blocked due to high-risk spam wording. Please rewrite with a church-appropriate tone.');
    err.statusCode = 400;
    throw err;
  }
}

function formatSmsWithStopFooter(message) {
  const base = String(message || '').trim();
  const footer = 'Reply STOP to unsubscribe.';

  if (!base) return '';

  if (base.toLowerCase().includes(footer.toLowerCase())) return base;

  return `${base}\n\n${footer}`;
}

function formatWhatsappTemplateSafe(message) {
  let text = String(message || '').trim();

  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

  text = text.replace(/\r\n/g, '\n');

  text = text.replace(/\n{3,}/g, '\n\n');

  return text;
}

module.exports = {
  isStopMessage,
  assertWithinSendingHours,
  assertNoSpamWording,
  formatSmsWithStopFooter,
  formatWhatsappTemplateSafe,
};
