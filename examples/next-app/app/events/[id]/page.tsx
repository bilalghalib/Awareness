/**
 * Event Detail Page
 * Demonstrates values-driven design for all three personas
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Database } from '@/types/database.types'

import { EventHeader } from '@/components/events/EventHeader'
import { VerificationTrail } from '@/components/events/VerificationTrail'
import { PackPresence } from '@/components/events/PackPresence'
import { ResponseTimeline } from '@/components/events/ResponseTimeline'
import { ImpactVisualization } from '@/components/events/ImpactVisualization'
import { ReflectionSpace } from '@/components/events/ReflectionSpace'
import { CollectiveActionBoard } from '@/components/events/CollectiveActionBoard'

interface EventPageProps {
  params: {
    id: string
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Get current user and their pack memberships
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return notFound()
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, pack_memberships(pack_id, role)')
    .eq('id', user.id)
    .single()

  // Get event with all related data
  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      verifications (
        *,
        validator:profiles (username, display_name, avatar_url)
      ),
      responses (
        *,
        user:profiles (username, display_name, avatar_url),
        building_on:responses (id, description, user:profiles(username))
      ),
      impact_tracking:event_impact_tracking (*)
    `)
    .eq('id', params.id)
    .single()

  if (!event) {
    return notFound()
  }

  // Get active Pack presence for this event
  const userPackId = profile?.pack_memberships?.[0]?.pack_id

  const { data: presence } = userPackId
    ? await supabase
        .from('pack_presence')
        .select('*, profile:profiles(username, display_name, avatar_url)')
        .eq('pack_id', userPackId)
        .eq('event_id', event.id)
        .gt('last_heartbeat_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Active in last 5 min
    : { data: [] }

  // Check user's role
  const isValidator = profile?.roles?.includes('validator')
  const isKFR = profile?.roles?.includes('kindness_responder')

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Event Header - For everyone */}
      <EventHeader event={event} />

      {/* Pack Presence - FOR MAYA: Shows collective holding */}
      <section className="mt-8 mb-12">
        <PackPresence
          packId={userPackId}
          eventId={event.id}
          activeMembers={presence || []}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Verification & Impact */}
        <div className="lg:col-span-2 space-y-8">
          {/* Verification Trail - FOR SARA: Shows investigation process */}
          {event.verification_trail && event.verification_trail.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                How We Verified This
              </h2>
              <VerificationTrail
                steps={event.verification_trail}
                verifications={event.verifications}
                confidenceScore={event.verification_confidence_score}
              />
            </section>
          )}

          {/* Impact Visualization - FOR MAYA & DAVID: Shows cycle completing */}
          {event.impact_tracking && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                Collective Response Impact
              </h2>
              <ImpactVisualization
                initialDamage={event.impact_tracking.initial_damage_score}
                currentDamage={event.impact_tracking.current_damage_score}
                responseCount={event.impact_tracking.response_count}
              />
            </section>
          )}

          {/* Response Timeline - FOR DAVID: Shows coordination */}
          {event.responses && event.responses.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                How We Responded
              </h2>
              <ResponseTimeline
                responses={event.responses}
                showBuildOnLinks={true}
              />
            </section>
          )}

          {/* Reflection Space - FOR MAYA: Emotional processing */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Reflections
            </h2>
            <ReflectionSpace
              eventId={event.id}
              packId={userPackId}
            />
          </section>
        </div>

        {/* Right Column: Action Board */}
        <div className="lg:col-span-1">
          {/* FOR DAVID: Coordination tools */}
          {isKFR && (
            <section className="sticky top-4">
              <h2 className="text-xl font-semibold mb-4">
                Coordinate Response
              </h2>
              <CollectiveActionBoard
                eventId={event.id}
                packId={userPackId}
              />
            </section>
          )}

          {/* FOR SARA: Validator tools */}
          {isValidator && event.status === 'validating' && (
            <section className="sticky top-4">
              <VerificationTools event={event} />
            </section>
          )}

          {/* FOR MAYA: Gentle actions */}
          {!isKFR && !isValidator && (
            <section className="sticky top-4">
              <GentleActionSuggestions
                eventId={event.id}
                packId={userPackId}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Gentle Action Suggestions - FOR MAYA
 * Low-pressure ways to engage without becoming a full KFR
 */
function GentleActionSuggestions({ eventId, packId }: { eventId: string, packId?: string }) {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100">
        Ways to Engage
      </h3>

      <ul className="space-y-3">
        <li>
          <button className="text-left w-full hover:bg-amber-100 dark:hover:bg-amber-900/30 p-3 rounded transition-colors">
            <div className="font-medium">Share a reflection</div>
            <div className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              Process your emotions with your Pack
            </div>
          </button>
        </li>

        <li>
          <button className="text-left w-full hover:bg-amber-100 dark:hover:bg-amber-900/30 p-3 rounded transition-colors">
            <div className="font-medium">Light a candle</div>
            <div className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              Hold space for those affected
            </div>
          </button>
        </li>

        <li>
          <button className="text-left w-full hover:bg-amber-100 dark:hover:bg-amber-900/30 p-3 rounded transition-colors">
            <div className="font-medium">Learn more</div>
            <div className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              Understand the context and history
            </div>
          </button>
        </li>

        <li>
          <button className="text-left w-full hover:bg-amber-100 dark:hover:bg-amber-900/30 p-3 rounded transition-colors">
            <div className="font-medium">Join a collective action</div>
            <div className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              Coordinate with your Pack
            </div>
          </button>
        </li>
      </ul>

      <div className="pt-4 border-t border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-700 dark:text-amber-300">
          No pressure. Being present is enough.
        </p>
      </div>
    </div>
  )
}
