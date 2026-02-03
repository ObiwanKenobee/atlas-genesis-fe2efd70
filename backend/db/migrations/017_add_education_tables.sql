-- Add education segments table
CREATE TABLE IF NOT EXISTS education_segments (
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

-- Add education programs table
CREATE TABLE IF NOT EXISTS education_programs (
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

-- Add educational resources table
CREATE TABLE IF NOT EXISTS educational_resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    format VARCHAR(50),
    duration VARCHAR(100),
    language VARCHAR(50),
    difficulty_level VARCHAR(50),
    file_url VARCHAR(500),
    download_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration VARCHAR(100),
    level VARCHAR(50),
    language VARCHAR(50),
    enrollment_count INTEGER DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add cultural preservation table
CREATE TABLE IF NOT EXISTS cultural_preservation (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    traditional_knowledge TEXT,
    oral_traditions TEXT,
    art_and_visual_design TEXT,
    festival_sponsorship TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add cultural metaphors table
CREATE TABLE IF NOT EXISTS cultural_metaphors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    region VARCHAR(255),
    cultural_context TEXT,
    implementation_method TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add education statistics table
CREATE TABLE IF NOT EXISTS education_statistics (
    id SERIAL PRIMARY KEY,
    total_students INTEGER,
    total_courses INTEGER,
    total_resources INTEGER,
    completion_rate DECIMAL(5, 2),
    average_course_rating DECIMAL(3, 2),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add course enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    enrollment_date TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, user_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_education_segments_active ON education_segments(is_active);
CREATE INDEX IF NOT EXISTS idx_education_programs_active ON education_programs(is_active);
CREATE INDEX IF NOT EXISTS idx_educational_resources_active ON educational_resources(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_cultural_preservation_active ON cultural_preservation(is_active);
CREATE INDEX IF NOT EXISTS idx_cultural_metaphors_active ON cultural_metaphors(is_active);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_educational_resources_download ON educational_resources(download_count);

-- Insert sample data
INSERT INTO education_segments (name, description, primary_customers, what_is_being_priced, pricing_mechanism, price_range, value_justification, features, benefits, display_order)
VALUES
('Cultural Institution Layer', 'Builds legitimacy and narrative trust', 'Foundations, sponsors, educators', 'Knowledge archives, storytelling, education', 'Grants, sponsorships, endowments', 'Grant-dependent', 'Builds legitimacy and narrative trust', '["Knowledge archives", "Storytelling platforms", "Education programs", "Cultural preservation"]', '["Access to cultural heritage", "Educational resources", "Community engagement"]', 1);

INSERT INTO education_programs (name, description, participants, features, program_type, display_order)
VALUES
('School Curriculum', 'Regeneration-focused educational materials for K-12 schools', '450K+', '["Science & social studies integration", "Real project data", "Teacher training", "Student activities"]', 'Education', 1),
('University Partnerships', 'Research and education collaboration with universities', '2,500+ researchers', '["Research opportunities", "Dissertation support", "Published papers", "Student internships"]', 'Research', 2),
('Cultural Knowledge', 'Preserving indigenous knowledge and cultural heritage', '1,200+ communities', '["Oral tradition recording", "Cultural metaphor integration", "Traditional art programs", "Festival sponsorship"]', 'Cultural', 3);

INSERT INTO educational_resources (name, description, format, duration, language, difficulty_level, display_order)
VALUES
('Regeneration Toolkit', 'Comprehensive guide to regenerative practices', 'PDF/EPUB', '200+ pages', 'English', 'Beginner', 1),
('Impact Calculator', 'Calculate your environmental impact', 'Web Application', 'Instant results', 'English', 'Beginner', 2),
('Video Series', 'Real stories from regeneration projects', 'Video', '15 episodes', 'English', 'Intermediate', 3);

INSERT INTO courses (name, description, duration, level, language, enrollment_count, features, display_order)
VALUES
('Introduction to Regenerative Practices', 'Learn the fundamentals of regenerative agriculture and conservation', '4 weeks', 'Beginner', 'English', 1200, '["Video lectures", "Interactive quizzes", "Practical assignments", "Community forum"]', 1),
('Advanced Carbon Accounting', 'Master carbon measurement and verification techniques', '8 weeks', 'Advanced', 'English', 850, '["Hands-on labs", "Case studies", "Industry guest lectures", "Certification"]', 2);

INSERT INTO cultural_preservation (name, description, traditional_knowledge, oral_traditions, art_and_visual_design, festival_sponsorship, display_order)
VALUES
('Indigenous Wisdom Initiative', 'Documenting and preserving indigenous knowledge systems', 'Traditional farming methods, sustainable resource management', 'Creation stories, spiritual practices, community governance', 'Traditional crafts, storytelling through art, cultural symbols', 'Local festivals, cultural gatherings, community events', 1);

INSERT INTO cultural_metaphors (name, description, region, cultural_context, implementation_method, display_order)
VALUES
('Amazon: Lungs of Mother Earth', 'Framing forest regeneration as healing Pachamama', 'Amazon Basin', 'Andean indigenous cultures', 'Documentary videos, local artwork, community workshops', 1),
('Boreal: Seven Generations Teaching', 'Honoring Haudenosaunee principle of long-term thinking', 'Boreal Forest', 'Indigenous North American cultures', 'Educational programs, storytelling sessions, community engagement', 2);

INSERT INTO education_statistics (total_students, total_courses, total_resources, completion_rate, average_course_rating)
VALUES
(250000, 150, 1000, 75.5, 4.8);

-- Add foreign key constraints (if users table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE course_enrollments
        ADD CONSTRAINT fk_course_enrollments_course FOREIGN KEY (course_id)
        REFERENCES courses(id) ON DELETE CASCADE;
        
        ALTER TABLE course_enrollments
        ADD CONSTRAINT fk_course_enrollments_user FOREIGN KEY (user_id)
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

CREATE TRIGGER education_segments_updated_at
    BEFORE UPDATE ON education_segments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER education_programs_updated_at
    BEFORE UPDATE ON education_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER educational_resources_updated_at
    BEFORE UPDATE ON educational_resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER cultural_preservation_updated_at
    BEFORE UPDATE ON cultural_preservation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER cultural_metaphors_updated_at
    BEFORE UPDATE ON cultural_metaphors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER education_statistics_updated_at
    BEFORE UPDATE ON education_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER course_enrollments_updated_at
    BEFORE UPDATE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
