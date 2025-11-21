'use client'

/**
 * Reflection Space Component
 * FOR MAYA: Gentle space for emotional processing
 */

import { useState } from 'react'
import { useSupabase } from '@/hooks/useSupabase'
import { useRouter } from 'next/navigation'
import type { Reflection, Profile } from '@/types/database.types'

interface ReflectionSpaceProps {
  eventId: string
  packId?: string
  existingReflections: (Reflection & { author: Profile })[]
}

export function ReflectionSpace({
  eventId,
  packId,
  existingReflections,
}: ReflectionSpaceProps) {
  const supabase = useSupabase()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [emotions, setEmotions] = useState<string[]>([])
  const [intensity, setIntensity] = useState(3)
  const [visibility, setVisibility] = useState<'pack' | 'private'>('pack')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const emotionOptions = [
    'sadness',
    'anger',
    'fear',
    'hope',
    'connection',
    'helplessness',
    'determination',
    'grief',
  ]

  const handleToggleEmotion = (emotion: string) => {
    setEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('reflections').insert({
        event_id: eventId,
        user_id: user.id,
        content,
        emotions,
        emotional_intensity: intensity,
        visibility,
        pack_id: visibility === 'pack' ? packId : null,
      })

      if (error) throw error

      // Reset form
      setContent('')
      setEmotions([])
      setIntensity(3)
      setShowForm(false)

      // Refresh page to show new reflection
      router.refresh()
    } catch (error: any) {
      console.error('Error saving reflection:', error)
      alert('Failed to save reflection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          Reflections
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Take a moment to be with this. What's present for you?
        </p>
      </div>

      <div className="p-6">
        {/* Existing Reflections */}
        {existingReflections.length > 0 && (
          <div className="mb-6 space-y-4">
            {existingReflections.map((reflection) => (
              <div
                key={reflection.id}
                className="border-l-4 border-purple-300 dark:border-purple-700 pl-4 py-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {reflection.author.display_name || `@${reflection.author.username}`}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(reflection.created_at).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  {reflection.content}
                </p>
                {reflection.emotions && reflection.emotions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {reflection.emotions.map((emotion) => (
                      <span
                        key={emotion}
                        className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded"
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Reflection Button/Form */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            + Add your reflection
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Content */}
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="What are you feeling? What's present for you?"
              />
            </div>

            {/* Emotions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What emotions are you experiencing?
              </label>
              <div className="flex flex-wrap gap-2">
                {emotionOptions.map((emotion) => (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => handleToggleEmotion(emotion)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      emotions.includes(emotion)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Emotional intensity: {intensity}/5
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Share with:
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="pack"
                    checked={visibility === 'pack'}
                    onChange={(e) =>
                      setVisibility(e.target.value as 'pack' | 'private')
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    My Pack
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="private"
                    checked={visibility === 'private'}
                    onChange={(e) =>
                      setVisibility(e.target.value as 'pack' | 'private')
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Keep private
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading || !content}
                className="flex-1 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Share Reflection'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Gentle reminder */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            There's no right or wrong way to feel. This space is for you to process
            what comes up, with the support of your Pack.
          </p>
        </div>
      </div>
    </div>
  )
}
