const express = require('express');
const { z } = require('zod');

const { query } = require('../services/db');
const { getTwilioClient, getTwilioSmsFrom, getTwilioWhatsappFrom } = require('../services/twilioClient');
const {
  assertWithinSendingHours,
  assertNoSpamWording,
  formatSmsWithStopFooter,
  formatWhatsappTemplateSafe,
} = require('../utils/compliance');

const router = express.Router();

const sendSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  mode: z.enum(['sms', 'whatsapp', 'both']),
  recipients: z.union([
    z.object({ type: z.literal('all') }),
    z.object({ type: z.literal('selected'), memberIds: z.array(z.union([z.string().min(1), z.number().int()])).min(1).max(2000) }),
  ]),
});

async function loadRecipients(recipients) {
  if (recipients.type === 'all') {
    const { rows } = await query(
      'SELECT id, name, phone_e164 AS "phoneE164", status FROM members WHERE status=$1',
      ['subscribed']
    );
    return rows;
  }

  const ids = recipients.memberIds
    .map((v) => (typeof v === 'number' ? v : Number(String(v).trim())))
    .filter((n) => Number.isFinite(n));

  if (ids.length === 0) return [];

  const { rows } = await query(
    'SELECT id, name, phone_e164 AS "phoneE164", status FROM members WHERE id = ANY($1::bigint[]) AND status=$2',
    [ids, 'subscribed']
  );
  return rows;
}

router.post('/', async (req, res, next) => {
  try {
    const parsed = sendSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    if (parsed.data.mode === 'whatsapp' || parsed.data.mode === 'both') {
      return res.status(400).json({
        error: 'WhatsApp sending is disabled for now. Please use SMS only.',
      });
    }

    assertWithinSendingHours();
    assertNoSpamWording(parsed.data.message);

    const members = await loadRecipients(parsed.data.recipients);

    if (members.length === 0) {
      return res.status(400).json({ error: 'No subscribed recipients found' });
    }

    const client = getTwilioClient();

    const smsBody = formatSmsWithStopFooter(parsed.data.message);
    const sendSms = true;
    const sendWa = false;

    const results = {
      sms: { attempted: 0, sent: 0, failed: 0 },
      whatsapp: { attempted: 0, sent: 0, failed: 0 },
    };

    const perMessageStatuses = [];

    for (const member of members) {
      const to = member.phoneE164;

      if (sendSms) {
        results.sms.attempted += 1;
        try {
          const msg = await client.messages.create({
            from: getTwilioSmsFrom(),
            to,
            body: smsBody,
          });
          results.sms.sent += 1;
          perMessageStatuses.push({ channel: 'sms', to, status: 'sent', sid: msg.sid });
        } catch (e) {
          results.sms.failed += 1;
          perMessageStatuses.push({ channel: 'sms', to, status: 'failed', error: String(e.message || e) });
        }
      }

      if (sendWa) {
        // WhatsApp sending disabled
      }
    }

    const createdAt = new Date();
    const status = (results.sms.failed + results.whatsapp.failed) > 0 ? 'partial' : 'sent';

    await query(
      'INSERT INTO message_logs(created_at, created_by_email, message, mode, recipient_count, status, results_json, per_message_statuses_json) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb)',
      [
        createdAt,
        req.user.email || null,
        parsed.data.message,
        parsed.data.mode,
        members.length,
        status,
        JSON.stringify(results),
        JSON.stringify(perMessageStatuses),
      ]
    );

    return res.json({ ok: true, results, recipientCount: members.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
