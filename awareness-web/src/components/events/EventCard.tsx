/**
 * Event Card Component
 * FOR MAYA: Gentle, informative card showing event with presence
 */

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { Event } from '@/types/database.types'

interface EventCardProps {
  event: Event & {
    impact_tracking?: {
      initial_damage_score: number
      current_damage_score: number
      response_count: number
    }[]
  }
  activePresenceCount?: number
  showPresence?: boolean
}

export function EventCard({
  event,
  activePresenceCount = 0,
  showPresence = false,
}: EventCardProps) {
  const impactTracking = event.impact_tracking?.[0]
  const healingPercentage = impactTracking
    ? Math.round(
        ((impactTracking.initial_damage_score - impactTracking.current_damage_score) /
          impactTracking.initial_damage_score) *
          100
      )
    : 0

  return (
    <Link href={`/events/${event.id}`}>
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              {event.title}
            </h2>
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
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

          {/* Verification Badge */}
          <div className="flex-shrink-0 ml-4">
            <div className="flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
              <svg
                className="w-4 h-4 mr-1"
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
              {event.verification_confidence_score > 0 && (
                <span className="ml-1">
                  ({Math.round(event.verification_confidence_score * 100)}%)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Pack Presence (if available) */}
        {showPresence && activePresenceCount > 0 && (
          <div className="flex items-center mb-4 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex -space-x-2 mr-3">
              {[...Array(Math.min(activePresenceCount, 3))].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-semibold"
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <span className="text-sm text-blue-900 dark:text-blue-100">
              <span className="font-medium">{activePresenceCount}</span>{' '}
              {activePresenceCount === 1 ? 'person is' : 'people are'} present
              with this event
            </span>
          </div>
        )}

        {/* Impact & Response Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Casualties */}
          {event.estimated_casualties && (
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Impact
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {event.estimated_casualties.killed
                  ? `${event.estimated_casualties.killed} killed`
                  : event.estimated_casualties.injured
                  ? `${event.estimated_casualties.injured} injured`
                  : event.estimated_casualties.displaced
                  ? `${event.estimated_casualties.displaced} displaced`
                  : 'Monitoring'}
              </div>
            </div>
          )}

          {/* Responses */}
          {impactTracking && (
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Responses
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {impactTracking.response_count}{' '}
                {impactTracking.response_count === 1 ? 'action' : 'actions'}
              </div>
            </div>
          )}

          {/* Healing */}
          {healingPercentage > 0 && (
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Healing
              </div>
              <div className="flex items-center">
                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                  {healingPercentage}%
                </div>
                <svg
                  className="w-4 h-4 ml-1 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Verification Trail Preview */}
        {event.verification_trail && event.verification_trail.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Verification: {event.verification_trail.length} steps taken
            </div>
          </div>
        )}
      </article>
    </Link>
  )
}
