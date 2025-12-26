const express = require('express');
const { z } = require('zod');

const { query } = require('../services/db');
const { isStopMessage } = require('../utils/compliance');
const { normalizeUSPhoneToE164, stripTwilioFrom } = require('../utils/phone');

const router = express.Router();

router.post(
  '/',
  express.urlencoded({ extended: false }),
  async (req, res, next) => {
    try {
      const schema = z.object({
        From: z.string().optional(),
        Body: z.string().optional(),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).send('Bad Request');
      }

      const fromRaw = stripTwilioFrom(parsed.data.From);
      const body = parsed.data.Body || '';

      if (!fromRaw) {
        return res.status(200).send('OK');
      }

      const fromE164 = normalizeUSPhoneToE164(fromRaw);
      if (!fromE164) {
        return res.status(200).send('OK');
      }

      if (isStopMessage(body)) {
        const channel = String(parsed.data.From || '').toLowerCase().startsWith('whatsapp:') ? 'whatsapp' : 'sms';

        await query('UPDATE members SET status=$2, updated_at=NOW() WHERE phone_e164=$1', [fromE164, 'unsubscribed']);
        await query('INSERT INTO opt_out_events(phone_e164, channel, body) VALUES($1, $2, $3)', [fromE164, channel, String(body)]);
      }

      return res.status(200).send('OK');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
