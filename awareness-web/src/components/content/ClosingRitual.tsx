'use client'

/**
 * ClosingRitual Component
 * Guides users through a gentle transition when leaving heavy content
 * Helps acknowledge what they've held and return to daily life
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface ClosingRitualProps {
  eventTitle?: string
  onComplete?: () => void
  showReflectionOption?: boolean
}

type Step = 'breathe' | 'acknowledge' | 'choose' | 'complete'

export function ClosingRitual({
  eventTitle,
  onComplete,
  showReflectionOption = true,
}: ClosingRitualProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('breathe')
  const [breathCount, setBreathCount] = useState(0)

  const handleBreatheComplete = () => {
    setStep('acknowledge')
  }

  const handleAcknowledge = () => {
    setStep('choose')
  }

  const handleReflect = () => {
    setStep('complete')
    // Scroll to reflection section
    const reflectionSection = document.getElementById('reflection-space')
    if (reflectionSection) {
      reflectionSection.scrollIntoView({ behavior: 'smooth' })
    }
    onComplete?.()
  }

  const handleLeave = () => {
    setStep('complete')
    onComplete?.()
    // Navigate away after a moment
    setTimeout(() => {
      router.push('/dashboard')
    }, 500)
  }

  if (step === 'breathe') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full space-y-6 shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 text-center">
            Take a breath
          </h2>

          <div className="space-y-4 text-center">
            <p className="text-gray-700 dark:text-gray-300">
              You&apos;ve been present with difficult information.
            </p>

            <div className="py-8">
              <BreathingCircle onBreathComplete={() => setBreathCount((c) => c + 1)} />
            </div>

            {breathCount >= 3 && (
              <button
                onClick={handleBreatheComplete}
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-medium"
              >
                Continue
              </button>
            )}

            {breathCount < 3 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {breathCount}/3 breaths
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (step === 'acknowledge') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full space-y-6 shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Acknowledge what you&apos;ve held
          </h2>

          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              {eventTitle
                ? `You stayed present with "${eventTitle}".`
                : 'You stayed present with this event.'}
            </p>

            <p className="text-gray-700 dark:text-gray-300">
              Your attention is part of collective attention. By being present, you&apos;ve
              honored what happened.
            </p>

            <div className="pt-4">
              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400">
                &quot;Being present is enough.&quot;
              </blockquote>
            </div>
          </div>

          <button
            onClick={handleAcknowledge}
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-medium"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  if (step === 'choose') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full space-y-6 shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            What would help?
          </h2>

          <div className="space-y-3">
            {showReflectionOption && (
              <button
                onClick={handleReflect}
                className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    ✍️
                  </span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Reflect with my Pack
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Process what you&apos;re feeling with your community
                    </p>
                  </div>
                </div>
              </button>
            )}

            <button
              onClick={handleLeave}
              className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  🌿
                </span>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Return to daily life
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You can come back whenever you&apos;re ready
                  </p>
                </div>
              </div>
            </button>
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
            You don&apos;t need to hold this alone
          </p>
        </div>
      </div>
    )
  }

  return null
}

/**
 * Breathing Circle Animation
 * Guides user through breathing exercise
 */
function BreathingCircle({ onBreathComplete }: { onBreathComplete: () => void }) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [cycle, setCycle] = useState(0)

  // Breathing cycle: 4s inhale, 4s hold, 6s exhale
  useState(() => {
    const timer = setInterval(() => {
      setPhase((current) => {
        if (current === 'inhale') return 'hold'
        if (current === 'hold') return 'exhale'
        // Exhale complete - new cycle
        onBreathComplete()
        setCycle((c) => c + 1)
        return 'inhale'
      })
    }, phase === 'inhale' ? 4000 : phase === 'hold' ? 4000 : 6000)

    return () => clearInterval(timer)
  })

  const getInstructions = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe in...'
      case 'hold':
        return 'Hold...'
      case 'exhale':
        return 'Breathe out...'
    }
  }

  const getCircleSize = () => {
    switch (phase) {
      case 'inhale':
        return 'w-32 h-32'
      case 'hold':
        return 'w-32 h-32'
      case 'exhale':
        return 'w-20 h-20'
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <div
          className={`${getCircleSize()} rounded-full bg-blue-500/30 transition-all duration-[4000ms] ease-in-out`}
        />
      </div>
      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
        {getInstructions()}
      </p>
    </div>
  )
}

/**
 * Trigger button for closing ritual
 * Can be placed at the bottom of content pages
 */
export function ClosingRitualTrigger({
  eventTitle,
  className = '',
}: {
  eventTitle?: string
  className?: string
}) {
  const [showRitual, setShowRitual] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowRitual(true)}
        className={`px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors font-medium ${className}`}
      >
        I&apos;m ready to step away
      </button>

      {showRitual && (
        <ClosingRitual
          eventTitle={eventTitle}
          onComplete={() => setShowRitual(false)}
        />
      )}
    </>
  )
}
