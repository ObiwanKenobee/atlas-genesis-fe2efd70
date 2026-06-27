-- Migration: Performance indexes on hot query columns
-- Fixes: N+1 full-table-scan risk on all FK and WHERE-clause columns

-- users
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users (role);

-- listings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_seller_id ON listings (seller_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_asset_id ON listings (asset_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_status ON listings (status);

-- orders
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_listing_id ON orders (listing_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_buyer_id ON orders (buyer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders (status);

-- measurements
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_measurements_asset_id ON measurements (asset_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_measurements_timestamp ON measurements (timestamp DESC);

-- proposals
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_status ON proposals (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_start_at ON proposals (start_at DESC);

-- votes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_votes_proposal_id ON votes (proposal_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_votes_voter_id ON votes (voter_id);

-- refresh_tokens
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens (token);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_refresh_tokens_active
  ON refresh_tokens (user_id, revoked, expires_at)
  WHERE revoked = false;

-- user_sessions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_user_id ON user_sessions (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions (expires_at);
