require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { requireJwtAuth } = require('./middleware/requireJwtAuth');
const authRouter = require('./routes/auth');
const publicRouter = require('./routes/public');
const membersRouter = require('./routes/members');
const logsRouter = require('./routes/logs');
const messagingRouter = require('./routes/messaging');
const twilioWebhookRouter = require('./routes/twilioWebhook');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.length === 0) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('CORS: origin not allowed'));
    },
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/twilio-webhook', twilioWebhookRouter);

app.use(express.json({ limit: '1mb' }));

app.use('/public', publicRouter);
app.use('/auth', authRouter);

app.use('/members', requireJwtAuth, membersRouter);
app.use('/send-message', requireJwtAuth, messagingRouter);
app.use('/logs', requireJwtAuth, logsRouter);

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = status >= 500 ? 'Internal Server Error' : err.message;
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(status).json({ error: message });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${port}`);
});
