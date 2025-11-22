import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/implication-levels?issue_id=xxx
 * Get all implication levels and actions for an issue
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const issue_id = searchParams.get('issue_id')

    if (!issue_id) {
      return NextResponse.json({ error: 'issue_id is required' }, { status: 400 })
    }

    // Fetch all levels for this issue with their actions
    const { data: levels, error } = await supabase
      .from('implication_levels')
      .select(
        `
        *,
        actions:level_actions(*)
      `
      )
      .eq('issue_id', issue_id)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching implication levels:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ levels })
  } catch (error) {
    console.error('Error in implication levels endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
