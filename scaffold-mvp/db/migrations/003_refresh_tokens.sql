-- Refresh tokens table
CREATE TABLE refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL,
  revoked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
