const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');

const { query } = require('../services/db');
const { normalizeUSPhoneToE164 } = require('../utils/phone');

const router = express.Router();

router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(7).max(40),
});

router.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const phoneE164 = normalizeUSPhoneToE164(parsed.data.phone);
    if (!phoneE164) {
      return res.status(400).json({ error: 'Phone number must be a valid US number' });
    }

    const name = parsed.data.name;

    const existing = await query('SELECT id, status FROM members WHERE phone_e164=$1', [phoneE164]);
    const existed = existing.rows.length > 0;

    const { rows } = await query(
      'INSERT INTO members(name, phone_e164, status) VALUES($1,$2,$3) ON CONFLICT (phone_e164) DO UPDATE SET name = EXCLUDED.name, status = $3, updated_at = NOW() RETURNING id, name, phone_e164 AS "phoneE164", status',
      [name, phoneE164, 'subscribed']
    );

    return res.status(201).json({ ok: true, existed, member: rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
