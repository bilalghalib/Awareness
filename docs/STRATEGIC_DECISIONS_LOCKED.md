# Strategic Decisions - Locked In
## Ready for Implementation

---

## ✅ CONFIRMED DECISIONS

### 1. Content Protection Policy

**Decision:** Three-tier system

**Tier 1 (Default - Everyone):**
- ❌ NO graphic content ever
- ✅ Dignity-preserving imagery only
- ✅ Maps, charts, text, people in life (not death)

**Tier 2 (Context - Opt-in):**
- ❌ Still no graphic content
- ✅ Historical background, analysis
- ✅ Before/after (buildings, not bodies)

**Tier 3 (Evidence - Validators Only):**
- ⚠️ May include graphic content
- ✅ Behind authentication + warnings
- ✅ Only for validators who explicitly opt-in
- ✅ With trauma support resources

**Memorial Approach:**
- Show names, ages, what they loved
- Honor dignity, not exploit suffering
- Enable action, not voyeurism

**Implementation Priority:** Phase 2.5 (immediate)

---

### 2. Instagram/TikTok Integration

**Decision:** Partnership model, not competition

**Strategy:**
- Partner with 2-3 trusted aggregators (@eye.on.palestine, climate accounts, etc.)
- They curate and post (what they do best)
- We provide infrastructure (verification, coordination, emotional support)
- They link to awareness.app from their stories
- We give them analytics showing real impact

**What We Provide Partners:**
- ✅ Verification badge
- ✅ Full verification trails
- ✅ Action coordination for their audience
- ✅ Impact analytics ("1,247 people took action from your post")
- ✅ Revenue share (future)

**What We Get:**
- ✅ Reach (their audience)
- ✅ Credibility (their trust)
- ✅ Content (their curation)
- ✅ Purpose (enable their movement work)

**Phase 1 (Now):** Manual linking
**Phase 2 (Month 2):** Partner dashboard with link tools
**Phase 3 (Month 3-6):** Rich integration, analytics

**Implementation Priority:** Phase 2.5 (start conversations with partners)

---

### 3. Issues Model (Ongoing Crises)

**Decision:** Yes, add Issues alongside Events

**Two Content Types:**

**ISSUES** (Ongoing):
- Climate Crisis
- Gaza Humanitarian Crisis
- Sudan War
- Homelessness
- etc.

Characteristics:
- No single start/end
- Requires sustained attention
- Multiple interpretations valid
- Calls for ongoing campaigns

**MOMENTS** (Discrete, within Issues):
- "Aid convoy reaches Gaza"
- "Hottest day on record"
- "Court ruling issued"

Characteristics:
- Happened at specific time
- Verifiable occurrence
- Triggers attention
- Calls for immediate response

**Relationship:**
- Moments belong to Issues
- Issues are followed long-term
- Packs focus on Issues, respond to Moments

**Implementation Priority:** Phase 2.5 (immediate - foundational)

---

### 4. Levels of Implication Framework

**Decision:** Yes, implement this

**Six Levels:**
1. **Individual** - Personal choices, daily life, consumption
2. **Family** - Household, investments, intergenerational
3. **Community** - Local organizing, institutions, infrastructure
4. **Culture** - Identity, traditions, narratives, art
5. **Country** - Political action, voting, national policy
6. **Global/Systemic** - Capitalism, colonialism, structural change

**For Each Level:**
- "How am I implicated?" (prompts)
- "What can I do?" (actions)
- Pack discussion space
- Action templates
- Resource library
- Track who's acting at this level

**Why It Matters:**
- Avoids oversimplification ("just donate $5")
- Enables appropriate action (different people, different levels)
- Shows interconnection (all levels matter)
- Reduces paralysis ("I can do something")
- Honors complexity (we're all implicated differently)

**Implementation Priority:** Phase 3 (after Issues model established)

---

### 5. Interpretation Policy

**Decision:** Multiple perspectives, not platform truth

**Awareness Does:**
- ✅ Verify facts (what happened)
- ✅ Show verification trail (how we know)
- ✅ Present range of interpretations (what it means)
- ✅ Enable Pack sensemaking (decide together)

**Awareness Does NOT:**
- ❌ Declare single truth about meaning
- ❌ Platform-wide position on interpretations
- ❌ Force consensus within Packs
- ❌ Hide perspectives we disagree with

**Example (Gaza):**
```
VERIFIED FACTS:
• 30,000+ deaths (Gaza Health Ministry)
• 1,200+ deaths in Oct 7 attack (Israeli govt)
• ICJ ruled "plausible genocide"

INTERPRETATIONS (Multiple valid):
• "This is genocide" - UN Special Rapporteur
• "This is self-defense" - Israeli government
• "This is more complicated" - [other views]

YOUR PACK'S SENSEMAKING:
[Space for discussion without forced consensus]
```

**Implementation:** Built into Issues model

---

### 6. Scale Strategy

**Decision:** Small Packs, many per Issue

**Pack Size:** 15-20 people max
- Enables intimacy
- Everyone can be known
- Sustainable attention
- Prevents overwhelm

**Pack Distribution:** Many Packs per Issue
- SF Bay Area Pack (Gaza-focused)
- Manila Pack (Gaza-focused)
- Berlin Pack (Gaza-focused)
- = 60 people total, 3 Packs

**Cross-Pack Coordination:**
- Packs can see each other's actions
- Can coordinate campaigns together
- Share learnings
- Build movement at scale

**Why This Works:**
- Individual: Not overwhelmed (15-20 people)
- Movement: Impact at scale (many Packs)
- Awareness: Sustainable growth (add Packs, not just members)

**Implementation:** Current architecture supports this

---

## 🔄 IMPLEMENTATION ROADMAP

### Phase 2.5 (Immediate - 2 weeks)

**Content Protection:**
- [ ] Add `content_tier` to events/moments
- [ ] Add `content_warnings` field
- [ ] Implement ContentWarning component
- [ ] Add user content preferences
- [ ] Build ClosingRitual component
- [ ] Default all imagery to dignity-preserving

**Issues Model:**
- [ ] Create `issues` table
- [ ] Convert `events` to `moments` (with issue_id)
- [ ] Issue following functionality
- [ ] Issue page (ongoing engagement)
- [ ] Moments feed within Issues
- [ ] Pack focus on Issues

**Instagram Integration - Phase 1:**
- [ ] Reach out to 2-3 partner accounts
- [ ] Create manual linking process
- [ ] Design partner landing pages
- [ ] Track click-through manually
- [ ] Prove the model

### Phase 3 (Sara's Tools - 4 weeks)

**Verification Workflow:**
- [ ] Investigation workspace
- [ ] Evidence collection UI
- [ ] Validator discussions (threaded)
- [ ] Confidence scoring mechanism
- [ ] Tier 3 content access controls

**Validator Protection:**
- [ ] Content warnings for validators
- [ ] Trauma support resources
- [ ] Validator debriefing space
- [ ] Burnout monitoring

### Phase 4 (David's Tools - 4 weeks)

**Response Coordination:**
- [ ] Response template library (pre-built)
- [ ] Collective action board
- [ ] Campaign creation flow
- [ ] Capacity tracking (prevent burnout)

**Levels of Implication:**
- [ ] Implication levels table
- [ ] Level explorer UI
- [ ] Pack customization of levels
- [ ] Action tracking at each level
- [ ] Resource library per level

### Phase 5 (Instagram Integration - 2 weeks)

**Partner Tools:**
- [ ] Partner dashboard
- [ ] "Create Moment" flow
- [ ] Auto-generate awareness.app links
- [ ] Analytics (actions taken from their posts)
- [ ] Revenue share model

### Phase 6 (Scale - Ongoing)

**Growth:**
- [ ] Onboarding flow refinement
- [ ] Pack matching algorithm
- [ ] Cross-Pack features
- [ ] Business model implementation
- [ ] Partner expansion (10-20 accounts)

---

## 🎯 SUCCESS METRICS

### User Engagement
- ✅ People staying engaged >6 months (not just signing up)
- ✅ Actions taken (not just views)
- ✅ Cross-level participation (not just individual)
- ✅ Pack cohesion (people know each other)

### Content Health
- ✅ Zero graphic content shown to Witnesses
- ✅ Validator trauma rates low
- ✅ Reflection completion rates >60%
- ✅ Closing ritual usage

### Movement Impact
- ✅ Coordinated actions across Packs
- ✅ Sustained campaigns (>1 month)
- ✅ Multiple levels activated
- ✅ Partner satisfaction (NPS >50)

### Platform Health
- ✅ Burnout rates LOW (want them low!)
- ✅ Multiple interpretations coexisting
- ✅ Packs staying small (15-20)
- ✅ Growth via new Packs, not just members

---

## 💰 BUSINESS MODEL

**Confirmed Approach:** Hybrid

**Free Tier:**
- Event/Moment feed
- Pack membership (1 Pack)
- Basic reflections
- View verification trails
- Basic actions

**Paid Tier ($5-10/month):**
- Multiple Pack memberships
- Advanced analytics
- Custom Pack creation
- API access
- Priority support

**Institutional ($500+/month):**
- White-label Packs for organizations
- Admin tools
- Training and support
- Custom integrations

**Grants/Philanthropy:**
- Core platform development
- New feature development
- Partner support
- Research and evaluation

---

## ⚠️ OPEN QUESTIONS (Still Need Decisions)

### 1. Which Instagram Partners First?

**Candidates:**
- @eye.on.palestine (Gaza) - CONFIRMED interest?
- Climate accounts (which ones?)
- Mutual aid accounts (suggestions?)

**Next step:** Reach out and gauge interest

### 2. Validator Capacity

**Issue:** If 10 partners post daily = 70 Moments/week to verify

**Options:**
A. Limit partners to 3-5 (keep verification manageable)
B. Recruit many more validators (30-50 Saras)
C. Create validator tiers (trusted partners auto-verified)

**Recommendation:** Start with A, move to C

### 3. Revenue Share with Partners

**If partner drives 100 users who subscribe ($10/month):**
- Option A: 20% to partner ($200/month)
- Option B: 30% to partner ($300/month)
- Option C: Grant model (not percentage)

**Recommendation:** Start with B (generous to partners)

### 4. Handling Controversial Interpretations

**Example:** Partner says "this is genocide"
**Another view:** "It's not genocide"

**Current decision:** Show both, let Packs decide
**But:** What if partner is verifiably wrong about facts?

**Need clearer policy on fact vs interpretation line**

### 5. Pack Discovery/Matching

**How do users find the right Pack?**
- Geography + Issue focus
- Values alignment
- Activity level
- Language

**Need:** Pack matching algorithm design

---

## ✅ READY TO BUILD

All major strategic decisions are locked in. We can now:

1. **Implement Phase 2.5** (Issues + Content Protection)
2. **Start partner conversations** (Instagram integration)
3. **Build UI for new features**
4. **Test with pilot users**

Or if you want to discuss/refine any of these decisions first, we can do that.

**What do you want to do next?**
