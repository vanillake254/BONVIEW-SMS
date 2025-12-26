const express = require('express');
const { z } = require('zod');

const { query } = require('../services/db');
const { normalizeUSPhoneToE164 } = require('../utils/phone');

const router = express.Router();

const createMemberSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(7).max(40),
});

const bulkCreateSchema = z.object({
  members: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        phone: z.string().trim().min(7).max(40),
      })
    )
    .min(1)
    .max(5000),
});

const idParamSchema = z.object({
  id: z.string().min(1),
});

const updateStatusSchema = z.object({
  status: z.enum(['subscribed', 'suspended']),
});

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, name, phone_e164 AS "phoneE164", status, created_at AS "createdAt", updated_at AS "updatedAt" FROM members ORDER BY created_at DESC LIMIT 1000'
    );

    res.json({ members: rows });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = createMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const phoneE164 = normalizeUSPhoneToE164(parsed.data.phone);
    if (!phoneE164) {
      return res.status(400).json({ error: 'Phone number must be a valid US number' });
    }

    try {
      const { rows } = await query(
        'INSERT INTO members(name, phone_e164, status) VALUES($1, $2, $3) RETURNING id, name, phone_e164 AS "phoneE164", status, created_at AS "createdAt", updated_at AS "updatedAt"',
        [parsed.data.name, phoneE164, 'subscribed']
      );
      return res.status(201).json({ member: rows[0] });
    } catch (e) {
      if (String(e.code) === '23505') {
        return res.status(409).json({ error: 'Member with this phone number already exists' });
      }
      throw e;
    }
  } catch (err) {
    next(err);
  }
});

router.post('/bulk', async (req, res, next) => {
  try {
    const parsed = bulkCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const normalized = parsed.data.members
      .map((m) => {
        const phoneE164 = normalizeUSPhoneToE164(m.phone);
        if (!phoneE164) return null;
        return {
          name: m.name,
          phoneE164,
        };
      })
      .filter(Boolean);

    const uniqueByPhone = new Map();
    for (const m of normalized) {
      if (!uniqueByPhone.has(m.phoneE164)) uniqueByPhone.set(m.phoneE164, m);
    }

    const candidates = Array.from(uniqueByPhone.values());
    if (candidates.length === 0) {
      return res.status(400).json({ error: 'No valid US phone numbers found' });
    }

    const invalidCount = parsed.data.members.length - normalized.length;

    const before = await query('SELECT COUNT(*)::int AS c FROM members');
    const beforeCount = before.rows[0].c;

    for (let i = 0; i < candidates.length; i += 500) {
      const slice = candidates.slice(i, i + 500);
      const names = slice.map((m) => m.name);
      const phones = slice.map((m) => m.phoneE164);

      await query(
        'INSERT INTO members(name, phone_e164, status) SELECT * FROM UNNEST($1::text[], $2::text[], $3::text[]) ON CONFLICT (phone_e164) DO NOTHING',
        [names, phones, slice.map(() => 'subscribed')]
      );
    }

    const after = await query('SELECT COUNT(*)::int AS c FROM members');
    const afterCount = after.rows[0].c;
    const createdCount = afterCount - beforeCount;
    const duplicateCount = candidates.length - createdCount;

    return res.status(201).json({
      createdCount,
      invalidCount,
      duplicateCount,
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const paramsParsed = idParamSchema.safeParse(req.params);
    const bodyParsed = updateStatusSchema.safeParse(req.body);

    if (!paramsParsed.success || !bodyParsed.success) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const id = Number(paramsParsed.data.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const { rows } = await query(
      'UPDATE members SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING id, name, phone_e164 AS "phoneE164", status, created_at AS "createdAt", updated_at AS "updatedAt"',
      [bodyParsed.data.status, id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Member not found' });

    return res.json({ member: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const paramsParsed = idParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const id = Number(paramsParsed.data.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const { rows } = await query('DELETE FROM members WHERE id=$1 RETURNING id', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Member not found' });

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
