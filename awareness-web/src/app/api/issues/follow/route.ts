import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/issues/follow
 * Follow an issue
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { issue_id, notify_on_moments = true, notify_on_campaigns = true } = body

    if (!issue_id) {
      return NextResponse.json({ error: 'issue_id is required' }, { status: 400 })
    }

    // Create follow relationship
    const { data, error } = await supabase
      .from('issue_followers')
      .insert({
        issue_id,
        user_id: user.id,
        notify_on_moments,
        notify_on_campaigns,
      })
      .select()
      .single()

    if (error) {
      console.error('Error following issue:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ follow: data })
  } catch (error) {
    console.error('Error in follow endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/issues/follow
 * Unfollow an issue
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { issue_id } = body

    if (!issue_id) {
      return NextResponse.json({ error: 'issue_id is required' }, { status: 400 })
    }

    // Delete follow relationship
    const { error } = await supabase
      .from('issue_followers')
      .delete()
      .eq('issue_id', issue_id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error unfollowing issue:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in unfollow endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
