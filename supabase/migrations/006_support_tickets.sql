-- Support tickets: created by the escalation service when AI confidence is low.
-- Chunks are intentionally excluded — only the user-facing question/answer is stored.

CREATE TABLE support_tickets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question    TEXT        NOT NULL,
  answer      TEXT        NOT NULL,
  confidence  FLOAT       NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'open',
  sources     JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- update_updated_at_column() already exists from migration 001
CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_support_tickets_status     ON support_tickets(status);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);
