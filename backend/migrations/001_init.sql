CREATE TABLE IF NOT EXISTS members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone_e164 TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'subscribed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS members_status_idx ON members(status);

CREATE TABLE IF NOT EXISTS message_logs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by_email TEXT,
  message TEXT NOT NULL,
  mode TEXT NOT NULL,
  recipient_count INT NOT NULL,
  status TEXT NOT NULL,
  results_json JSONB NOT NULL,
  per_message_statuses_json JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS opt_out_events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  phone_e164 TEXT NOT NULL,
  channel TEXT NOT NULL,
  body TEXT
);
