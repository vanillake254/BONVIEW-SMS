const admin = require('firebase-admin');

async function requireFirebaseAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Missing Authorization Bearer token' });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    const requireAdmin = String(process.env.REQUIRE_ADMIN_CLAIM || 'true').toLowerCase() !== 'false';
    if (requireAdmin && decoded.admin !== true) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      claims: decoded,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireFirebaseAuth };
