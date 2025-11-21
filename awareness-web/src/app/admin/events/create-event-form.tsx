'use client'

/**
 * Create Event/Moment Form Component
 * Client component for creating test events (or moments within issues)
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function CreateEventForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [issues, setIssues] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    occurred_at: new Date().toISOString().slice(0, 16),
    status: 'verified',
    initial_damage_score: 70,
    issue_id: '',
    content_tier: '1',
    has_graphic_content: false,
    content_warnings: '',
  })

  // Fetch available issues
  useEffect(() => {
    async function fetchIssues() {
      try {
        const response = await fetch('/api/issues')
        if (response.ok) {
          const data = await response.json()
          setIssues(data.issues || [])
        }
      } catch (err) {
        console.error('Error fetching issues:', err)
      }
    }
    fetchIssues()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create event')
      }

      const { event } = await response.json()

      // Redirect to the new event
      router.push(`/events/${event.id}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="e.g., Earthquake in Southern Turkey"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Provide details about the event..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Location *
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="e.g., Hatay Province, Turkey"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Occurred At *
        </label>
        <input
          type="datetime-local"
          value={formData.occurred_at}
          onChange={(e) =>
            setFormData({ ...formData, occurred_at: e.target.value })
          }
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="verified">Verified</option>
          <option value="validating">Validating</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Initial Damage Score (0-100)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={formData.initial_damage_score}
          onChange={(e) =>
            setFormData({
              ...formData,
              initial_damage_score: parseInt(e.target.value),
            })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Higher = greater impact (will decrease as responses are added)
        </p>
      </div>

      {/* Issue Selection (converts event to "moment" within issue) */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Moment within Issue (Optional)
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Related Issue
          </label>
          <select
            value={formData.issue_id}
            onChange={(e) => setFormData({ ...formData, issue_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">None (standalone event)</option>
            {issues.map((issue) => (
              <option key={issue.id} value={issue.id}>
                {issue.title}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            If this event is part of an ongoing issue (e.g., Gaza, Climate), select it here
          </p>
        </div>
      </div>

      {/* Content Protection */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Content Protection
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content Tier
            </label>
            <select
              value={formData.content_tier}
              onChange={(e) => setFormData({ ...formData, content_tier: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="1">Tier 1: Awareness (dignity-preserving only)</option>
              <option value="2">Tier 2: Understanding (context, no graphic)</option>
              <option value="3">Tier 3: Evidence (validators only, may be graphic)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Tier 1 is safest for witnesses. Tier 3 for validator evidence only.
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.has_graphic_content}
                onChange={(e) =>
                  setFormData({ ...formData, has_graphic_content: e.target.checked })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Contains graphic content
              </span>
            </label>
            <p className="mt-1 ml-6 text-xs text-gray-500 dark:text-gray-400">
              Check if this event includes potentially disturbing material
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content Warnings (comma-separated)
            </label>
            <input
              type="text"
              value={formData.content_warnings}
              onChange={(e) =>
                setFormData({ ...formData, content_warnings: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Loss of life, Structural damage, Displacement"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Specific warnings to show users before viewing content
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Creating...' : formData.issue_id ? 'Create Moment' : 'Create Event'}
      </button>
    </form>
  )
}
