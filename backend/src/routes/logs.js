const express = require('express');

const { query } = require('../services/db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, created_at AS "createdAt", created_by_email AS "createdByEmail", message, mode, recipient_count AS "recipientCount", status, results_json AS results, per_message_statuses_json AS "perMessageStatuses" FROM message_logs ORDER BY created_at DESC LIMIT 500'
    );
    res.json({ logs: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
