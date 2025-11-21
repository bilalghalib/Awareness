import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { IssueHeader } from '@/components/issues/IssueHeader'
import { IssueUnderstanding } from '@/components/issues/IssueUnderstanding'
import { IssueMoments } from '@/components/issues/IssueMoments'
import { PackSensemaking } from '@/components/issues/PackSensemaking'
import { FollowIssueButton } from '@/components/issues/FollowIssueButton'

/**
 * Issue Page (Server Component)
 * Shows ongoing crisis/issue with sustained engagement
 * Examples: Gaza, Climate Crisis, Sudan Conflict
 */

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const supabase = await createClient()
  const { data: issue } = await supabase
    .from('issues')
    .select('title, description')
    .eq('slug', params.slug)
    .single()

  if (!issue) {
    return {
      title: 'Issue Not Found',
    }
  }

  return {
    title: `${issue.title} | Awareness`,
    description: issue.description,
  }
}

export default async function IssuePage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch issue with stats
  const { data: issue, error } = await supabase
    .from('issues_with_stats')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !issue) {
    notFound()
  }

  // Check if user is following this issue
  let isFollowing = false
  if (user) {
    const { data: follow } = await supabase
      .from('issue_followers')
      .select('id')
      .eq('issue_id', issue.id)
      .eq('user_id', user.id)
      .single()
    isFollowing = !!follow
  }

  // Get user's pack memberships
  const packIds: string[] = []
  if (user) {
    const { data: memberships } = await supabase
      .from('pack_memberships')
      .select('pack_id')
      .eq('user_id', user.id)

    packIds.push(...(memberships?.map((m) => m.pack_id) || []))
  }

  // Get recent moments within this issue
  const { data: moments } = await supabase
    .from('events')
    .select(
      `
      *,
      verifications(count),
      responses(count)
    `
    )
    .eq('issue_id', issue.id)
    .eq('status', 'verified')
    .order('occurred_at', { ascending: false })
    .limit(10)

  // Get Pack's focus on this issue (if user has packs)
  let packFocus = null
  if (packIds.length > 0) {
    const { data } = await supabase
      .from('pack_issue_focus')
      .select(
        `
        *,
        pack:packs(*)
      `
      )
      .in('pack_id', packIds)
      .eq('issue_id', issue.id)

    packFocus = data
  }

  // Get interpretations
  const { data: interpretations } = await supabase
    .from('interpretations')
    .select('*')
    .eq('issue_id', issue.id)
    .eq('verified', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Issue Header */}
      <IssueHeader
        issue={issue}
        isFollowing={isFollowing}
        followerCount={issue.follower_count}
        packCount={issue.pack_count}
        momentCount={issue.moment_count}
      />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Follow Button */}
        {user && (
          <div className="flex justify-end">
            <FollowIssueButton issueId={issue.id} initialFollowing={isFollowing} />
          </div>
        )}

        {/* What We Know / Don't Know */}
        <IssueUnderstanding
          whatWeKnow={issue.what_we_know}
          whatWeDontKnow={issue.what_we_dont_know}
          interpretations={interpretations || []}
        />

        {/* Recent Moments */}
        <IssueMoments moments={moments || []} issueTitle={issue.title} />

        {/* Pack Sensemaking (if user is in a pack) */}
        {packIds.length > 0 && (
          <PackSensemaking
            issueId={issue.id}
            packIds={packIds}
            packFocus={packFocus || []}
          />
        )}

        {/* Ongoing Campaigns */}
        {/* TODO: Add CollectiveActions component for issue-level campaigns */}
      </div>
    </div>
  )
}
