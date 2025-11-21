/**
 * Verification Trail Component
 * FOR SARA: Shows the investigation process transparently
 * FOR MAYA: Builds trust that someone checked carefully
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { InvestigationStep, Verification } from '@/types/database.types'
import { CheckCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid'

interface VerificationTrailProps {
  steps: InvestigationStep[]
  verifications: Verification[]
  confidenceScore: number
}

export function VerificationTrail({
  steps,
  verifications,
  confidenceScore,
}: VerificationTrailProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with confidence score */}
      <div className="bg-green-50 dark:bg-green-900/20 px-6 py-4 border-b border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                Verified
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                {verifications.length} validator{verifications.length !== 1 && 's'} reviewed this
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {Math.round(confidenceScore * 100)}%
            </div>
            <div className="text-xs text-green-700 dark:text-green-300">
              Confidence
            </div>
          </div>
        </div>
      </div>

      {/* Investigation steps timeline */}
      <div className="px-6 py-6">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
          Investigation Process
        </h4>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Timeline connector */}
              {index < steps.length - 1 && (
                <div className="absolute left-3 top-8 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
              )}

              {/* Step card */}
              <div className="relative pl-10">
                {/* Step number */}
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-semibold flex items-center justify-center">
                  {step.step}
                </div>

                {/* Step content */}
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    setExpandedStep(expandedStep === step.step ? null : step.step)
                  }
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {formatStepAction(step.action)}
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatTimestamp(step.timestamp)}
                  </div>

                  {/* Expandable details */}
                  <AnimatePresence>
                    {expandedStep === step.step && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700"
                      >
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {step.details}
                        </p>

                        {step.sources && step.sources.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                              Sources
                            </div>
                            <ul className="space-y-1">
                              {step.sources.map((source, idx) => (
                                <li key={idx}>
                                  <a
                                    href={source}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    {truncateUrl(source)}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Multiple validators section */}
      {verifications.length > 1 && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
              <span>View all validator assessments ({verifications.length})</span>
              <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
            </summary>

            <div className="mt-4 space-y-3">
              {verifications.map((verification) => (
                <div
                  key={verification.id}
                  className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      @{verification.validator.username}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${getVoteBadgeClass(verification.vote)}`}>
                        {verification.vote}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {verification.confidence_level}/5 confidence
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {verification.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

// Utility functions

function formatStepAction(action: string): string {
  const actionMap: Record<string, string> = {
    checked_original_source: 'Checked original source',
    cross_referenced_news: 'Cross-referenced with news outlets',
    verified_image_metadata: 'Verified image metadata',
    contacted_local_sources: 'Contacted local sources',
    checked_historical_data: 'Checked historical patterns',
  }

  return actionMap[action] || action.replace(/_/g, ' ')
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minutes ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hours ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url
  return url.substring(0, maxLength) + '...'
}

function getVoteBadgeClass(vote: string): string {
  switch (vote) {
    case 'valid':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
    case 'invalid':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
    case 'unsure':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
    case 'needs_more_info':
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }
}
