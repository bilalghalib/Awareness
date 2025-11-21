-- ============================================
-- AWARENESS PLATFORM - SUPABASE SCHEMA
-- Designed to support values-driven engagement
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geographic Pack distribution

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('member', 'validator', 'kindness_responder', 'admin');
CREATE TYPE event_status AS ENUM ('pending', 'validating', 'verified', 'disputed', 'rejected', 'archived');
CREATE TYPE verification_vote AS ENUM ('valid', 'invalid', 'unsure', 'needs_more_info');
CREATE TYPE response_type AS ENUM ('donation', 'vigil', 'translation', 'amplification', 'organizing', 'other');
CREATE TYPE notification_type AS ENUM ('thermal', 'push', 'sms', 'email');
CREATE TYPE presence_status AS ENUM ('active', 'away', 'reflecting', 'responding');

-- ============================================
-- CORE TABLES
-- ============================================

-- USERS (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    roles user_role[] DEFAULT ARRAY['member']::user_role[],
    timezone TEXT NOT NULL DEFAULT 'UTC',

    -- Preferences
    notification_preferences JSONB DEFAULT '{
        "thermal": true,
        "push": true,
        "sms": false,
        "email": false,
        "quiet_hours": {"start": "22:00", "end": "08:00"}
    }'::jsonb,

    -- Sustainability tracking (for David's value)
    response_capacity JSONB DEFAULT '{
        "weekly_response_limit": 3,
        "current_week_count": 0,
        "last_response_at": null,
        "burnout_risk_score": 0
    }'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PACKS (geographic + temporal communities)
CREATE TABLE packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,

    -- Geographic distribution
    timezone TEXT NOT NULL,
    region TEXT, -- e.g., "San Francisco Bay Area", "Manila Metro"
    coordinates GEOGRAPHY(POINT) NULL, -- PostGIS for geographic queries

    -- Temporal sync (for "dinner in SF = breakfast in Manila")
    sync_time TIME NOT NULL, -- Local time when Pack is active

    -- Pack capacity and health
    member_capacity INTEGER DEFAULT 50,
    current_member_count INTEGER DEFAULT 0,

    -- Pack values and norms
    values_statement TEXT,
    response_principles JSONB, -- How this Pack approaches collective action

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PACK MEMBERSHIP
CREATE TABLE pack_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    pack_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE,

    role user_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),

    -- Presence (for Maya's "collective holding")
    current_presence presence_status DEFAULT 'away',
    last_active_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, pack_id)
);

-- EVENTS (crisis events)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Event details
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    coordinates GEOGRAPHY(POINT) NULL,
    occurred_at TIMESTAMPTZ NOT NULL,

    -- Source information
    source_type TEXT DEFAULT 'twitter', -- twitter, rss, manual, api
    source_url TEXT,
    source_metadata JSONB, -- Original tweet data, etc.

    -- Status
    status event_status DEFAULT 'pending',

    -- Verification (for Sara)
    assigned_validator_id UUID REFERENCES profiles(id),
    verification_deadline TIMESTAMPTZ,
    verification_confidence_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0

    -- Rich verification trail (NEW - addresses Sara's gap)
    verification_trail JSONB DEFAULT '[]'::jsonb, -- Array of investigation steps

    -- Impact tracking
    estimated_casualties JSONB, -- {"killed": 12, "injured": 45, "missing": 3}

    -- Publishing
    published_at TIMESTAMPTZ,
    published_to_pack_ids UUID[], -- Which Packs received this

    -- Archival
    archived_at TIMESTAMPTZ,
    archive_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VERIFICATIONS (collaborative validation - NEW for Sara)
CREATE TABLE verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    validator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Validation
    vote verification_vote NOT NULL,
    confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5), -- 1=low, 5=high

    -- Investigation process (addresses Sara's "thread pulling")
    investigation_steps JSONB DEFAULT '[]'::jsonb,
    /* Example structure:
    [
        {
            "step": 1,
            "action": "checked_original_source",
            "details": "Found original tweet from @journalist123",
            "timestamp": "2024-01-15T10:23:00Z"
        },
        {
            "step": 2,
            "action": "cross_referenced_news",
            "details": "Confirmed by Al Jazeera and Reuters",
            "sources": ["https://..."],
            "timestamp": "2024-01-15T10:25:00Z"
        }
    ]
    */

    -- Evidence
    evidence_urls TEXT[],
    evidence_notes TEXT,

    -- Collaboration (NEW)
    questions_for_other_validators TEXT,

    -- Final decision
    reasoning TEXT NOT NULL, -- Why this vote?

    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VERIFICATION DISCUSSIONS (NEW - for collaborative validation)
CREATE TABLE verification_discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    message TEXT NOT NULL,
    parent_message_id UUID REFERENCES verification_discussions(id), -- Threading

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RESPONSES (kindness first responder actions)
CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    pack_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE,

    -- Response details
    response_type response_type NOT NULL,
    description TEXT NOT NULL,

    -- Evidence of action
    proof_url TEXT, -- Link to donation receipt, event page, etc.
    proof_image_url TEXT,

    -- Visibility
    is_public BOOLEAN DEFAULT TRUE,
    is_anonymous BOOLEAN DEFAULT FALSE,

    -- Collaboration (NEW - for David's coordinated action)
    building_on_response_id UUID REFERENCES responses(id), -- "Building on what @user did"
    coordinated_with_user_ids UUID[], -- "Did this together with..."

    -- Impact
    estimated_impact JSONB, -- {"people_helped": 50, "funds_raised": 500, etc.}

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RESPONSE TEMPLATES (NEW - for David's "what can we do?")
CREATE TABLE response_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    title TEXT NOT NULL,
    description TEXT NOT NULL,
    response_type response_type NOT NULL,

    -- Template fields
    action_steps JSONB NOT NULL,
    /* Example:
    {
        "steps": [
            {"order": 1, "instruction": "Research reputable medical charities in the region"},
            {"order": 2, "instruction": "Coordinate with Pack members on donation amount"},
            {"order": 3, "instruction": "Post proof of donation to Pack"}
        ],
        "estimated_time": "30 minutes",
        "estimated_cost": "$20-50",
        "can_be_done_remotely": true
    }
    */

    -- Usage tracking
    times_used INTEGER DEFAULT 0,
    average_rating DECIMAL(2,1) DEFAULT 0.0,

    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COLLECTIVE ACTIONS (NEW - for coordinated Pack responses)
CREATE TABLE collective_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    pack_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Coordination
    organizer_id UUID NOT NULL REFERENCES profiles(id),
    template_id UUID REFERENCES response_templates(id),
    target_participant_count INTEGER,
    current_participant_count INTEGER DEFAULT 0,

    -- Timeline
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ,

    -- Status
    status TEXT DEFAULT 'planning', -- planning, active, completed, cancelled

    -- Results
    outcome_summary TEXT,
    total_impact JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COLLECTIVE ACTION PARTICIPANTS
CREATE TABLE collective_action_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collective_action_id UUID NOT NULL REFERENCES collective_actions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    role TEXT DEFAULT 'participant', -- organizer, participant, supporter
    commitment_level INTEGER CHECK (commitment_level BETWEEN 1 AND 5),

    joined_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(collective_action_id, user_id)
);

-- REFLECTIONS (NEW - for Maya's emotional processing)
CREATE TABLE reflections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Reflection content
    content TEXT NOT NULL,

    -- Emotional tracking
    emotions TEXT[], -- ["sadness", "anger", "hope", etc.]
    emotional_intensity INTEGER CHECK (emotional_intensity BETWEEN 1 AND 5),

    -- Privacy
    visibility TEXT DEFAULT 'pack', -- private, pack, public
    pack_id UUID REFERENCES packs(id), -- If visibility = 'pack'

    -- Thread support
    parent_reflection_id UUID REFERENCES reflections(id),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PACK PRESENCE (NEW - for collective holding visualization)
CREATE TABLE pack_presence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pack_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE, -- What they're present with

    status presence_status NOT NULL DEFAULT 'active',

    -- Realtime heartbeat
    last_heartbeat_at TIMESTAMPTZ DEFAULT NOW(),

    -- Context
    current_activity TEXT, -- "reading", "reflecting", "coordinating_response", etc.

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(pack_id, user_id)
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,

    -- Notification details
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,

    -- Delivery
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,

    -- Device tracking (for wristband)
    device_id TEXT,
    device_metadata JSONB, -- {"battery_level": 85, "temperature": 22, etc.}

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DAMAGE TRACKING (adapted from robot sculpture concept)
CREATE TABLE event_impact_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

    -- Initial impact
    initial_damage_score DECIMAL(5,2) NOT NULL, -- 0-100 scale

    -- Response healing
    current_damage_score DECIMAL(5,2) NOT NULL,

    -- Calculation
    response_count INTEGER DEFAULT 0,
    healing_rate DECIMAL(3,2) DEFAULT 5.0, -- How much each response reduces damage

    -- Timeline
    started_tracking_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOG (for transparency and trust)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- insert, update, delete

    actor_id UUID REFERENCES profiles(id),
    actor_role user_role,

    old_values JSONB,
    new_values JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (for performance)
-- ============================================

-- Users and Packs
CREATE INDEX idx_profiles_roles ON profiles USING GIN(roles);
CREATE INDEX idx_pack_memberships_user ON pack_memberships(user_id);
CREATE INDEX idx_pack_memberships_pack ON pack_memberships(pack_id);
CREATE INDEX idx_packs_timezone ON packs(timezone);
CREATE INDEX idx_packs_coordinates ON packs USING GIST(coordinates);

-- Events
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_occurred_at ON events(occurred_at DESC);
CREATE INDEX idx_events_published_at ON events(published_at DESC);
CREATE INDEX idx_events_coordinates ON events USING GIST(coordinates);

-- Verifications
CREATE INDEX idx_verifications_event ON verifications(event_id);
CREATE INDEX idx_verifications_validator ON verifications(validator_id);

-- Responses
CREATE INDEX idx_responses_event ON responses(event_id);
CREATE INDEX idx_responses_user ON responses(user_id);
CREATE INDEX idx_responses_pack ON responses(pack_id);
CREATE INDEX idx_responses_created ON responses(created_at DESC);

-- Presence
CREATE INDEX idx_pack_presence_pack ON pack_presence(pack_id);
CREATE INDEX idx_pack_presence_event ON pack_presence(event_id);
CREATE INDEX idx_pack_presence_heartbeat ON pack_presence(last_heartbeat_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update own
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Pack memberships: Members can see their packs
CREATE POLICY "Users can view their pack memberships"
    ON pack_memberships FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view members of their packs"
    ON pack_memberships FOR SELECT
    USING (
        pack_id IN (
            SELECT pack_id FROM pack_memberships WHERE user_id = auth.uid()
        )
    );

-- Events: Pack members can see verified events published to their packs
CREATE POLICY "Pack members can view published events"
    ON events FOR SELECT
    USING (
        status = 'verified'
        AND published_at IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM pack_memberships pm
            WHERE pm.user_id = auth.uid()
            AND pm.pack_id = ANY(events.published_to_pack_ids)
        )
    );

-- Validators can see events assigned to them
CREATE POLICY "Validators can view assigned events"
    ON events FOR SELECT
    USING (
        assigned_validator_id = auth.uid()
        OR 'validator' = ANY(
            SELECT unnest(roles) FROM profiles WHERE id = auth.uid()
        )
    );

-- Verifications: Validators can CRUD own verifications
CREATE POLICY "Validators can manage their verifications"
    ON verifications FOR ALL
    USING (validator_id = auth.uid());

-- Verification discussions: Validators can participate
CREATE POLICY "Validators can participate in discussions"
    ON verification_discussions FOR ALL
    USING (
        'validator' = ANY(
            SELECT unnest(roles) FROM profiles WHERE id = auth.uid()
        )
    );

-- Responses: Users can CRUD own responses, read pack responses
CREATE POLICY "Users can manage own responses"
    ON responses FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Pack members can view pack responses"
    ON responses FOR SELECT
    USING (
        pack_id IN (
            SELECT pack_id FROM pack_memberships WHERE user_id = auth.uid()
        )
    );

-- Reflections: Depends on visibility setting
CREATE POLICY "Users can manage own reflections"
    ON reflections FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Pack members can view pack reflections"
    ON reflections FOR SELECT
    USING (
        visibility = 'pack'
        AND pack_id IN (
            SELECT pack_id FROM pack_memberships WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view public reflections"
    ON reflections FOR SELECT
    USING (visibility = 'public');

-- Pack presence: Members can update own, view pack
CREATE POLICY "Users can update own presence"
    ON pack_presence FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Pack members can view pack presence"
    ON pack_presence FOR SELECT
    USING (
        pack_id IN (
            SELECT pack_id FROM pack_memberships WHERE user_id = auth.uid()
        )
    );

-- Notifications: Users can only see their own
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packs_updated_at BEFORE UPDATE ON packs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collective_actions_updated_at BEFORE UPDATE ON collective_actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update pack member count
CREATE OR REPLACE FUNCTION update_pack_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE packs
        SET current_member_count = current_member_count + 1
        WHERE id = NEW.pack_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE packs
        SET current_member_count = current_member_count - 1
        WHERE id = OLD.pack_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pack_member_count_on_join
    AFTER INSERT ON pack_memberships
    FOR EACH ROW EXECUTE FUNCTION update_pack_member_count();

CREATE TRIGGER update_pack_member_count_on_leave
    AFTER DELETE ON pack_memberships
    FOR EACH ROW EXECUTE FUNCTION update_pack_member_count();

-- Update event damage score when response added
CREATE OR REPLACE FUNCTION update_damage_score_on_response()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE event_impact_tracking
    SET
        response_count = response_count + 1,
        current_damage_score = GREATEST(
            0,
            current_damage_score - healing_rate
        ),
        last_updated_at = NOW()
    WHERE event_id = NEW.event_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_damage_on_response
    AFTER INSERT ON responses
    FOR EACH ROW EXECUTE FUNCTION update_damage_score_on_response();

-- Calculate verification confidence score
CREATE OR REPLACE FUNCTION calculate_verification_confidence(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_total_verifications INTEGER;
    v_valid_votes INTEGER;
    v_invalid_votes INTEGER;
    v_avg_confidence DECIMAL;
    v_final_score DECIMAL;
BEGIN
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE vote = 'valid'),
        COUNT(*) FILTER (WHERE vote = 'invalid'),
        AVG(confidence_level)
    INTO v_total_verifications, v_valid_votes, v_invalid_votes, v_avg_confidence
    FROM verifications
    WHERE event_id = p_event_id;

    IF v_total_verifications = 0 THEN
        RETURN 0.0;
    END IF;

    -- Simple scoring: (valid votes / total) * (avg confidence / 5)
    v_final_score := (v_valid_votes::DECIMAL / v_total_verifications) * (v_avg_confidence / 5.0);

    RETURN ROUND(v_final_score, 2);
END;
$$ LANGUAGE plpgsql;

-- Update event verification confidence when verification added
CREATE OR REPLACE FUNCTION update_event_verification_confidence()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE events
    SET verification_confidence_score = calculate_verification_confidence(NEW.event_id)
    WHERE id = NEW.event_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_confidence_on_verification
    AFTER INSERT OR UPDATE ON verifications
    FOR EACH ROW EXECUTE FUNCTION update_event_verification_confidence();

-- Audit logging trigger
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        table_name,
        record_id,
        action,
        actor_id,
        old_values,
        new_values
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        auth.uid(),
        CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit logging to sensitive tables
CREATE TRIGGER audit_events AFTER INSERT OR UPDATE OR DELETE ON events
    FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_verifications AFTER INSERT OR UPDATE OR DELETE ON verifications
    FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- REALTIME PUBLICATION (for Supabase Realtime)
-- ============================================

-- Enable realtime for collaborative features
ALTER PUBLICATION supabase_realtime ADD TABLE pack_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE verification_discussions;
ALTER PUBLICATION supabase_realtime ADD TABLE collective_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE responses;

-- ============================================
-- VIEWS (for common queries)
-- ============================================

-- Active events view (for dashboard)
CREATE OR REPLACE VIEW active_events_view AS
SELECT
    e.*,
    COUNT(DISTINCT v.id) as verification_count,
    COUNT(DISTINCT r.id) as response_count,
    COALESCE(eit.current_damage_score, eit.initial_damage_score) as current_damage_score
FROM events e
LEFT JOIN verifications v ON e.id = v.event_id
LEFT JOIN responses r ON e.id = r.event_id
LEFT JOIN event_impact_tracking eit ON e.id = eit.event_id
WHERE e.status IN ('verified', 'validating')
AND e.published_at IS NOT NULL
GROUP BY e.id, eit.current_damage_score, eit.initial_damage_score
ORDER BY e.published_at DESC;

-- Pack activity view (for Pack dashboards)
CREATE OR REPLACE VIEW pack_activity_view AS
SELECT
    p.id as pack_id,
    p.name as pack_name,
    COUNT(DISTINCT pm.user_id) as total_members,
    COUNT(DISTINCT pp.user_id) FILTER (WHERE pp.last_heartbeat_at > NOW() - INTERVAL '5 minutes') as active_members,
    COUNT(DISTINCT r.id) FILTER (WHERE r.created_at > NOW() - INTERVAL '7 days') as responses_this_week
FROM packs p
LEFT JOIN pack_memberships pm ON p.id = pm.pack_id
LEFT JOIN pack_presence pp ON p.id = pp.pack_id
LEFT JOIN responses r ON p.id = r.pack_id
GROUP BY p.id, p.name;

-- User engagement view (for sustainability tracking)
CREATE OR REPLACE VIEW user_engagement_view AS
SELECT
    pr.id as user_id,
    pr.username,
    COUNT(DISTINCT r.id) as total_responses,
    COUNT(DISTINCT r.id) FILTER (WHERE r.created_at > NOW() - INTERVAL '7 days') as responses_this_week,
    COUNT(DISTINCT r.id) FILTER (WHERE r.created_at > NOW() - INTERVAL '30 days') as responses_this_month,
    MAX(r.created_at) as last_response_at,
    -- Burnout risk: more than 5 responses per week
    CASE
        WHEN COUNT(DISTINCT r.id) FILTER (WHERE r.created_at > NOW() - INTERVAL '7 days') > 5 THEN 'high'
        WHEN COUNT(DISTINCT r.id) FILTER (WHERE r.created_at > NOW() - INTERVAL '7 days') > 3 THEN 'medium'
        ELSE 'low'
    END as burnout_risk
FROM profiles pr
LEFT JOIN responses r ON pr.id = r.user_id
GROUP BY pr.id, pr.username;

-- ============================================
-- COMMENTS & DOCUMENTATION
-- ============================================

COMMENT ON TABLE events IS 'Crisis events detected from various sources (Twitter, manual input, etc.)';
COMMENT ON TABLE verifications IS 'Validator assessments of event authenticity with rich investigation trails';
COMMENT ON TABLE verification_discussions IS 'Collaborative discussion space for validators to resolve edge cases';
COMMENT ON TABLE responses IS 'Kindness First Responder actions taken in response to events';
COMMENT ON TABLE collective_actions IS 'Coordinated Pack-level responses to events';
COMMENT ON TABLE reflections IS 'User reflections and emotional processing of events';
COMMENT ON TABLE pack_presence IS 'Real-time presence indicators for Pack members';
COMMENT ON COLUMN events.verification_trail IS 'Detailed log of investigation steps taken by validators (visible to users)';
COMMENT ON COLUMN profiles.response_capacity IS 'Tracks user response frequency to prevent burnout';
COMMENT ON COLUMN packs.sync_time IS 'Local time when Pack members are most available for synchronous engagement';
