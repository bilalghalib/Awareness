/**
 * Impact Visualization Component
 * Shows the "healing" effect of collective responses
 */

interface ImpactVisualizationProps {
  initialDamage: number
  currentDamage: number
  responseCount: number
}

export function ImpactVisualization({
  initialDamage,
  currentDamage,
  responseCount,
}: ImpactVisualizationProps) {
  const healingPercentage = Math.round(
    ((initialDamage - currentDamage) / initialDamage) * 100
  )
  const currentPercentage = Math.round((currentDamage / 100) * 100)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Collective Response Impact
      </h2>

      <div className="space-y-6">
        {/* Visual Bar */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">
              Impact remaining
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {currentPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div className="relative h-full">
              {/* Healing (green) portion */}
              <div
                className="absolute left-0 h-full bg-green-500 transition-all duration-500"
                style={{ width: `${healingPercentage}%` }}
              />
              {/* Remaining damage (red) portion */}
              <div
                className="absolute right-0 h-full bg-red-500 transition-all duration-500"
                style={{ width: `${currentPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {responseCount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">
              Responses
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {healingPercentage}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">
              Healing
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {Math.round(initialDamage - currentDamage)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">
              Points Healed
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Each response from your Pack reduces the impact score. When we act
            together, we transform collective awareness into collective healing.
          </p>
        </div>
      </div>
    </div>
  )
}
