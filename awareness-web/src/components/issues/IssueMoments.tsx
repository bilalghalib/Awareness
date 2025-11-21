import Link from 'next/link'
import { Event } from '@/types/database.types'
import { formatDistanceToNow } from 'date-fns'

/**
 * IssueMoments Component
 * Shows recent moments (events) within an ongoing issue
 * These are discrete happenings that trigger attention
 */

export function IssueMoments({
  moments,
  issueTitle,
}: {
  moments: (Event & { verifications: any; responses: any })[]
  issueTitle: string
}) {
  if (moments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No moments recorded yet for {issueTitle}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">📍</span>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Recent Moments
        </h2>
      </div>

      <p className="text-gray-600 dark:text-gray-400">
        Discrete events and developments within the ongoing {issueTitle}
      </p>

      <div className="space-y-3">
        {moments.map((moment) => (
          <Link
            key={moment.id}
            href={`/events/${moment.id}`}
            className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {moment.title}
                </h3>

                {moment.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {moment.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <span>📍</span>
                    <span>{moment.location}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span>🕒</span>
                    <span>
                      {formatDistanceToNow(new Date(moment.occurred_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {moment.verifications && moment.verifications.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span>✓</span>
                      <span>Verified</span>
                    </div>
                  )}

                  {moment.responses && moment.responses.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span>💙</span>
                      <span>
                        {Array.isArray(moment.responses)
                          ? moment.responses.length
                          : moment.responses}{' '}
                        response{Array.isArray(moment.responses) && moment.responses.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-2xl">→</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {moments.length} most recent moment{moments.length === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  )
}
