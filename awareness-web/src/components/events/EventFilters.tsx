'use client'

/**
 * Event Filters Component
 * Simple status filter for events
 */

import { useRouter, useSearchParams } from 'next/navigation'

interface EventFiltersProps {
  currentStatus?: string
}

export function EventFilters({ currentStatus = 'verified' }: EventFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const statuses = [
    { value: 'verified', label: 'Verified', color: 'green' },
    { value: 'validating', label: 'Being Verified', color: 'yellow' },
    { value: 'pending', label: 'Pending', color: 'gray' },
  ]

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('status', status)
    router.push(`/events?${params.toString()}`)
  }

  return (
    <div className="mb-6">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
        {statuses.map((status) => (
          <button
            key={status.value}
            onClick={() => handleStatusChange(status.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentStatus === status.value
                ? status.color === 'green'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  : status.color === 'yellow'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>
    </div>
  )
}
