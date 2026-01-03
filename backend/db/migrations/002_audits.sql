-- Audits table for transparency
CREATE TABLE audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  actor_id uuid,
  payload jsonb,
  payload_hash text,
  anchor_ref text,
  created_at timestamptz DEFAULT now()
);
