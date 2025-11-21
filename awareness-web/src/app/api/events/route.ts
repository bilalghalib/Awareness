/**
 * Events API - Create Event
 * POST /api/events
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        title: body.title,
        description: body.description,
        location: body.location,
        occurred_at: body.occurred_at || new Date().toISOString(),
        source_type: body.source_type || 'manual',
        source_url: body.source_url,
        status: body.status || 'pending',
        estimated_casualties: body.estimated_casualties,
      })
      .select()
      .single()

    if (error) throw error

    // Create impact tracking record
    if (event) {
      await supabase.from('event_impact_tracking').insert({
        event_id: event.id,
        initial_damage_score: body.initial_damage_score || 80,
        current_damage_score: body.initial_damage_score || 80,
        healing_rate: 5.0,
      })
    }

    return NextResponse.json({ event }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('events')
      .select(
        `
        *,
        verifications (count),
        responses (count),
        impact_tracking:event_impact_tracking (*)
      `
      )
      .order('occurred_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: events, error } = await query

    if (error) throw error

    return NextResponse.json({ events }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
