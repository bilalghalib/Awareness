/**
 * Event Detail Page
 * FOR MAYA: Full cycle view with presence, verification, and reflection
 */

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { PackPresence } from '@/components/events/PackPresence'
import { VerificationTrail } from '@/components/events/VerificationTrail'
import { ReflectionSpace } from '@/components/events/ReflectionSpace'
import { ImpactVisualization } from '@/components/events/ImpactVisualization'
import { AutoContentWarning } from '@/components/content/ContentWarning'
import { ClosingRitualTrigger } from '@/components/content/ClosingRitual'
import { formatDistanceToNow } from 'date-fns'
import { ContentTier } from '@/types/database.types'
import Link from 'next/link'

interface EventPageProps {
  params: {
    id: string
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile and pack memberships
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, pack_memberships(pack_id, role)')
    .eq('id', user.id)
    .single()

  const userPackId = profile?.pack_memberships?.[0]?.pack_id

  // Get event with issue context
  const { data: event, error } = await supabase
    .from('events')
    .select(
      `
      *,
      impact_tracking:event_impact_tracking (*),
      issue:issues (id, title, slug, type)
    `
    )
    .eq('id', params.id)
    .single()

  if (error || !event) {
    notFound()
  }

  // Get active Pack presence for this event
  const { data: presence } = userPackId
    ? await supabase
        .from('pack_presence')
        .select('*, profile:profiles(username, display_name, avatar_url)')
        .eq('pack_id', userPackId)
        .eq('event_id', event.id)
        .gt('last_heartbeat_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
    : { data: [] }

  // Get reflections
  const { data: reflections } = await supabase
    .from('reflections')
    .select('*, author:profiles(username, display_name, avatar_url)')
    .eq('event_id', event.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="text-sm mb-4 flex items-center gap-2">
            {event.issue ? (
              <>
                <Link
                  href={`/issues/${event.issue.slug}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {event.issue.title}
                </Link>
                <span className="text-gray-400">→</span>
                <span className="text-gray-600 dark:text-gray-400">Moment</span>
              </>
            ) : (
              <a
                href="/events"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Back to Events
              </a>
            )}
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {event.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {event.location}
                </span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(event.occurred_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
              <svg
                className="w-5 h-5 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content Protection Wrapper */}
        <AutoContentWarning
          contentTier={(event.content_tier as ContentTier) || ContentTier.Awareness}
          warnings={event.content_warnings || []}
          eventId={event.id}
        >
          {/* Description */}
          {event.description && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

        {/* Pack Presence - FOR MAYA: Shows collective holding */}
        {userPackId && (
          <div className="mb-6">
            <PackPresence
              packId={userPackId}
              eventId={event.id}
              activeMembers={presence || []}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Verification Trail */}
            {event.verification_trail && event.verification_trail.length > 0 && (
              <VerificationTrail
                steps={event.verification_trail}
                verifications={[]}
                confidenceScore={event.verification_confidence_score}
              />
            )}

            {/* Impact Visualization */}
            {event.impact_tracking?.[0] && (
              <ImpactVisualization
                initialDamage={event.impact_tracking[0].initial_damage_score}
                currentDamage={event.impact_tracking[0].current_damage_score}
                responseCount={event.impact_tracking[0].response_count}
              />
            )}

            {/* Reflection Space - FOR MAYA: Emotional processing */}
            <ReflectionSpace
              eventId={event.id}
              packId={userPackId}
              existingReflections={reflections || []}
            />
          </div>

          {/* Right Column: Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Gentle Actions Card */}
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
                <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100 mb-4">
                  Ways to Engage
                </h3>

                <ul className="space-y-3">
                  <li>
                    <button className="text-left w-full hover:bg-amber-100 dark:hover:bg-amber-900/30 p-3 rounded transition-colors">
                      <div className="font-medium text-amber-900 dark:text-amber-100">
                        Share a reflection
                      </div>
                      <div className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                        Process your emotions with your Pack
                      </div>
                    </button>
                  </li>

                  <li>
                    <button className="text-left w-full hover:bg-amber-100 dark:hover:bg-amber-900/30 p-3 rounded transition-colors">
                      <div className="font-medium text-amber-900 dark:text-amber-100">
                        Light a candle
                      </div>
                      <div className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                        Hold space for those affected
                      </div>
                    </button>
                  </li>

                  <li>
                    <button className="text-left w-full hover:bg-amber-100 dark:hover:bg-amber-900/30 p-3 rounded transition-colors">
                      <div className="font-medium text-amber-900 dark:text-amber-100">
                        Learn more
                      </div>
                      <div className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                        Understand the context and history
                      </div>
                    </button>
                  </li>
                </ul>

                <div className="pt-4 mt-4 border-t border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-300 italic">
                    No pressure. Being present is enough.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Closing Ritual Trigger */}
        <div className="mt-8 flex justify-center">
          <ClosingRitualTrigger eventTitle={event.title} />
        </div>
      </AutoContentWarning>
      </main>
    </div>
  )
}
