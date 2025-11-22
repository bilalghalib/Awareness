import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/action-completions
 * Record that a user completed an action
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
    const {
      level_action_id,
      reflection,
      rating,
      would_recommend,
      completed_with_pack,
      pack_id,
      coordinated_with_user_ids,
      proof_url,
      proof_image_url,
    } = body

    if (!level_action_id) {
      return NextResponse.json(
        { error: 'level_action_id is required' },
        { status: 400 }
      )
    }

    // If completed with pack, verify user is a member
    if (completed_with_pack && pack_id) {
      const { data: membership } = await supabase
        .from('pack_memberships')
        .select('id')
        .eq('pack_id', pack_id)
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        return NextResponse.json(
          { error: 'You must be a member of this Pack' },
          { status: 403 }
        )
      }
    }

    // Create the completion
    const { data, error } = await supabase
      .from('action_completions')
      .insert({
        user_id: user.id,
        level_action_id,
        reflection: reflection || null,
        rating: rating || null,
        would_recommend: would_recommend || null,
        completed_with_pack: completed_with_pack || false,
        pack_id: pack_id || null,
        coordinated_with_user_ids: coordinated_with_user_ids || null,
        proof_url: proof_url || null,
        proof_image_url: proof_image_url || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating action completion:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Note: Triggers will automatically update action stats and user engagement

    return NextResponse.json({ completion: data })
  } catch (error) {
    console.error('Error in action completions endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/action-completions?action_id=xxx
 * Get completions for a specific action (for Pack visibility)
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
    const action_id = searchParams.get('action_id')
    const pack_id = searchParams.get('pack_id')

    if (!action_id) {
      return NextResponse.json({ error: 'action_id is required' }, { status: 400 })
    }

    let query = supabase
      .from('action_completions')
      .select(
        `
        *,
        user:profiles(id, username, display_name, avatar_url)
      `
      )
      .eq('level_action_id', action_id)

    // If pack_id provided, only show pack completions where user is a member
    if (pack_id) {
      // Verify user is pack member
      const { data: membership } = await supabase
        .from('pack_memberships')
        .select('id')
        .eq('pack_id', pack_id)
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        return NextResponse.json(
          { error: 'You must be a Pack member to view Pack completions' },
          { status: 403 }
        )
      }

      query = query.eq('pack_id', pack_id).eq('completed_with_pack', true)
    } else {
      // Only show user's own completions
      query = query.eq('user_id', user.id)
    }

    const { data, error } = await query.order('completed_at', { ascending: false })

    if (error) {
      console.error('Error fetching completions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ completions: data })
  } catch (error) {
    console.error('Error in GET action completions endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
