-- Migration: Issues Model + Content Protection
-- Phase 2.5: Ongoing crises and dignity-preserving content

-- =====================================================
-- ISSUES TABLE (Ongoing Crises)
-- =====================================================

CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic info
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,

    -- Type and status
    type TEXT NOT NULL CHECK (type IN ('environmental', 'humanitarian', 'systemic', 'political', 'economic')),
    current_status TEXT NOT NULL DEFAULT 'active' CHECK (current_status IN ('active', 'monitoring', 'resolved', 'escalating')),

    -- Timeline
    started_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,

    -- Collective understanding
    what_we_know TEXT, -- Verified facts
    what_we_dont_know TEXT, -- Honest about uncertainty
    what_it_means JSONB DEFAULT '[]'::jsonb, -- Multiple interpretations

    -- Visual representation
    header_image_url TEXT,
    location_data JSONB, -- Geographic data if relevant

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES profiles(id)
);

-- Index for fast lookups
CREATE INDEX idx_issues_slug ON issues(slug);
CREATE INDEX idx_issues_status ON issues(current_status);
CREATE INDEX idx_issues_type ON issues(type);

-- Auto-update timestamp
CREATE TRIGGER issues_updated_at
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Everyone can view active issues
CREATE POLICY "Anyone can view active issues"
    ON issues FOR SELECT
    USING (current_status IN ('active', 'monitoring', 'escalating'));

-- =====================================================
-- ISSUE FOLLOWERS (Who's following which issues)
-- =====================================================

CREATE TABLE issue_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

    -- Following preferences
    notify_on_moments BOOLEAN DEFAULT true,
    notify_on_campaigns BOOLEAN DEFAULT true,

    -- Engagement tracking
    first_followed_at TIMESTAMPTZ DEFAULT now(),
    last_engaged_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(issue_id, user_id)
);

CREATE INDEX idx_issue_followers_user ON issue_followers(user_id);
CREATE INDEX idx_issue_followers_issue ON issue_followers(issue_id);

ALTER TABLE issue_followers ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own follows
CREATE POLICY "Users can manage their own issue follows"
    ON issue_followers FOR ALL
    USING (auth.uid() = user_id);

-- =====================================================
-- PACK ISSUE FOCUS (Which Packs focus on which Issues)
-- =====================================================

CREATE TABLE pack_issue_focus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID REFERENCES packs(id) ON DELETE CASCADE NOT NULL,
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,

    -- Focus level
    priority TEXT DEFAULT 'primary' CHECK (priority IN ('primary', 'secondary', 'monitoring')),

    -- Engagement
    started_focusing_at TIMESTAMPTZ DEFAULT now(),
    last_action_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(pack_id, issue_id)
);

CREATE INDEX idx_pack_issue_focus_pack ON pack_issue_focus(pack_id);
CREATE INDEX idx_pack_issue_focus_issue ON pack_issue_focus(issue_id);

ALTER TABLE pack_issue_focus ENABLE ROW LEVEL SECURITY;

-- Pack members can view their pack's focus
CREATE POLICY "Pack members can view pack issue focus"
    ON pack_issue_focus FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM pack_memberships pm
            WHERE pm.pack_id = pack_issue_focus.pack_id
            AND pm.user_id = auth.uid()
        )
    );

-- =====================================================
-- UPDATE EVENTS TABLE (Convert to Moments)
-- =====================================================

-- Add issue relationship (events become "moments" within issues)
ALTER TABLE events ADD COLUMN issue_id UUID REFERENCES issues(id);
CREATE INDEX idx_events_issue ON events(issue_id);

-- Add content protection fields
ALTER TABLE events ADD COLUMN content_tier INTEGER DEFAULT 1 CHECK (content_tier IN (1, 2, 3));
-- Tier 1: Awareness (always show, dignity-preserving)
-- Tier 2: Understanding (context, opt-in)
-- Tier 3: Evidence (validators only, may include graphic)

ALTER TABLE events ADD COLUMN has_graphic_content BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN content_warnings TEXT[];

-- Add memorial approach fields
ALTER TABLE events ADD COLUMN show_memorial_view BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN memorial_data JSONB; -- Names, ages, stories

-- =====================================================
-- MEMORIAL ENTRIES (Dignified Representation)
-- =====================================================

CREATE TABLE memorial_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,

    -- Person information
    name TEXT,
    age INTEGER,
    description TEXT,
    remembered_for TEXT,

    -- Visual (dignified photos from life)
    photo_url TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_memorial_entries_event ON memorial_entries(event_id);

ALTER TABLE memorial_entries ENABLE ROW LEVEL SECURITY;

-- Anyone can view memorial entries for verified events
CREATE POLICY "Anyone can view memorial entries"
    ON memorial_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM events e
            WHERE e.id = memorial_entries.event_id
            AND e.status = 'verified'
        )
    );

-- =====================================================
-- USER CONTENT PREFERENCES
-- =====================================================

ALTER TABLE profiles ADD COLUMN content_preferences JSONB DEFAULT '{
    "show_graphic_content": false,
    "auto_expand_context": true,
    "require_closing_ritual": true,
    "content_tier_preference": 1
}'::jsonb;

-- =====================================================
-- INTERPRETATION ENTRIES (Multiple Perspectives)
-- =====================================================

CREATE TABLE interpretations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,

    -- Interpretation details
    interpretation_text TEXT NOT NULL,
    source_name TEXT, -- e.g., "UN Special Rapporteur", "Israeli government"
    source_url TEXT,
    perspective_type TEXT, -- e.g., "government", "NGO", "expert", "community"

    -- Verification
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES profiles(id),

    -- Either issue OR event, not both
    CHECK (
        (issue_id IS NOT NULL AND event_id IS NULL) OR
        (issue_id IS NULL AND event_id IS NOT NULL)
    )
);

CREATE INDEX idx_interpretations_issue ON interpretations(issue_id);
CREATE INDEX idx_interpretations_event ON interpretations(event_id);

ALTER TABLE interpretations ENABLE ROW LEVEL SECURITY;

-- Anyone can view verified interpretations
CREATE POLICY "Anyone can view verified interpretations"
    ON interpretations FOR SELECT
    USING (verified = true);

-- =====================================================
-- SENSEMAKING CIRCLES (Pack Discussion)
-- =====================================================

CREATE TABLE sensemaking_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
    pack_id UUID REFERENCES packs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

    -- Entry content
    question TEXT NOT NULL, -- e.g., "What does this mean for us?"
    interpretation TEXT NOT NULL,
    reasoning TEXT,
    actions_suggested TEXT[],

    -- Engagement
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sensemaking_issue_pack ON sensemaking_entries(issue_id, pack_id);
CREATE INDEX idx_sensemaking_user ON sensemaking_entries(user_id);

CREATE TRIGGER sensemaking_updated_at
    BEFORE UPDATE ON sensemaking_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE sensemaking_entries ENABLE ROW LEVEL SECURITY;

-- Pack members can view their pack's sensemaking
CREATE POLICY "Pack members can view pack sensemaking"
    ON sensemaking_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM pack_memberships pm
            WHERE pm.pack_id = sensemaking_entries.pack_id
            AND pm.user_id = auth.uid()
        )
    );

-- Pack members can create entries
CREATE POLICY "Pack members can create sensemaking entries"
    ON sensemaking_entries FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM pack_memberships pm
            WHERE pm.pack_id = sensemaking_entries.pack_id
            AND pm.user_id = auth.uid()
        )
    );

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Issues with follower counts
CREATE VIEW issues_with_stats AS
SELECT
    i.*,
    COUNT(DISTINCT if.user_id) as follower_count,
    COUNT(DISTINCT pif.pack_id) as pack_count,
    COUNT(DISTINCT e.id) as moment_count
FROM issues i
LEFT JOIN issue_followers if ON i.id = if.issue_id
LEFT JOIN pack_issue_focus pif ON i.id = pif.issue_id
LEFT JOIN events e ON i.id = e.issue_id
GROUP BY i.id;

-- Events (Moments) with issue context
CREATE VIEW moments_with_issue_context AS
SELECT
    e.*,
    i.title as issue_title,
    i.type as issue_type,
    i.current_status as issue_status
FROM events e
LEFT JOIN issues i ON e.issue_id = i.id;

-- =====================================================
-- SEED DATA (Examples)
-- =====================================================

-- Insert example issues
INSERT INTO issues (title, slug, description, type, current_status, started_at, what_we_know, what_we_dont_know) VALUES
(
    'Gaza Humanitarian Crisis',
    'gaza-humanitarian-crisis',
    'Ongoing humanitarian crisis in Gaza following the escalation of conflict in October 2023',
    'humanitarian',
    'active',
    '2023-10-07',
    E'Verified facts:\n• Ongoing military operations since Oct 2023\n• 30,000+ Palestinian deaths (Gaza Health Ministry)\n• 1,200+ Israeli deaths in initial attack (Israeli govt)\n• 85% of Gaza population displaced (UN)\n• Severe restrictions on aid (multiple sources)',
    E'Open questions:\n• Full extent of infrastructure damage\n• Exact civilian vs combatant casualties\n• Timeline for humanitarian access\n• Long-term displacement numbers'
),
(
    'Climate Crisis',
    'climate-crisis',
    'Global climate change and its accelerating impacts on ecosystems, weather patterns, and human communities',
    'environmental',
    'escalating',
    '1850-01-01',
    E'Verified facts:\n• Global temperature +1.1°C above pre-industrial (IPCC)\n• CO2 levels at 420ppm, highest in 3M years\n• Arctic ice declining 13% per decade\n• Sea level rising 3.4mm per year\n• Extreme weather events increasing in frequency',
    E'Open questions:\n• Exact tipping points for various systems\n• Full impact of feedback loops\n• Effectiveness of current mitigation efforts\n• Precise regional impact predictions'
),
(
    'Sudan Conflict',
    'sudan-conflict',
    'Armed conflict in Sudan between the Sudanese Armed Forces and the Rapid Support Forces',
    'humanitarian',
    'active',
    '2023-04-15',
    E'Verified facts:\n• Fighting began April 15, 2023\n• 10,000+ deaths (UN estimates)\n• 6+ million displaced internally\n• Severe food insecurity affecting millions\n• Health system largely collapsed',
    E'Open questions:\n• Full death toll (many unreported)\n• Extent of atrocities in Darfur\n• Prospects for ceasefire\n• International response effectiveness'
);

-- Note: Do not insert moment/event examples here
-- Those will be created through the admin UI with proper issue_id references
