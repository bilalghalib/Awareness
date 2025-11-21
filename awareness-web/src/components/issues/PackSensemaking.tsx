'use client'

/**
 * PackSensemaking Component
 * Space for Pack members to discuss what an issue means
 * Multiple perspectives can coexist - no forced consensus
 */

import { useState } from 'react'
import { PackIssueFocus } from '@/types/database.types'

export function PackSensemaking({
  issueId,
  packIds,
  packFocus,
}: {
  issueId: string
  packIds: string[]
  packFocus: any[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    question: 'What does this mean for us?',
    interpretation: '',
    reasoning: '',
    actions_suggested: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // For now, we'll show a simplified version since we don't have sensemaking entries yet
  // In a full implementation, we'd fetch and display existing entries

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Parse actions if provided
      const actions = formData.actions_suggested
        ? formData.actions_suggested.split('\n').filter((a) => a.trim())
        : []

      const response = await fetch('/api/sensemaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue_id: issueId,
          pack_id: packIds[0], // Use first pack for now
          question: formData.question,
          interpretation: formData.interpretation,
          reasoning: formData.reasoning || undefined,
          actions_suggested: actions.length > 0 ? actions : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save sensemaking entry')
      }

      // Reset form
      setFormData({
        question: 'What does this mean for us?',
        interpretation: '',
        reasoning: '',
        actions_suggested: '',
      })
      setShowForm(false)

      // Reload the page to show new entry
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (packIds.length === 0) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💭</span>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Pack Sensemaking
        </h2>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Discuss with your Pack what this issue means and how you want to respond. Multiple
        viewpoints can coexist - there&apos;s no pressure to reach consensus.
      </p>

      {/* Show focused packs */}
      {packFocus.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Your Pack is focusing on this issue:
          </p>
          {packFocus.map((focus: any) => (
            <div key={focus.id} className="flex items-center gap-2 text-sm">
              <span className="text-lg">🎒</span>
              <span className="text-gray-700 dark:text-gray-300">
                {focus.pack?.name || 'Your Pack'}
              </span>
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded text-xs capitalize">
                {focus.priority} focus
              </span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded text-sm">
          {error}
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          + Share your perspective
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your interpretation *
            </label>
            <textarea
              value={formData.interpretation}
              onChange={(e) =>
                setFormData({ ...formData, interpretation: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="What does this mean to you? How do you understand this issue?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reasoning (optional)
            </label>
            <textarea
              value={formData.reasoning}
              onChange={(e) => setFormData({ ...formData, reasoning: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Why do you see it this way?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Suggested actions (optional, one per line)
            </label>
            <textarea
              value={formData.actions_suggested}
              onChange={(e) =>
                setFormData({ ...formData, actions_suggested: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="What could we do in response?"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Sharing...' : 'Share perspective'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Note:</strong> Your Pack members can see and respond to your perspective.
          It&apos;s okay to disagree - the goal is shared understanding, not forced
          consensus.
        </p>
      </div>
    </div>
  )
}
