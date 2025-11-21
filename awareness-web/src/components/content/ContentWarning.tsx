'use client'

/**
 * ContentWarning Component
 * Shows warnings before displaying content based on content tier
 * Implements the dignity-preserving content protection framework
 */

import { useState, useEffect } from 'react'
import { ContentTier } from '@/types/database.types'

export interface ContentWarningProps {
  level: 'mild' | 'moderate' | 'severe'
  contentTier: ContentTier
  warnings?: string[]
  children: React.ReactNode
  eventId?: string
  onConsent?: () => void
  autoShow?: boolean // For Tier 1 content (always safe)
}

export function ContentWarning({
  level,
  contentTier,
  warnings = [],
  children,
  eventId,
  onConsent,
  autoShow = false,
}: ContentWarningProps) {
  const [hasConsented, setHasConsented] = useState(autoShow)
  const [sessionChoices, setSessionChoices] = useState<Record<string, boolean>>({})

  // Check if user previously consented this session
  useEffect(() => {
    if (eventId && typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('content-warnings')
      if (stored) {
        const choices = JSON.parse(stored)
        if (choices[eventId]) {
          setHasConsented(true)
        }
      }
    }
  }, [eventId])

  const handleConsent = () => {
    setHasConsented(true)

    // Store choice in session storage
    if (eventId && typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('content-warnings')
      const choices = stored ? JSON.parse(stored) : {}
      choices[eventId] = true
      sessionStorage.setItem('content-warnings', JSON.stringify(choices))
    }

    onConsent?.()
  }

  const handleMinimize = () => {
    setHasConsented(false)

    // Remove from session storage
    if (eventId && typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('content-warnings')
      if (stored) {
        const choices = JSON.parse(stored)
        delete choices[eventId]
        sessionStorage.setItem('content-warnings', JSON.stringify(choices))
      }
    }
  }

  // If already consented, show content with option to minimize
  if (hasConsented) {
    return (
      <div className="relative">
        {children}
        {!autoShow && (
          <button
            onClick={handleMinimize}
            className="absolute top-2 right-2 px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Minimize
          </button>
        )}
      </div>
    )
  }

  // Determine warning styling based on level
  const warningStyles = {
    mild: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'ℹ️',
      title: 'Information',
    },
    moderate: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: '⚠️',
      title: 'Content Notice',
    },
    severe: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: '⚠️',
      title: 'Content Warning',
    },
  }

  const style = warningStyles[level]

  // Get tier-specific messaging
  const getTierMessage = () => {
    switch (contentTier) {
      case ContentTier.Awareness:
        return 'This content uses dignity-preserving imagery only.'
      case ContentTier.Understanding:
        return 'This content provides context and background. No graphic imagery.'
      case ContentTier.Evidence:
        return 'This content is for validators and may include difficult material.'
    }
  }

  return (
    <div
      className={`${style.bg} border ${style.border} rounded-lg p-6 space-y-4`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{style.icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
            {style.title}
          </h3>

          <div className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {getTierMessage()}
            </p>

            {warnings.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  This content involves:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {warnings.map((warning, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm italic text-gray-600 dark:text-gray-400">
                Being informed doesn&apos;t require seeing everything. You can choose how
                you engage.
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleConsent}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm font-medium"
            >
              I understand, show content
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors text-sm font-medium"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Wrapper component that automatically determines warning level
 * based on content tier and warnings
 */
export function AutoContentWarning({
  contentTier,
  warnings = [],
  children,
  eventId,
}: {
  contentTier: ContentTier
  warnings?: string[]
  children: React.ReactNode
  eventId?: string
}) {
  // Tier 1 (Awareness) - no warning needed, always safe
  if (contentTier === ContentTier.Awareness) {
    return <>{children}</>
  }

  // Tier 2 (Understanding) - mild warning
  if (contentTier === ContentTier.Understanding) {
    return (
      <ContentWarning
        level="mild"
        contentTier={contentTier}
        warnings={warnings}
        eventId={eventId}
      >
        {children}
      </ContentWarning>
    )
  }

  // Tier 3 (Evidence) - severe warning
  return (
    <ContentWarning
      level="severe"
      contentTier={contentTier}
      warnings={warnings}
      eventId={eventId}
    >
      {children}
    </ContentWarning>
  )
}
