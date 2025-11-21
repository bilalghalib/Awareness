# Content Protection & Ethical Imagery Guidelines
## Protecting Hearts While Staying Present

---

## Philosophy

**From the Values Assessment:**
- **Sara's value**: Create trustworthy ground so others can stay **open-hearted**
- **Maya's value**: Sustained attention **without becoming numb**

**The problem**: Graphic imagery causes:
1. **Trauma** (for viewers)
2. **Numbness** (protective shutdown)
3. **Exploitation** (of victims' suffering)
4. **Engagement farming** (platforms profit from shock)

**The solution**: Verification that protects dignity AND enables presence.

---

## Content Tiers

### Tier 1: Awareness (Always Show)
**What we verify happened:**
- Location, time, scale
- Official reports
- Contextual information
- Witness accounts (text)

**Visual approach:**
- Maps, charts, timelines
- Landscapes, empty spaces
- Symbols, art, memorials
- NO graphic imagery

**Example:**
```
"Earthquake in Southern Turkey"
- 6.2 magnitude, 2:45 AM local time
- Hatay Province, near Syrian border
- 50+ buildings collapsed
- Search & rescue underway

[Show: Map with epicenter, graph of magnitude, photo of city skyline]
```

### Tier 2: Understanding (Opt-In)
**What it means:**
- Historical context
- Why this matters
- Who is affected
- What systems failed

**Visual approach:**
- Infographics
- Before/after (buildings, not bodies)
- People in their lives (not death)
- Community portraits

**Example:**
```
"Why This Region?"
- Border area, historically contested
- Housing codes not earthquake-ready
- Refugee population (Syria conflict)
- Limited emergency infrastructure

[Show: Historical map, housing quality data, community photos from before]
```

### Tier 3: Evidence (Validator-Only)
**What validators check:**
- Source verification
- Image authenticity
- Cross-referencing
- May include graphic content

**Protection:**
- Behind authentication
- Content warnings
- Only for validators who opt-in
- Not visible to Maya

**Example:**
```
Sara sees: Raw footage to verify
Maya sees: "This event has been verified by 3 validators
           through cross-referencing with seismic data,
           official reports, and on-ground sources."
```

---

## Instagram Era: Ethical Aggregation

### Current Problem
People follow accounts like:
- @eye.on.palestine
- @mutual.aid.global
- @climatedefiance

These accounts:
✅ Bring attention to ignored issues
❌ Rely on shock value
❌ No verification process
❌ Contribute to trauma/numbness
❌ No action pathways

### Awareness Approach: Partner, Don't Compete

**Instead of pulling content:**
1. **Partner with trusted aggregators**
   - They surface stories
   - We verify them
   - We provide context + action
   - We protect against graphic content

2. **Provide tools they lack**
   - Verification workflow (Sara)
   - Action coordination (David)
   - Emotional processing (Maya)
   - Impact visualization

3. **Create reciprocal value**
   - They get: Verification, credibility
   - We get: Coverage, community trust
   - Users get: Trustworthy news + action

---

## Visual Protection Framework

### 1. Default: Dignity-Preserving
**Never show without explicit consent:**
- Dead bodies
- Severe injuries
- Children in distress
- Graphic violence
- People in their worst moments

**Always show:**
- People in their **lives** (before)
- People **acting** (responding)
- Places, objects, symbols
- Community, connection, resilience

### 2. Content Warnings (When Needed)
```
⚠️ This event involves loss of life
   You can:
   • Read text description
   • See contextual imagery
   • Access full details (if you choose)

   Being informed doesn't require seeing everything.
```

### 3. "Dignified Awareness"
**Question:** How do we honor victims?

**Not:** Circulating their worst moments
**Yes:** Saying their names, telling their stories, taking action

**Example visualization:**
```
Instead of: Photos of destruction
Show:       Map with dots for each life lost
            Click dot → Name, age, what they loved
            "15-year-old who wanted to be a doctor"
```

---

## Protecting Emotional Capacity

### From Values Assessment:
**Maya's attention policies:**
- "BOUNDARIES that allow full presence with difficult information and then **release back to daily life**"
- "GENTLE INVITATIONS to be present rather than urgent demands that trigger reactivity"

### Implementation:

**1. Bounded Sessions**
```
Welcome to this event.

Take a breath. You can:
• Spend as much time as you need
• Leave when you're ready
• Come back later

Your Pack is here with you.

[When ready to leave]
→ Closing ritual: "Acknowledge what you've held"
→ Return to life gently
```

**2. No Autoplay, No Scroll Traps**
- Events don't load automatically
- No infinite scroll
- Intentional clicks required
- Clear exits always visible

**3. Collective Load-Bearing**
```
You don't need to hold this alone.

Right now:
• 12 Pack members are present with this event
• 8 have reflected
• 5 are taking action

Your attention is part of collective attention.
Being present is enough.
```

---

## Technical Implementation

### Database Changes Needed:

```sql
-- Add to events table
ALTER TABLE events ADD COLUMN content_tier INTEGER DEFAULT 1;
  -- 1 = awareness (always show)
  -- 2 = understanding (context available)
  -- 3 = evidence (validator only)

ALTER TABLE events ADD COLUMN has_graphic_content BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN content_warnings TEXT[];

-- User preferences
ALTER TABLE profiles ADD COLUMN content_preferences JSONB DEFAULT '{
  "show_graphic_content": false,
  "auto_expand_context": true,
  "require_closing_ritual": true
}'::jsonb;

-- Dignified representations
CREATE TABLE memorial_entries (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  name TEXT,
  age INTEGER,
  description TEXT,
  remembered_for TEXT,
  created_by UUID REFERENCES profiles(id)
);
```

### UI Components:

**ContentWarning.tsx**
```typescript
interface ContentWarningProps {
  level: 'mild' | 'moderate' | 'severe';
  onConsent: () => void;
}

// Shows warning, requires explicit consent
// Remembers choice per-session
// Can always minimize again
```

**ClosingRitual.tsx**
```typescript
// Guides user out of heavy content
// Breathing prompt
// Acknowledge what they held
// Option to reflect or just close
```

**MemorialView.tsx**
```typescript
// Shows lives, not deaths
// Names, stories, connections
// Honors dignity
// Enables action
```

---

## Key Principles

### 1. **Verification ≠ Voyeurism**
You can verify an event without showing graphic imagery.
Sara checks sources, not screenshots.

### 2. **Awareness ≠ Witnessing Everything**
Maya can be informed without being traumatized.
David can act without having seen the worst.

### 3. **Dignity > Engagement**
Victims' worst moments are not content.
Their lives, loves, and loss deserve honor.

### 4. **Collective > Individual**
No one person needs to hold everything.
Pack distributes the load.

### 5. **Action > Paralysis**
Goal: Informed action
Not: Traumatized inaction

---

## Questions for Discussion

1. **Should validators see graphic content?**
   - Or can verification happen without it?
   - How do we protect their hearts too?

2. **How graphic is too graphic?**
   - Where's the line?
   - Who decides?

3. **What about when victims/survivors want imagery shared?**
   - Their agency vs. viewer protection
   - How do we honor both?

4. **Instagram aggregators: Partners or sources?**
   - Do we pull from them?
   - Do we verify for them?
   - Do we compete with them?

5. **Is "dignified awareness" enough?**
   - Or does hiding reality = privileged distance?
   - How do we honor truth AND protect hearts?

---

## Implementation Priority

**Phase 2.5 (Now):**
- [ ] Add content_tier to events
- [ ] Implement ContentWarning component
- [ ] Default: dignity-preserving imagery only
- [ ] Add user content preferences

**Phase 3:**
- [ ] Memorial entries feature
- [ ] Closing ritual implementation
- [ ] Validator content protection
- [ ] Partner with 2-3 Instagram aggregators

**Phase 4:**
- [ ] Advanced content filtering
- [ ] ML for automatic content warnings
- [ ] Trauma-informed design audit
- [ ] Pilot with mental health professionals
