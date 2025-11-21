-- Migration: Levels of Implication Framework
-- Enables "How am I implicated?" and "What can I do?" at different scales

-- =====================================================
-- IMPLICATION LEVELS
-- =====================================================

CREATE TABLE implication_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,

    -- Level (individual → systemic)
    level TEXT NOT NULL CHECK (level IN ('individual', 'family', 'community', 'culture', 'country', 'systemic')),

    -- Order for display
    display_order INTEGER NOT NULL,

    -- How am I implicated?
    implication_prompt TEXT NOT NULL,
    implication_description TEXT,
    implication_examples TEXT[], -- Array of example implications

    -- What can I do?
    action_prompt TEXT NOT NULL,
    action_description TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES profiles(id),

    -- One set of levels per issue per level type
    UNIQUE(issue_id, level)
);

CREATE INDEX idx_implication_levels_issue ON implication_levels(issue_id);
CREATE INDEX idx_implication_levels_level ON implication_levels(level);

CREATE TRIGGER implication_levels_updated_at
    BEFORE UPDATE ON implication_levels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE implication_levels ENABLE ROW LEVEL SECURITY;

-- Anyone can view implication levels
CREATE POLICY "Anyone can view implication levels"
    ON implication_levels FOR SELECT
    USING (true);

-- =====================================================
-- LEVEL ACTIONS (Specific actions at each level)
-- =====================================================

CREATE TABLE level_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    implication_level_id UUID REFERENCES implication_levels(id) ON DELETE CASCADE NOT NULL,

    -- Action details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'challenging', 'requires_commitment')),
    time_commitment TEXT, -- e.g., "5 minutes", "ongoing", "1 hour/week"

    -- Resources
    resources JSONB, -- Links, guides, templates
    /*
    {
      "links": [{"title": "...", "url": "..."}],
      "templates": [{"title": "...", "content": "..."}],
      "guides": [{"title": "...", "url": "..."}]
    }
    */

    -- Tracking
    times_taken INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2), -- 1.00 to 5.00

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_level_actions_level ON level_actions(implication_level_id);
CREATE INDEX idx_level_actions_difficulty ON level_actions(difficulty);

CREATE TRIGGER level_actions_updated_at
    BEFORE UPDATE ON level_actions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE level_actions ENABLE ROW LEVEL SECURITY;

-- Anyone can view level actions
CREATE POLICY "Anyone can view level actions"
    ON level_actions FOR SELECT
    USING (true);

-- =====================================================
-- USER LEVEL ENGAGEMENT (Track which levels users engage with)
-- =====================================================

CREATE TABLE user_level_engagement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('individual', 'family', 'community', 'culture', 'country', 'systemic')),

    -- Engagement tracking
    first_viewed_at TIMESTAMPTZ DEFAULT now(),
    last_engaged_at TIMESTAMPTZ DEFAULT now(),
    actions_taken_count INTEGER DEFAULT 0,

    -- User's own implication reflection
    my_implication_notes TEXT,
    my_action_commitments TEXT[],

    -- Visibility
    shared_with_pack BOOLEAN DEFAULT false,
    pack_id UUID REFERENCES packs(id),

    UNIQUE(user_id, issue_id, level)
);

CREATE INDEX idx_user_level_engagement_user ON user_level_engagement(user_id);
CREATE INDEX idx_user_level_engagement_issue ON user_level_engagement(issue_id);
CREATE INDEX idx_user_level_engagement_level ON user_level_engagement(level);

ALTER TABLE user_level_engagement ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own engagement
CREATE POLICY "Users can manage their own level engagement"
    ON user_level_engagement FOR ALL
    USING (auth.uid() = user_id);

-- Pack members can view shared engagement
CREATE POLICY "Pack members can view shared level engagement"
    ON user_level_engagement FOR SELECT
    USING (
        shared_with_pack = true
        AND pack_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM pack_memberships pm
            WHERE pm.pack_id = user_level_engagement.pack_id
            AND pm.user_id = auth.uid()
        )
    );

-- =====================================================
-- ACTION COMPLETIONS (When users complete an action)
-- =====================================================

CREATE TABLE action_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    level_action_id UUID REFERENCES level_actions(id) ON DELETE CASCADE NOT NULL,

    -- Completion details
    completed_at TIMESTAMPTZ DEFAULT now(),
    reflection TEXT, -- What happened? How did it go?
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    would_recommend BOOLEAN,

    -- Collective action
    completed_with_pack BOOLEAN DEFAULT false,
    pack_id UUID REFERENCES packs(id),
    coordinated_with_user_ids UUID[], -- Other users who did this together

    -- Evidence (optional)
    proof_url TEXT,
    proof_image_url TEXT
);

CREATE INDEX idx_action_completions_user ON action_completions(user_id);
CREATE INDEX idx_action_completions_action ON action_completions(level_action_id);
CREATE INDEX idx_action_completions_pack ON action_completions(pack_id);

ALTER TABLE action_completions ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own completions
CREATE POLICY "Users can manage their own action completions"
    ON action_completions FOR ALL
    USING (auth.uid() = user_id);

-- Pack members can view pack completions
CREATE POLICY "Pack members can view pack action completions"
    ON action_completions FOR SELECT
    USING (
        completed_with_pack = true
        AND pack_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM pack_memberships pm
            WHERE pm.pack_id = action_completions.pack_id
            AND pm.user_id = auth.uid()
        )
    );

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Issue levels with action counts
CREATE VIEW issue_levels_with_stats AS
SELECT
    il.*,
    COUNT(DISTINCT la.id) as action_count,
    COUNT(DISTINCT ac.id) as completion_count
FROM implication_levels il
LEFT JOIN level_actions la ON il.id = la.implication_level_id
LEFT JOIN action_completions ac ON la.id = ac.level_action_id
GROUP BY il.id;

-- User engagement across all levels
CREATE VIEW user_level_summary AS
SELECT
    ule.user_id,
    ule.issue_id,
    COUNT(DISTINCT ule.level) as levels_engaged,
    SUM(ule.actions_taken_count) as total_actions_taken,
    MAX(ule.last_engaged_at) as most_recent_engagement
FROM user_level_engagement ule
GROUP BY ule.user_id, ule.issue_id;

-- Pack engagement by level
CREATE VIEW pack_level_engagement AS
SELECT
    ule.pack_id,
    ule.issue_id,
    ule.level,
    COUNT(DISTINCT ule.user_id) as members_engaged,
    SUM(ule.actions_taken_count) as total_actions
FROM user_level_engagement ule
WHERE ule.shared_with_pack = true AND ule.pack_id IS NOT NULL
GROUP BY ule.pack_id, ule.issue_id, ule.level;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update action times_taken when completion is added
CREATE OR REPLACE FUNCTION update_action_times_taken()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE level_actions
    SET times_taken = times_taken + 1
    WHERE id = NEW.level_action_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER action_completion_increment_count
    AFTER INSERT ON action_completions
    FOR EACH ROW
    EXECUTE FUNCTION update_action_times_taken();

-- Update action average rating when rating is added
CREATE OR REPLACE FUNCTION update_action_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE level_actions
    SET average_rating = (
        SELECT AVG(rating)
        FROM action_completions
        WHERE level_action_id = NEW.level_action_id
        AND rating IS NOT NULL
    )
    WHERE id = NEW.level_action_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER action_completion_update_rating
    AFTER INSERT OR UPDATE OF rating ON action_completions
    FOR EACH ROW
    WHEN (NEW.rating IS NOT NULL)
    EXECUTE FUNCTION update_action_rating();

-- Update user engagement last_engaged_at when action is completed
CREATE OR REPLACE FUNCTION update_user_level_engagement_on_action()
RETURNS TRIGGER AS $$
DECLARE
    v_level TEXT;
    v_issue_id UUID;
BEGIN
    -- Get the level and issue from the action
    SELECT il.level, il.issue_id INTO v_level, v_issue_id
    FROM level_actions la
    JOIN implication_levels il ON la.implication_level_id = il.id
    WHERE la.id = NEW.level_action_id;

    -- Update or insert engagement record
    INSERT INTO user_level_engagement (user_id, issue_id, level, actions_taken_count, last_engaged_at)
    VALUES (NEW.user_id, v_issue_id, v_level, 1, NEW.completed_at)
    ON CONFLICT (user_id, issue_id, level)
    DO UPDATE SET
        actions_taken_count = user_level_engagement.actions_taken_count + 1,
        last_engaged_at = NEW.completed_at;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER action_completion_update_engagement
    AFTER INSERT ON action_completions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_level_engagement_on_action();

-- =====================================================
-- DEFAULT LEVEL STRUCTURE (Template)
-- =====================================================

-- This will be populated per-issue by seed scripts
-- Example structure for Gaza issue:

/*
Individual Level:
- Implication: "How do my consumer choices, information diet, and daily conversations relate to this crisis?"
- Actions:
  - Educate yourself (30 min)
  - Share verified information (5 min)
  - Examine media consumption (ongoing)
  - Donate to humanitarian aid (15 min)

Family Level:
- Implication: "How are my family's investments, intergenerational stories, and household decisions connected?"
- Actions:
  - Discuss with family members
  - Review investment portfolios (pension, 401k)
  - Pass down accurate history
  - Household donation matching

Community Level:
- Implication: "How do my local institutions, organizations, and community infrastructure enable or resist this?"
- Actions:
  - Organize local vigil/gathering
  - Engage faith community
  - Pressure local businesses
  - Community education event

Culture Level:
- Implication: "How do cultural narratives, art, and identity shape understanding and response?"
- Actions:
  - Create/support art addressing this
  - Challenge cultural narratives
  - Amplify affected voices
  - Cultural events and dialogue

Country Level:
- Implication: "How is this enabled by national policy, and what is my responsibility as a citizen/resident?"
- Actions:
  - Call/write representatives
  - Vote based on this issue
  - Join political campaigns
  - National organizing/advocacy

Systemic Level:
- Implication: "How are global systems (capitalism, colonialism, militarism) at play, and how am I positioned within them?"
- Actions:
  - Join systemic change movements
  - Study structural analysis
  - Build alternative institutions
  - Long-term organizing for transformation
*/
