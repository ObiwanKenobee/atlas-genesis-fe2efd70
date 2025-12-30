-- Initial schema for Phase 0
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  display_name text,
  password_hash text,
  did text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE orgs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES orgs(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  type text NOT NULL,
  title text,
  metadata jsonb,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  source text,
  timestamp timestamptz,
  geo jsonb,
  metrics jsonb,
  provenance jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  token_address text,
  token_id text,
  minted_by uuid REFERENCES users(id),
  status text DEFAULT 'minted',
  metadata jsonb
);

CREATE TABLE listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES users(id) ON DELETE SET NULL,
  price_amount numeric,
  currency text,
  status text DEFAULT 'active'
);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  payment_ref text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  body text,
  choices jsonb,
  status text DEFAULT 'open',
  start_at timestamptz,
  end_at timestamptz
);

CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  voter_id uuid REFERENCES users(id) ON DELETE SET NULL,
  choice text,
  weight numeric DEFAULT 1
);
