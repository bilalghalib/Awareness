'use client'

/**
 * FollowIssueButton Component
 * Allows users to follow/unfollow an issue
 */

import { useState } from 'react'

export function FollowIssueButton({
  issueId,
  initialFollowing,
}: {
  issueId: string
  initialFollowing: boolean
}) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  const handleToggleFollow = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/issues/follow', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_id: issueId }),
      })

      if (!response.ok) {
        throw new Error('Failed to update follow status')
      }

      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`px-6 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
        isFollowing
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500'
          : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
      }`}
    >
      {loading ? '...' : isFollowing ? 'Following' : '+ Follow Issue'}
    </button>
  )
}
