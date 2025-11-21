import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/sensemaking
 * Create a sensemaking entry (Pack interpretation of an issue)
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
    const { issue_id, pack_id, question, interpretation, reasoning, actions_suggested } =
      body

    if (!issue_id || !pack_id || !question || !interpretation) {
      return NextResponse.json(
        { error: 'issue_id, pack_id, question, and interpretation are required' },
        { status: 400 }
      )
    }

    // Verify user is a member of the pack
    const { data: membership } = await supabase
      .from('pack_memberships')
      .select('id')
      .eq('pack_id', pack_id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'You must be a member of this Pack to add sensemaking entries' },
        { status: 403 }
      )
    }

    // Create sensemaking entry
    const { data, error } = await supabase
      .from('sensemaking_entries')
      .insert({
        issue_id,
        pack_id,
        user_id: user.id,
        question,
        interpretation,
        reasoning: reasoning || null,
        actions_suggested: actions_suggested || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating sensemaking entry:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ entry: data })
  } catch (error) {
    console.error('Error in sensemaking endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/sensemaking?issue_id=xxx&pack_id=xxx
 * Get sensemaking entries for an issue and pack
 */
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const issue_id = searchParams.get('issue_id')
    const pack_id = searchParams.get('pack_id')

    if (!issue_id || !pack_id) {
      return NextResponse.json(
        { error: 'issue_id and pack_id are required' },
        { status: 400 }
      )
    }

    // Verify user is a member of the pack
    const { data: membership } = await supabase
      .from('pack_memberships')
      .select('id')
      .eq('pack_id', pack_id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'You must be a member of this Pack to view sensemaking entries' },
        { status: 403 }
      )
    }

    // Fetch sensemaking entries with author profiles
    const { data, error } = await supabase
      .from('sensemaking_entries')
      .select(
        `
        *,
        author:profiles(id, username, display_name, avatar_url)
      `
      )
      .eq('issue_id', issue_id)
      .eq('pack_id', pack_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sensemaking entries:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ entries: data })
  } catch (error) {
    console.error('Error in sensemaking GET endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
