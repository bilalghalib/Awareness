import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/user-engagement?issue_id=xxx
 * Get user's engagement with levels for an issue
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

    if (!issue_id) {
      return NextResponse.json({ error: 'issue_id is required' }, { status: 400 })
    }

    // Fetch user's engagement with all levels for this issue
    const { data, error } = await supabase
      .from('user_level_engagement')
      .select('*')
      .eq('user_id', user.id)
      .eq('issue_id', issue_id)

    if (error) {
      console.error('Error fetching user engagement:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ engagement: data })
  } catch (error) {
    console.error('Error in GET user engagement endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/user-engagement
 * Update user's engagement with a level (save notes, commitments)
 */
export async function PATCH(request: Request) {
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
    const {
      issue_id,
      level,
      my_implication_notes,
      my_action_commitments,
      shared_with_pack,
      pack_id,
    } = body

    if (!issue_id || !level) {
      return NextResponse.json(
        { error: 'issue_id and level are required' },
        { status: 400 }
      )
    }

    // If sharing with pack, verify membership
    if (shared_with_pack && pack_id) {
      const { data: membership } = await supabase
        .from('pack_memberships')
        .select('id')
        .eq('pack_id', pack_id)
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        return NextResponse.json(
          { error: 'You must be a Pack member to share with Pack' },
          { status: 403 }
        )
      }
    }

    // Upsert engagement record
    const { data, error } = await supabase
      .from('user_level_engagement')
      .upsert(
        {
          user_id: user.id,
          issue_id,
          level,
          my_implication_notes: my_implication_notes || null,
          my_action_commitments: my_action_commitments || null,
          shared_with_pack: shared_with_pack || false,
          pack_id: pack_id || null,
          last_engaged_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,issue_id,level',
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error updating user engagement:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ engagement: data })
  } catch (error) {
    console.error('Error in PATCH user engagement endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/user-engagement/track-view
 * Record that user viewed a specific level (lightweight tracking)
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
    const { issue_id, level } = body

    if (!issue_id || !level) {
      return NextResponse.json(
        { error: 'issue_id and level are required' },
        { status: 400 }
      )
    }

    // Upsert to track view (creates record if doesn't exist)
    const { data, error } = await supabase
      .from('user_level_engagement')
      .upsert(
        {
          user_id: user.id,
          issue_id,
          level,
          last_engaged_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,issue_id,level',
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error tracking level view:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ engagement: data })
  } catch (error) {
    console.error('Error in POST track view endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
