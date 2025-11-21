'use client'

/**
 * IssueUnderstanding Component
 * Shows verified facts, unknowns, and multiple interpretations
 * Implements "no single truth" principle - shows range of perspectives
 */

import { useState } from 'react'
import { Interpretation } from '@/types/database.types'

export function IssueUnderstanding({
  whatWeKnow,
  whatWeDontKnow,
  interpretations,
}: {
  whatWeKnow: string | null
  whatWeDontKnow: string | null
  interpretations: Interpretation[]
}) {
  const [showInterpretations, setShowInterpretations] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 space-y-6">
        {/* What We Know */}
        {whatWeKnow && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">✓</span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                What We Know (Verified Facts)
              </h2>
            </div>
            <div className="pl-9">
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {whatWeKnow}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* What We Don't Know */}
        {whatWeDontKnow && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">?</span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                What We Don&apos;t Know
              </h2>
            </div>
            <div className="pl-9">
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {whatWeDontKnow}
                </div>
              </div>
              <p className="text-sm italic text-gray-600 dark:text-gray-400 mt-3">
                Awareness is honest about uncertainty. These are open questions that require
                more information or time.
              </p>
            </div>
          </div>
        )}

        {/* Multiple Interpretations */}
        {interpretations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">💭</span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                What It Means (Multiple Perspectives)
              </h2>
            </div>

            <div className="pl-9 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Different people and organizations interpret these facts differently.
                Awareness shows verified facts above, and presents a range of interpretations
                here. No single platform position.
              </p>

              <button
                onClick={() => setShowInterpretations(!showInterpretations)}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                {showInterpretations
                  ? '− Hide interpretations'
                  : `+ Show ${interpretations.length} interpretation${interpretations.length === 1 ? '' : 's'}`}
              </button>

              {showInterpretations && (
                <div className="space-y-4 mt-4">
                  {interpretations.map((interp) => (
                    <div
                      key={interp.id}
                      className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          {interp.source_name && (
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {interp.source_name}
                            </div>
                          )}
                          {interp.perspective_type && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {interp.perspective_type}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        "{interp.interpretation_text}"
                      </p>
                      {interp.source_url && (
                        <a
                          href={interp.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Source →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showInterpretations && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Your Pack&apos;s sensemaking:</strong> Below, you can discuss with
                  your Pack what this means to you and how you want to respond. Multiple
                  viewpoints can coexist.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
