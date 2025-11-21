/**
 * Admin: Create Event Page
 * Quick tool for creating test events
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreateEventForm } from './create-event-form'

export default async function AdminEventsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Create Event
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Admin tool for testing
              </p>
            </div>
            <a
              href="/dashboard"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <CreateEventForm />
        </div>

        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> This is a temporary admin tool for Phase 2 testing.
            In production, events will be created through the verification workflow.
          </p>
        </div>
      </main>
    </div>
  )
}
