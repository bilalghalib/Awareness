# Ongoing Issues vs. Discrete Events
## Climate, Genocide, Systemic Injustice

---

## The Problem with "Events"

**Original Awareness (2013):**
- Baghdad car bomb (discrete)
- Earthquake (discrete)
- Building collapse (discrete)

**Reality of 2025:**
- Gaza genocide (ongoing, 18+ months)
- Climate change (decades, continuous)
- Sudan war (2+ years)
- Homelessness crisis (systemic)

**You can't "verify" climate change every day.**
**You can't process genocide as discrete incidents.**

---

## New Model: Issues + Moments

### Issues (Ongoing)

```typescript
interface Issue {
  id: string;
  title: "Climate Crisis" | "Gaza Genocide" | "Sudan Conflict";
  type: "environmental" | "humanitarian" | "systemic";

  // NOT an event - an ongoing situation
  started_at: "2023-10-07" | "1850s" | "2023-04-15";
  current_status: "active" | "monitoring" | "resolved";

  // Collective understanding
  what_we_know: string;  // Verified facts
  what_we_dont_know: string;  // Honest about uncertainty
  what_it_means: string[];  // Multiple interpretations OK

  // How to engage
  ways_to_respond: ResponseTemplate[];
  active_campaigns: CollectiveAction[];

  // Following this issue
  pack_focus: Pack[];  // Which Packs are focused on this
  member_count: number;  // How many people following
}
```

### Moments (Within Issues)

```typescript
interface Moment {
  id: string;
  issue_id: string;  // Belongs to an Issue

  title: "UN Court Rules Plausible Genocide" | "Hottest Day on Record" | "Aid Convoy Bombed";
  type: "development" | "milestone" | "escalation" | "hope";

  occurred_at: string;

  // Why this matters
  significance: string;
  changes_what: string;  // What changed in the Issue

  // Still verified
  verification_trail: InvestigationStep[];

  // Still enables response
  calls_for_action: boolean;
}
```

---

## User Experience

### Following Issues (Not Just Moments)

**Maya can:**
1. **Follow "Climate Crisis"** (the Issue)
2. Get occasional **Moments** within it:
   - "Antarctic Ice Shelf Collapses"
   - "Paris Agreement Anniversary"
   - "Youth Strike Grows to 100 Cities"
3. See **ongoing responses** from her Pack
4. Contribute to **sustained action**, not just reactions

**Instead of:**
- ❌ Daily climate event overload
- ❌ Feeling like nothing changes
- ❌ Burnout from constant alarm

**She gets:**
- ✅ Bounded attention (significant Moments only)
- ✅ Visible progress (collective action over time)
- ✅ Sustained engagement (not reactive)

---

## Example: Gaza as an Issue

### Issue Page

```
Gaza Humanitarian Crisis
Status: Active | Following: 1,247 people | 23 Packs focused

WHAT WE KNOW (Verified):
• Ongoing military operations since Oct 2023
• 30,000+ Palestinian deaths (Gaza Health Ministry)
• 1,200+ Israeli deaths in initial attack (Israeli govt)
• 85% of Gaza population displaced (UN)
• Severe restrictions on aid (multiple sources)

WHAT IT MEANS (Multiple perspectives):
• "This is genocide" - UN Special Rapporteur, ICJ ruling
• "This is self-defense" - Israeli government position
• "This is collective punishment" - Human rights orgs
• "This is more complicated" - [other views]

[Awareness doesn't pick one - shows verified facts + range of interpretations]

ONGOING RESPONSES (Your Pack):
• Weekly vigils in SF (12 weeks running)
• $4,200 raised for medical aid
• 8 letters sent to representatives
• 15 people sustained engagement

MOMENTS (Recent):
→ Aid convoy reaches North Gaza (verified)
→ Ceasefire talks resume (verified)
→ New ICJ hearing scheduled (verified)
```

### Why This Works

**For Maya:**
- ✅ Can stay engaged long-term
- ✅ Not overwhelmed by daily posts
- ✅ Sees her Pack's sustained impact
- ✅ Multiple interpretations honored

**For David:**
- ✅ Ongoing campaigns, not just reactions
- ✅ Build momentum over time
- ✅ Track collective impact
- ✅ Sustainable engagement

**For Sara:**
- ✅ Verify Moments, not daily posts
- ✅ Maintain factual ground
- ✅ Allow interpretation diversity
- ✅ Update understanding over time

---

## Collective Meaning-Making

### The Challenge

**Old model (news):**
- "Here are the facts"
- You decide what it means
- Alone

**Old model (social media):**
- "Here's what it means!"
- Algorithm decides
- Echo chamber

**Awareness model:**
- "Here are verified facts"
- **Pack discusses** what it means
- "Here's what we're doing about it"
- Multiple perspectives OK

### Implementation: Sensemaking Circles

```typescript
interface SensemakingCircle {
  issue_id: string;
  pack_id: string;

  question: "What does this mean for us?";

  perspectives: {
    user_id: string;
    interpretation: string;
    reasoning: string;
    actions_suggested: string[];
  }[];

  // NOT consensus required
  // NOT single truth
  // YES: Multiple valid views
  // YES: Respectful disagreement
  // YES: Action despite difference
}
```

### Example

```
Question: What does the ICJ ruling on genocide mean?

@sara_manila: "It means the legal framework recognizes what
               Palestinians have been saying. We should focus
               on supporting legal accountability."

@david_sf: "It means we need to escalate pressure on our own
            government to stop arms sales. I'm organizing a
            march to the Federal Building."

@maya_berlin: "I don't know what it means yet. I need to sit
               with it. But I want to learn more about the ICJ
               and how it works."

→ No single "Pack position" required
→ People can respond differently
→ Still feel held by Pack
```

---

## Instagram Era: Integration Strategy

### Current Reality

**People get news from:**
1. Instagram story aggregators
2. TikTok activists
3. Twitter/X threads
4. WhatsApp forwards
5. Discord communities

**Not from:**
- Traditional media (increasingly)
- Single authoritative sources
- Desktop websites

### Awareness Needs To

**Option A: Compete** ❌
- Try to be the news source
- Pull followers from Instagram accounts
- Fight for attention
- Lose (they're better at social media)

**Option B: Integrate** ✅
- Partner with trusted aggregators
- Provide value they don't:
  - Verification
  - Sustained engagement
  - Action coordination
  - Emotional support
- Become infrastructure, not competition

### Partnership Model

**With @eye.on.palestine:**
```
1. They post Instagram story
2. Their followers see it
3. They link: "Verified and track collective response at Awareness"
4. We provide:
   - Verification status
   - Context and history
   - Action coordination
   - Impact tracking
5. They get:
   - Credibility boost
   - Actionable audience
   - Less "doom posting"
```

**With climate activists:**
```
1. They organize protests
2. We provide:
   - Sustained engagement between protests
   - Impact visualization
   - Burnout prevention
   - Collective memory
3. They get:
   - Infrastructure for long-term organizing
   - Way to keep people engaged
   - Visible progress
```

---

## What's The Point? (Fundamental)

You asked: **"What's the point?"**

Here's what I think the point is:

### The Problem We're Solving

**Most people want to:**
1. Care about the world ✓
2. Stay informed ✓
3. Take meaningful action ✓
4. Not burn out ✓
5. Feel connected, not alone ✓

**But current tools make them choose:**
- Be informed BUT traumatized
- Take action BUT isolated
- Care deeply BUT get overwhelmed
- Stay engaged BUT doom scroll

**Awareness says: You can have both.**

### The Core Value

**From Joe Edelman's method:**

The point is to enable **constitutive ways of being**, not just **instrumental actions**.

**Not just:** "Help with disasters"
**But:** "Be someone who shows up for the world sustainably"

**Not just:** "Stop misinformation"
**But:** "Create trustworthy ground for others"

**Not just:** "Process emotions"
**But:** "Hold difficult things collectively, not alone"

### The Answer

**The point of Awareness is:**

To create **infrastructure for sustained, collective care about the world** that:
- Protects hearts while staying present
- Enables action without burnout
- Honors truth with dignity
- Builds community through shared attention
- Transforms awareness into healing

**It's not about solving every problem.**
**It's about creating sustainable way to care.**

---

## Next Steps

### Immediate (Phase 2.5):
1. Add content protection (no graphic imagery default)
2. Create "Issue" model alongside "Event"
3. Partner with 1-2 Instagram aggregators
4. Test with climate-focused Pack

### Discussion Needed:
1. Should we allow graphic content at all?
2. How do we handle conflicting interpretations?
3. Which Instagram accounts to partner with?
4. Is "Issues + Moments" the right model?
5. What IS the point? (You tell me)

---

Want to talk through any of this? I can help refine the model, or we can build these features.
