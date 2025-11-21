/**
 * Dashboard Page
 * Main landing page after authentication
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's pack memberships
  const { data: packs } = await supabase
    .from('pack_memberships')
    .select(`
      *,
      pack:packs (
        id,
        name,
        description,
        current_member_count
      )
    `)
    .eq('user_id', user.id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                @{profile?.username}
              </p>
            </div>

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pack Memberships */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Packs
          </h2>

          {packs && packs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {packs.map((membership) => (
                <div
                  key={membership.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {membership.pack?.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {membership.pack?.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      {membership.pack?.current_member_count} members
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                      {membership.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                You haven't joined any Packs yet.
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Find a Pack
              </button>
            </div>
          )}
        </div>

        {/* Getting Started Guide */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Getting Started with Awareness
          </h2>

          <div className="space-y-3">
            <Step
              number={1}
              title="Join a Pack"
              description="Connect with a geographic community synchronized for collective response"
              completed={packs && packs.length > 0}
            />
            <Step
              number={2}
              title="Set your timezone"
              description="Help us coordinate your Pack's synchronous moments"
              completed={!!profile?.timezone}
            />
            <Step
              number={3}
              title="Configure notifications"
              description="Choose how you want to be alerted to important events"
              completed={false}
            />
            <Step
              number={4}
              title="Explore roles"
              description="Decide if you want to be a Validator, Kindness First Responder, or Aware Witness"
              completed={profile?.roles && profile.roles.length > 1}
            />
          </div>
        </div>

        {/* Role Information */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <RoleCard
            title="Aware Witness"
            description="Stay informed without overwhelm. Offer sustained attention to what truly matters."
            icon="👁️"
            isActive={profile?.roles?.includes('member')}
          />
          <RoleCard
            title="Validator"
            description="Verify events and create trustworthy ground. Help others stay open-hearted while staying informed."
            icon="🔍"
            isActive={profile?.roles?.includes('validator')}
          />
          <RoleCard
            title="Kindness First Responder"
            description="Transform awareness into coordinated action. Build tangible connection across distance."
            icon="🤝"
            isActive={profile?.roles?.includes('kindness_responder')}
          />
        </div>
      </main>
    </div>
  )
}

function Step({
  number,
  title,
  description,
  completed,
}: {
  number: number
  title: string
  description: string
  completed: boolean
}) {
  return (
    <div className="flex items-start space-x-3">
      <div
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
          completed
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}
      >
        {completed ? '✓' : number}
      </div>
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  )
}

function RoleCard({
  title,
  description,
  icon,
  isActive,
}: {
  title: string
  description: string
  icon: string
  isActive: boolean
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-6 border-2 transition-all ${
        isActive
          ? 'border-blue-500 shadow-lg'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      {!isActive && (
        <button className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Become a {title} →
        </button>
      )}
    </div>
  )
}
