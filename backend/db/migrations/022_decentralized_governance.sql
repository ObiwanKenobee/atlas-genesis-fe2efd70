-- Decentralized AI Governance Tables
-- Creates tables for DAO proposals, voting, and governance

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    funding_amount DECIMAL(15, 2),
    voting_period_days INTEGER DEFAULT 7,
    status VARCHAR(50) DEFAULT 'active',
    quorum_threshold DECIMAL(5, 4) DEFAULT 0.1,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS 
        (created_at + (voting_period_days || ' days')::INTERVAL) STORED
);

-- Proposal votes table (stores quadratic voting data)
CREATE TABLE IF NOT EXISTS proposal_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('for', 'against', 'abstain')),
    voting_tokens INTEGER NOT NULL,
    voting_power INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proposal_id, user_id)
);

-- Voting delegations table
CREATE TABLE IF NOT EXISTS voting_delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    delegate_to UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(100) DEFAULT 'all',
    percentage DECIMAL(5, 2) DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category)
);

-- DAO members table
CREATE TABLE IF NOT EXISTS dao_members (
    id UUID PRIMARY KEY DEFAULT auth.users(id),
    token_balance DECIMAL(15, 2) DEFAULT 0,
    voting_power DECIMAL(15, 2) DEFAULT 0,
    proposals_created INTEGER DEFAULT 0,
    votes_cast INTEGER DEFAULT 0,
    delegations_received INTEGER DEFAULT 0,
    reputation_score DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proposal comments table
CREATE TABLE IF NOT EXISTS proposal_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES proposal_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Governance proposals history (for tracking status changes)
CREATE TABLE IF NOT EXISTS proposal_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by UUID REFERENCES auth.users(id),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_category ON proposals(category);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_expires ON proposals(expires_at);

CREATE INDEX IF NOT EXISTS idx_proposal_votes_proposal ON proposal_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_votes_user ON proposal_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_proposal_votes_type ON proposal_votes(vote_type);

CREATE INDEX IF NOT EXISTS idx_delegations_user ON voting_delegations(user_id);
CREATE INDEX IF NOT EXISTS idx_delegations_delegate ON voting_delegations(delegate_to);

CREATE INDEX IF NOT => idx_dao_members_power ON dao_members(voting_power DESC);
CREATE INDEX IF NOT EXISTS idx_dao_members_tokens ON dao_members(token_balance DESC);

CREATE INDEX IF NOT EXISTS idx_comments_proposal ON proposal_comments(proposal_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON proposal_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_history_proposal ON proposal_history(proposal_id);
CREATE INDEX IF NOT EXISTS idx_history_created ON proposal_history(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;
CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proposal_votes_updated_at ON proposal_votes;
CREATE TRIGGER update_proposal_votes_updated_at
    BEFORE UPDATE ON proposal_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_voting_delegations_updated_at ON voting_delegations;
CREATE TRIGGER update_voting_delegations_updated_at
    BEFORE UPDATE ON voting_delegations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dao_members_updated_at ON dao_members;
CREATE TRIGGER update_dao_members_updated_at
    BEFORE UPDATE ON dao_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proposal_comments_updated_at ON proposal_comments;
CREATE TRIGGER update_proposal_comments_updated_at
    BEFORE UPDATE ON proposal_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate quadratic voting cost
CREATE OR REPLACE FUNCTION calculate_quadratic_cost(votes INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN votes * votes;
END;
$$ language 'plpgsql';

-- Function to calculate voting power from quadratic cost
CREATE OR REPLACE FUNCTION calculate_voting_power(cost INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR(SQRT(cost));
END;
$$ language 'plpgsql';

-- Function to auto-update voting power when tokens change
CREATE OR REPLACE FUNCTION update_voting_power()
RETURNS TRIGGER AS $$
BEGIN
    NEW.voting_power = calculate_voting_power(NEW.voting_tokens);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-calculate voting power on insert/update
DROP TRIGGER IF EXISTS auto_calculate_voting_power ON proposal_votes;
CREATE TRIGGER auto_calculate_voting_power
    BEFORE INSERT OR UPDATE ON proposal_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_voting_power();
