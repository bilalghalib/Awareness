# Awareness Platform Migration Plan
## From Parse + Twitter + MySQL → Supabase + Vercel + Next.js

---

## Executive Summary

This migration plan addresses three critical needs identified through values assessment:

1. **For Sara (Validators):** Enable transparent, collaborative verification workflows with rich investigation trails
2. **For David (Kindness Responders):** Build real-time Pack coordination and collective action tools
3. **For Maya (Aware Witnesses):** Create gentle, bounded experiences with visible cycles of awareness → response → impact

### Current Technical Debt

- **Parse BaaS:** Deprecated since 2017, unsupported
- **Twitter API:** Single point of failure for both detection AND verification
- **iOS-only:** No web access, incomplete mobile experience
- **Hardware:** Wristband prototypes non-functional

---

## Migration Phases

### Phase 1: Foundation (Weeks 1-4)
**Goal:** Set up infrastructure and migrate core data

#### Tasks:

1. **Supabase Setup**
   ```bash
   # Initialize Supabase project
   npx supabase init
   npx supabase start

   # Apply schema
   npx supabase db push

   # Configure RLS policies
   # (already in schema/supabase-schema.sql)
   ```

2. **Next.js 14 App Setup**
   ```bash
   # Create Next.js app with App Router
   npx create-next-app@latest awareness-platform \
     --typescript \
     --tailwind \
     --app \
     --src-dir

   cd awareness-platform
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
   npm install framer-motion date-fns zod
   npm install -D @types/node
   ```

3. **Data Migration Script**
   - Export Parse data (users, installations, custom objects)
   - Export legacy MySQL data (alerts, verifications, responses)
   - Transform to new schema
   - Import to Supabase via SQL

   ```typescript
   // scripts/migrate-parse-data.ts
   import { createClient } from '@supabase/supabase-js'
   import Parse from 'parse/node'

   // Migration logic here (see implementation below)
   ```

4. **Environment Configuration**
   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Twitter API (for event detection only)
   TWITTER_API_KEY=...
   TWITTER_API_SECRET=...
   TWITTER_BEARER_TOKEN=...

   # Optional: Twilio for SMS
   TWILIO_ACCOUNT_SID=...
   TWILIO_AUTH_TOKEN=...
   ```

**Deliverables:**
- ✅ Supabase project configured with schema
- ✅ Next.js app scaffold with authentication
- ✅ All Parse/MySQL data migrated
- ✅ Basic CRUD operations working

---

### Phase 2: Core User Flows (Weeks 5-8)
**Goal:** Rebuild essential features with improved UX

#### 2.1 Authentication & Onboarding

**Features:**
- Email/password + social auth (Google, Twitter)
- Timezone-based Pack matching
- Role selection (member, validator, KFR)

**Implementation:**
```typescript
// app/(auth)/login/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (session) redirect('/dashboard')

  return <LoginForm />
}
```

#### 2.2 Event Feed for Maya (Aware Witnesses)

**Design Principles:**
- Minimal, calm UI (no red alerts, no urgent buzzwords)
- Show verification status clearly
- Display Pack presence indicators
- Visible cycle: alert → verification → responses → impact

**Key Components:**
```typescript
// components/EventFeed.tsx
'use client'

import { useSupabase } from '@/hooks/useSupabase'
import { useEffect, useState } from 'react'
import type { ActiveEventView } from '@/types/database.types'

export function EventFeed() {
  const supabase = useSupabase()
  const [events, setEvents] = useState<ActiveEventView[]>([])

  useEffect(() => {
    // Subscribe to realtime updates
    const channel = supabase
      .channel('events')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        (payload) => {
          // Update events list
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="space-y-6">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
```

**Pages:**
- `/dashboard` - Event feed with filters
- `/events/[id]` - Event detail with full cycle view
- `/events/[id]/reflect` - Reflection space

#### 2.3 Verification Workflow for Sara (Validators)

**Design Principles:**
- Show investigation as a structured process
- Enable collaborative discussion
- Make verification trail visible to end users
- Support confidence levels, not just binary valid/invalid

**Key Components:**
```typescript
// components/VerificationWorkflow.tsx
'use client'

import { useState } from 'react'
import type { InvestigationStep, Event } from '@/types/database.types'

export function VerificationWorkflow({ event }: { event: Event }) {
  const [steps, setSteps] = useState<InvestigationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  const addStep = (action: string, details: string, sources?: string[]) => {
    setSteps(prev => [...prev, {
      step: prev.length + 1,
      action,
      details,
      sources,
      timestamp: new Date().toISOString()
    }])
  }

  return (
    <div className="verification-workflow">
      <InvestigationTrail steps={steps} />
      <StepInput onAddStep={addStep} />
      <EvidenceGathering />
      <CollaborativeDiscussion eventId={event.id} />
      <ConfidenceSlider />
      <SubmitVerification steps={steps} />
    </div>
  )
}
```

**Pages:**
- `/verify` - Assigned events queue
- `/verify/[eventId]` - Verification workflow
- `/verify/[eventId]/discuss` - Validator discussion thread

#### 2.4 Response Coordination for David (KFRs)

**Design Principles:**
- Show what others in Pack are doing (real-time)
- Provide action templates ("what can we do?")
- Enable building on others' responses
- Track sustainability (prevent burnout)

**Key Components:**
```typescript
// components/CollectiveActionBoard.tsx
'use client'

import { useRealtimePresence } from '@/hooks/useRealtimePresence'
import type { CollectiveAction } from '@/types/database.types'

export function CollectiveActionBoard({ packId, eventId }: Props) {
  const presence = useRealtimePresence(packId, eventId)

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left: Who's responding right now */}
      <PackPresencePanel presence={presence} />

      {/* Right: Coordinated actions */}
      <CollectiveActionsList packId={packId} eventId={eventId} />

      {/* Bottom: Response templates */}
      <ResponseTemplates eventId={eventId} />
    </div>
  )
}
```

**Pages:**
- `/respond` - Current alerts awaiting response
- `/respond/[eventId]` - Response coordination board
- `/respond/[eventId]/organize` - Create collective action
- `/profile/capacity` - Sustainability dashboard

**Deliverables:**
- ✅ All three core user flows implemented
- ✅ Real-time features working (presence, updates)
- ✅ Mobile-responsive design
- ✅ Accessibility audit passed

---

### Phase 3: Advanced Features (Weeks 9-12)
**Goal:** Add differentiating features that support identified values

#### 3.1 Pack Presence & Collective Holding

**Features:**
- Real-time presence indicators ("12 people are with this event right now")
- Heartbeat mechanism (updates every 30s)
- Activity indicators ("Sara is verifying", "David is organizing", "Maya is reflecting")
- Gentle animations showing collective attention

**Implementation:**
```typescript
// hooks/usePackPresence.ts
import { useEffect, useState } from 'react'
import { useSupabase } from './useSupabase'
import type { PackPresence, Profile } from '@/types/database.types'

export function usePackPresence(packId: string, eventId?: string) {
  const supabase = useSupabase()
  const [presence, setPresence] = useState<(PackPresence & { profile: Profile })[]>([])

  useEffect(() => {
    // Send heartbeat every 30s
    const heartbeat = setInterval(() => {
      supabase.from('pack_presence').upsert({
        pack_id: packId,
        event_id: eventId,
        status: 'active',
        last_heartbeat_at: new Date().toISOString()
      })
    }, 30000)

    // Subscribe to presence changes
    const channel = supabase
      .channel(`presence:${packId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pack_presence',
          filter: `pack_id=eq.${packId}`
        },
        (payload) => {
          // Update presence list
        }
      )
      .subscribe()

    return () => {
      clearInterval(heartbeat)
      supabase.removeChannel(channel)
    }
  }, [packId, eventId])

  return presence
}
```

#### 3.2 Investigation Trail Visualization

**Features:**
- Timeline view of Sara's verification process
- Expandable evidence items
- Cross-reference links between sources
- Confidence score visualization

**UI:**
```
Event: Baghdad Marketplace Bombing
Status: Verified (Confidence: 0.85)

Investigation Trail (by @sara_manila):
┌─────────────────────────────────────────────┐
│ 10:23 AM - Checked original source         │
│ └─ Found original tweet from @journalist123│
│    with timestamp and location             │
├─────────────────────────────────────────────┤
│ 10:25 AM - Cross-referenced news outlets   │
│ └─ Confirmed by:                           │
│    • Al Jazeera (link)                     │
│    • Reuters (link)                        │
├─────────────────────────────────────────────┤
│ 10:30 AM - Verified image metadata         │
│ └─ Photo taken 2024-01-15 09:45 AM        │
│    Location: 33.3152°N, 44.3661°E         │
└─────────────────────────────────────────────┘

This verification was reviewed by 3 other validators.
```

#### 3.3 Reflection & Grief Spaces

**Features:**
- Guided reflection prompts
- Emotion tracking (not for surveillance, for self-awareness)
- Pack-level grief circles
- Graceful "return to life" rituals

**Implementation:**
```typescript
// components/ReflectionSpace.tsx
'use client'

export function ReflectionSpace({ event, packId }: Props) {
  return (
    <div className="reflection-space">
      {/* Quiet, spacious design */}
      <EventSummary event={event} minimal />

      {/* Emotion check-in */}
      <EmotionSelector
        prompt="What are you feeling right now?"
        options={['sadness', 'anger', 'fear', 'hope', 'connection']}
      />

      {/* Open reflection */}
      <ReflectionPrompt
        prompt="Take a moment to be with this. What's present for you?"
      />

      {/* See others' reflections (if they chose to share) */}
      <PackReflections packId={packId} eventId={event.id} />

      {/* Closing ritual */}
      <ClosingRitual
        prompt="When you're ready to return to your day, take a breath and acknowledge what you've held."
      />
    </div>
  )
}
```

#### 3.4 Burnout Prevention

**Features:**
- Weekly response limits (user-configurable)
- "You've responded to 4 events this week. Consider resting." notices
- Burnout risk scoring
- Encouraged rest periods

**Implementation:**
```typescript
// middleware.ts - Check before allowing response
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/respond')) {
    const supabase = createMiddlewareClient({ req: request, res: response })
    const { data: engagement } = await supabase
      .from('user_engagement_view')
      .select('burnout_risk, responses_this_week')
      .single()

    if (engagement?.burnout_risk === 'high') {
      return NextResponse.redirect(new URL('/capacity/rest', request.url))
    }
  }
}
```

**Deliverables:**
- ✅ Pack presence system working
- ✅ Investigation trails visible
- ✅ Reflection spaces functional
- ✅ Burnout prevention active

---

### Phase 4: Hardware Integration (Weeks 13-16)
**Goal:** Restore and modernize wristband notifications

#### 4.1 Wristband Architecture

**Options:**

1. **ESP32-based (recommended)**
   - WiFi + Bluetooth
   - Low power consumption
   - Native TLS support
   - $5 per unit

2. **Raspberry Pi Pico W**
   - More powerful
   - Better for prototyping
   - $6 per unit

**Design:**
```
Wristband Components:
- ESP32 microcontroller
- Peltier thermoelectric element (warming)
- Li-ion battery (500mAh, 8-10 hours)
- USB-C charging
- Haptic motor (optional backup)
- Status LED (hidden, for debugging)
```

#### 4.2 Communication Protocol

**MQTT over Supabase Realtime:**

```typescript
// Device firmware (C++ on ESP32)
#include <WiFi.h>
#include <PubSubClient.h>

void setup() {
  // Connect to WiFi
  WiFi.begin(ssid, password);

  // Connect to Supabase MQTT broker
  mqttClient.setServer(SUPABASE_REALTIME_HOST, 1883);
  mqttClient.setCallback(messageCallback);

  // Subscribe to user's notification channel
  mqttClient.subscribe("notifications/user_123");
}

void messageCallback(char* topic, byte* payload, unsigned int length) {
  // Parse notification
  // Activate warming sequence
  activateWarming(30); // 30 seconds of gentle warmth
}
```

**Backend (Supabase Edge Function):**

```typescript
// supabase/functions/send-wristband-notification/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const { user_id, event_id } = await req.json()

  const supabase = createClient(...)

  // Get user's wristband device
  const { data: devices } = await supabase
    .from('notifications')
    .select('device_id, device_metadata')
    .eq('user_id', user_id)
    .eq('type', 'thermal')

  // Send MQTT message
  await mqttPublish(`notifications/${user_id}`, {
    type: 'thermal',
    event_id,
    duration: 30,
    intensity: 'gentle'
  })

  return new Response('Sent', { status: 200 })
})
```

#### 4.3 Fallback Strategy

**If wristband hardware isn't ready:**
- PWA with Web Push API
- iOS push notifications (via APNS)
- SMS alerts (via Twilio)
- Email (via Supabase + SendGrid)

**Deliverables:**
- ✅ ESP32 prototype functional
- ✅ MQTT communication working
- ✅ Thermal notification tested
- ✅ Fallback notifications working

---

### Phase 5: Polish & Launch (Weeks 17-20)
**Goal:** Production-ready platform

#### Tasks:

1. **Performance Optimization**
   - Server-side rendering for initial load
   - Edge caching via Vercel
   - Image optimization
   - Code splitting

2. **Security Audit**
   - RLS policy review
   - API endpoint security
   - XSS/CSRF protection
   - Rate limiting

3. **User Testing**
   - Test with 3 pilot Packs (15 users each)
   - Gather feedback on each value dimension:
     - Sara: Can you verify effectively? Is the trail clear?
     - David: Can you coordinate? Do you feel supported?
     - Maya: Can you stay present? Is it overwhelming?

4. **Documentation**
   - User guides
   - Validator handbook
   - Pack organizer playbook
   - API documentation

5. **Deployment**
   ```bash
   # Frontend
   vercel --prod

   # Database migrations
   npx supabase db push --prod

   # Edge functions
   npx supabase functions deploy
   ```

**Deliverables:**
- ✅ Production deployment
- ✅ User documentation complete
- ✅ Pilot Packs onboarded
- ✅ Monitoring & analytics configured

---

## Migration Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Parse data loss during migration | High | Backup all Parse data; run migration in staging first; keep Parse running during transition |
| Twitter API rate limits | Medium | Cache aggressively; implement exponential backoff; consider alternative news sources |
| Wristband hardware delays | Medium | Deploy software-only version first; use push notifications as fallback |
| User adoption challenges | High | Onboard existing users carefully; provide migration guides; maintain iOS app temporarily |
| Supabase scaling costs | Medium | Monitor usage; optimize queries; implement caching; negotiate enterprise pricing |
| RLS policy bugs | High | Thorough testing; staged rollout; manual review of sensitive queries |

---

## Success Metrics

### For Sara (Validators)
- ✅ Average verification time decreases by 30%
- ✅ Verification confidence scores available
- ✅ 80% of validators report "feeling supported by investigation tools"
- ✅ Validator discussions have >50 messages per event

### For David (KFRs)
- ✅ 3x more coordinated collective actions vs. individual responses
- ✅ Average action participation increases from 1 to 5+ people
- ✅ Burnout rate decreases (measured via survey)
- ✅ 70% of responses include "building on" another response

### For Maya (Aware Witnesses)
- ✅ Session duration increases (more time spent with fewer events)
- ✅ Reflection completion rate >60%
- ✅ "Overwhelm" scores decrease by 40% (via survey)
- ✅ 80% of users report "feeling held by Pack"

### Platform Health
- ✅ 99.9% uptime
- ✅ <100ms p95 query latency
- ✅ Real-time features <500ms delay
- ✅ Zero critical security vulnerabilities

---

## Cost Estimates

### Development (20 weeks × $100/hr × 40hr/week)
- **Total:** $80,000

### Infrastructure (monthly)
- **Supabase Pro:** $25/mo (first 500k rows, 2GB database)
- **Vercel Pro:** $20/mo (unlimited bandwidth, edge functions)
- **Twilio SMS:** $0.0075/msg × 1000 users × 2 alerts/week = $60/mo
- **Domain + SSL:** $2/mo
- **Total:** ~$110/mo

### Hardware (per wristband)
- **ESP32:** $5
- **Peltier element:** $3
- **Battery + charging:** $4
- **Enclosure + assembly:** $8
- **Total per unit:** $20
- **For 100 units:** $2,000

---

## Next Steps

1. **Week 1:** Approve this plan and allocate resources
2. **Week 2:** Set up Supabase project and Next.js scaffold
3. **Week 3:** Begin data migration (run in parallel with Phase 2)
4. **Week 4-8:** Build core flows (recruit 3 pilot users for feedback)
5. **Week 9-12:** Advanced features (test with 15-person pilot Pack)
6. **Week 13-16:** Hardware prototyping (order components now)
7. **Week 17-20:** Polish and launch

---

## Questions for Discussion

1. **Priority:** Which user persona should we prioritize first? (Recommendation: Maya → Sara → David, as awareness → verification → response flows naturally)

2. **Hardware:** Do we launch software-only first, or delay until wristbands work? (Recommendation: Software first, hardware as v2)

3. **Scope:** Should we support multiple crisis types immediately, or stay focused on Iraq car bombs initially? (Recommendation: Build generic, deploy focused)

4. **Twitter:** Do we keep Twitter for verification, or move to in-app only? (Recommendation: Move to in-app; Twitter for event detection only)

5. **Open Source:** Should this platform be open-sourced? (Recommendation: Yes, after launch - enables other communities to adapt)
