'use client'

/**
 * Levels of Implication Component
 * Shows "How am I implicated?" and "What can I do?" across six scales
 * Individual → Family → Community → Culture → Country → Systemic
 */

import { useState } from 'react'
import { ImplicationLevel, ImplicationLevelRecord, LevelAction } from '@/types/database.types'

const LEVEL_CONFIG = {
  individual: {
    icon: '👤',
    title: 'Individual',
    description: 'Personal choices, daily life, consumption',
    color: 'blue',
  },
  family: {
    icon: '👨‍👩‍👧‍👦',
    title: 'Family',
    description: 'Household, investments, intergenerational',
    color: 'purple',
  },
  community: {
    icon: '🏘️',
    title: 'Community',
    description: 'Local organizing, institutions, infrastructure',
    color: 'green',
  },
  culture: {
    icon: '🎭',
    title: 'Culture',
    description: 'Identity, traditions, narratives, art',
    color: 'orange',
  },
  country: {
    icon: '🏛️',
    title: 'Country',
    description: 'Political action, voting, national policy',
    color: 'red',
  },
  systemic: {
    icon: '🌍',
    title: 'Global/Systemic',
    description: 'Capitalism, colonialism, structural change',
    color: 'indigo',
  },
}

interface LevelsOfImplicationProps {
  issueId: string
  issueTitle: string
  levels: (ImplicationLevelRecord & { actions?: LevelAction[] })[]
}

export function LevelsOfImplication({
  issueId,
  issueTitle,
  levels,
}: LevelsOfImplicationProps) {
  const [activeLevel, setActiveLevel] = useState<ImplicationLevel>(
    ImplicationLevel.Individual
  )

  // Sort levels by display_order
  const sortedLevels = [...levels].sort((a, b) => a.display_order - b.display_order)

  const currentLevel = sortedLevels.find((l) => l.level === activeLevel)

  if (sortedLevels.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Levels of Implication are being developed for {issueTitle}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🎯</span>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Levels of Implication
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Understand how you&apos;re implicated and what you can do at different scales
        </p>
      </div>

      {/* Level Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex">
          {sortedLevels.map((level) => {
            const config = LEVEL_CONFIG[level.level]
            const isActive = level.level === activeLevel

            return (
              <button
                key={level.id}
                onClick={() => setActiveLevel(level.level)}
                className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  isActive
                    ? `border-${config.color}-500 bg-${config.color}-50 dark:bg-${config.color}-900/20 text-${config.color}-700 dark:text-${config.color}-300`
                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl">{config.icon}</span>
                  <span>{config.title}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Level Content */}
      {currentLevel && (
        <div className="p-6 space-y-6">
          {/* Level Description */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <span className="text-3xl">
              {LEVEL_CONFIG[currentLevel.level].icon}
            </span>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
                {LEVEL_CONFIG[currentLevel.level].title} Level
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {LEVEL_CONFIG[currentLevel.level].description}
              </p>
            </div>
          </div>

          {/* How am I implicated? */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span>❓</span>
              How am I implicated?
            </h3>
            <div className="space-y-3">
              <p className="text-gray-700 dark:text-gray-300">
                {currentLevel.implication_prompt}
              </p>
              {currentLevel.implication_description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentLevel.implication_description}
                </p>
              )}
              {currentLevel.implication_examples &&
                currentLevel.implication_examples.length > 0 && (
                  <div className="pl-4 border-l-2 border-gray-300 dark:border-gray-600 space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Examples:
                    </p>
                    <ul className="space-y-1">
                      {currentLevel.implication_examples.map((example, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                        >
                          <span className="mt-1">•</span>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>

          {/* What can I do? */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span>✊</span>
              What can I do?
            </h3>

            {currentLevel.action_description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {currentLevel.action_description}
              </p>
            )}

            {/* Actions List */}
            {currentLevel.actions && currentLevel.actions.length > 0 ? (
              <div className="space-y-3">
                {currentLevel.actions.map((action) => (
                  <LevelActionCard key={action.id} action={action} />
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Actions are being developed for this level
                </p>
              </div>
            )}
          </div>

          {/* Reflection Space */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Your reflection
            </h4>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="How are you implicated at this level? What commitments are you making?"
            />
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                id="share-with-pack"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="share-with-pack">Share with my Pack</label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Individual Action Card
 */
function LevelActionCard({ action }: { action: LevelAction }) {
  const [expanded, setExpanded] = useState(false)

  const getDifficultyColor = () => {
    switch (action.difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'challenging':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'requires_commitment':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    }
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              {action.title}
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className={`px-2 py-1 rounded ${getDifficultyColor()}`}>
                {action.difficulty.replace('_', ' ')}
              </span>
              {action.time_commitment && (
                <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  ⏱ {action.time_commitment}
                </span>
              )}
              {action.times_taken > 0 && (
                <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  ✓ {action.times_taken} completed
                </span>
              )}
            </div>
          </div>
          <span className="text-gray-400">{expanded ? '−' : '+'}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {action.description}
          </p>

          {/* Resources */}
          {action.resources && (
            <div className="space-y-2">
              {action.resources.links && action.resources.links.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resources:
                  </p>
                  <ul className="space-y-1">
                    {action.resources.links.map((link, i) => (
                      <li key={i}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {link.title} →
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {action.resources.guides && action.resources.guides.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Guides:
                  </p>
                  <ul className="space-y-1">
                    {action.resources.guides.map((guide, i) => (
                      <li key={i}>
                        <a
                          href={guide.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {guide.title} →
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm font-medium">
              I did this
            </button>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium">
              Save for later
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
