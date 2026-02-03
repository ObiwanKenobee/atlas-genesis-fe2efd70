-- Add community segments table
CREATE TABLE IF NOT EXISTS community_segments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    primary_customers VARCHAR(255),
    what_is_being_priced TEXT,
    pricing_mechanism VARCHAR(255),
    price_range VARCHAR(100),
    value_justification TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add community programs table
CREATE TABLE IF NOT EXISTS community_programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    participants VARCHAR(100),
    features JSONB DEFAULT '[]'::jsonb,
    program_type VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add community testimonials table
CREATE TABLE IF NOT EXISTS community_testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    quote TEXT,
    impact VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add community resources table
CREATE TABLE IF NOT EXISTS community_resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    format VARCHAR(50),
    duration VARCHAR(100),
    file_url VARCHAR(500),
    difficulty_level VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add community events table
CREATE TABLE IF NOT EXISTS community_events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(255),
    event_date DATE,
    location VARCHAR(255),
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add community governance table
CREATE TABLE IF NOT EXISTS community_governance (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    structure VARCHAR(255),
    voting_system VARCHAR(255),
    decision_process TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add community statistics table
CREATE TABLE IF NOT EXISTS community_statistics (
    id SERIAL PRIMARY KEY,
    total_members INTEGER,
    active_stewards INTEGER,
    total_projects INTEGER,
    community_impact DECIMAL(10, 2),
    regions_covered INTEGER,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add program registrations table
CREATE TABLE IF NOT EXISTS program_registrations (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(program_id, user_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_community_segments_active ON community_segments(is_active);
CREATE INDEX IF NOT EXISTS idx_community_programs_active ON community_programs(is_active);
CREATE INDEX IF NOT EXISTS idx_community_testimonials_active ON community_testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_community_resources_active ON community_resources(is_active);
CREATE INDEX IF NOT EXISTS idx_community_events_active ON community_events(is_active);
CREATE INDEX IF NOT EXISTS idx_community_governance_active ON community_governance(is_active);
CREATE INDEX IF NOT EXISTS idx_program_registrations_program ON program_registrations(program_id);
CREATE INDEX IF NOT EXISTS idx_program_registrations_user ON program_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_program_registrations_status ON program_registrations(status);

-- Insert sample data
INSERT INTO community_segments (name, description, primary_customers, what_is_being_priced, pricing_mechanism, price_range, value_justification, features, benefits, display_order)
VALUES
('Commons Stewardship (DAO)', 'Decentralized governance for regenerative communities', 'Members, stewards, partners', 'Governance rights, voting, stewardship roles', 'Mostly non-monetary; stake-based', 'Minimal / symbolic', 'Prevents capture and mission drift', '["DAO governance structure", "Voting & decision-making", "Stewardship roles", "Community-driven initiatives"]', '["Participate in platform governance", "Shape future development", "Access community resources"]', 1),
('Intellectual Infrastructure', 'Standards, schemas, ethical AI protocols', 'Developers, researchers, institutions', 'Standards, schemas, ethical AI protocols', 'Open core + paid services', 'Free core; paid hosting & guarantees', 'Standards drive adoption and longevity', '["Open standards & schemas", "Ethical AI protocols", "Research & development", "Developer resources"]', '["Access to open APIs", "Developer support", "Research partnerships"]', 2),
('Regenerative Producers', 'Farmers, fishers, land & ocean stewards', 'Farmers, fishers, land & ocean stewards', 'Mobile access, onboarding, AI-assisted regeneration guidance, impact verification, access to buyers & finance', 'Free / Subsidized', '$0', 'Never at entry; platform earns only when credits are sold to buyers', '["Mobile tools", "AI guidance", "Impact verification", "Market access"]', '["Free platform access", "Technical support", "Market connections"]', 3);

INSERT INTO community_programs (name, description, participants, features, program_type, display_order)
VALUES
('Youth Leadership', 'Empowering young people to become regeneration leaders', '850K+', '["School curriculum integration", "Youth councils", "Summer fellowships", "University partnerships"]', 'Education', 1),
('Cultural Preservation', 'Honoring indigenous knowledge and cultural heritage', '1,200+ communities', '["Oral tradition recording", "Cultural metaphor integration", "Art & visual design", "Festival sponsorship"]', 'Cultural', 2),
('Research Network', 'Collaborative research on regenerative practices', '2,500+ researchers', '["Open data access", "Research grants", "Academic partnerships", "Publication support"]', 'Research', 3);

INSERT INTO community_testimonials (name, role, quote, impact, display_order)
VALUES
('Maria Lopez', 'Coffee Farmer, Colombia', 'The platform has connected our small cooperative to global buyers who value our regenerative practices. We''ve seen our income increase by 40% while improving our soil health.', '100 hectares reforested', 1),
('James Okoth', 'Youth Leader, Kenya', 'As a member of the Youth Council, I''ve learned so much about environmental stewardship and how to advocate for change in my community.', '500 students educated', 2),
('Dr. Sarah Chen', 'Researcher, China', 'The open data platform has revolutionized our climate research. We now have access to real-time impact data from projects around the world.', '20 peer-reviewed papers', 3);

INSERT INTO community_statistics (total_members, active_stewards, total_projects, community_impact, regions_covered)
VALUES
(250000, 15000, 500, 1200000, 150);

-- Add foreign key constraints (if users table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE program_registrations
        ADD CONSTRAINT fk_program_registrations_program FOREIGN KEY (program_id)
        REFERENCES community_programs(id) ON DELETE CASCADE;
        
        ALTER TABLE program_registrations
        ADD CONSTRAINT fk_program_registrations_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER community_segments_updated_at
    BEFORE UPDATE ON community_segments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER community_programs_updated_at
    BEFORE UPDATE ON community_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER community_testimonials_updated_at
    BEFORE UPDATE ON community_testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER community_resources_updated_at
    BEFORE UPDATE ON community_resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER community_events_updated_at
    BEFORE UPDATE ON community_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER community_governance_updated_at
    BEFORE UPDATE ON community_governance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER community_statistics_updated_at
    BEFORE UPDATE ON community_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER program_registrations_updated_at
    BEFORE UPDATE ON program_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
