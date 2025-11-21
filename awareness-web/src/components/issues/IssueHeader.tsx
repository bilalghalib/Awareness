import { IssueWithStats } from '@/types/database.types'
import { formatDistanceToNow } from 'date-fns'

/**
 * IssueHeader Component
 * Shows issue title, status, and key stats
 */

export function IssueHeader({
  issue,
  isFollowing,
  followerCount,
  packCount,
  momentCount,
}: {
  issue: IssueWithStats
  isFollowing: boolean
  followerCount: number
  packCount: number
  momentCount: number
}) {
  const getStatusColor = () => {
    switch (issue.current_status) {
      case 'active':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'monitoring':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'escalating':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    }
  }

  const getTypeColor = () => {
    switch (issue.type) {
      case 'humanitarian':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'environmental':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'systemic':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'political':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
      case 'economic':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Type and Status badges */}
        <div className="flex gap-2 mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor()}`}
          >
            {issue.type}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor()}`}
          >
            {issue.current_status}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {issue.title}
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          {issue.description}
        </p>

        {/* Timeline */}
        {issue.started_at && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Ongoing since{' '}
            {new Date(issue.started_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {issue.started_at && (
              <span className="ml-2">
                ({formatDistanceToNow(new Date(issue.started_at), { addSuffix: true })})
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {followerCount.toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Following</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xl">🎒</span>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {packCount}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Packs Focused</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xl">📍</span>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {momentCount}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Moments</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
