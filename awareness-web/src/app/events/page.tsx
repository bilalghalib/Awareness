/**
 * Events Feed Page
 * FOR MAYA: Calm, curated feed of verified events
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventCard } from '@/components/events/EventCard'
import { EventFilters } from '@/components/events/EventFilters'

interface EventsPageProps {
  searchParams: {
    status?: string
  }
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's pack memberships
  const { data: packMemberships } = await supabase
    .from('pack_memberships')
    .select('pack_id')
    .eq('user_id', user.id)

  const packIds = packMemberships?.map((m) => m.pack_id) || []

  // Get events (for now, show all verified events - later filter by pack)
  let query = supabase
    .from('events')
    .select(
      `
      *,
      impact_tracking:event_impact_tracking (
        initial_damage_score,
        current_damage_score,
        response_count
      )
    `
    )
    .eq('status', searchParams.status || 'verified')
    .not('published_at', 'is', null)
    .order('occurred_at', { ascending: false })
    .limit(20)

  const { data: events } = await query

  // Get active presence count for user's packs
  const presenceCounts: Record<string, number> = {}
  if (events && packIds.length > 0) {
    for (const event of events) {
      const { count } = await supabase
        .from('pack_presence')
        .select('*', { count: 'exact', head: true })
        .in('pack_id', packIds)
        .eq('event_id', event.id)
        .gt(
          'last_heartbeat_at',
          new Date(Date.now() - 5 * 60 * 1000).toISOString()
        )

      presenceCounts[event.id] = count || 0
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Events
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Verified events held by your community
              </p>
            </div>

            <a
              href="/dashboard"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calm reminder */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-8 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <span className="font-medium">You are not alone.</span> Each event has
            been carefully verified. Your Pack is holding these moments with you.
          </p>
        </div>

        {/* Filters */}
        <EventFilters currentStatus={searchParams.status} />

        {/* Events List */}
        {events && events.length > 0 ? (
          <div className="space-y-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                activePresenceCount={presenceCounts[event.id] || 0}
                showPresence={packIds.length > 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No events to show
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              There are currently no verified events. When important moments arise,
              they will appear here.
            </p>
            {packIds.length === 0 && (
              <a
                href="/dashboard"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Join a Pack to start
              </a>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
