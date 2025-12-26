const express = require('express');
const { z } = require('zod');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const router = express.Router();

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200),
});

function timingSafeEqualStr(a, b) {
  const aBuf = Buffer.from(String(a));
  const bBuf = Buffer.from(String(b));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || '');

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({ error: 'Admin credentials are not configured' });
  }

  const email = parsed.data.email.trim().toLowerCase();

  if (!timingSafeEqualStr(email, adminEmail) || !timingSafeEqualStr(parsed.data.password, adminPassword)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'JWT_SECRET is not configured' });
  }

  const token = jwt.sign(
    {
      role: 'admin',
      email: adminEmail,
    },
    secret,
    { expiresIn: '12h' }
  );

  return res.json({ token });
});

module.exports = router;
