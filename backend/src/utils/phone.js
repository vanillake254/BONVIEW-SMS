const { parsePhoneNumberFromString } = require('libphonenumber-js');

function normalizeUSPhoneToE164(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;

  const parsed = parsePhoneNumberFromString(raw, 'US');
  if (!parsed || !parsed.isValid()) return null;

  if (parsed.country !== 'US') return null;

  return parsed.number;
}

function stripTwilioFrom(from) {
  const raw = String(from || '').trim();
  if (raw.toLowerCase().startsWith('whatsapp:')) {
    return raw.slice('whatsapp:'.length);
  }
  return raw;
}

module.exports = {
  normalizeUSPhoneToE164,
  stripTwilioFrom,
};
