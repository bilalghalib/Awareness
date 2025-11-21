import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/issues
 * Get all active issues
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all active issues with stats
    const { data: issues, error } = await supabase
      .from('issues_with_stats')
      .select('*')
      .in('current_status', ['active', 'monitoring', 'escalating'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching issues:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ issues })
  } catch (error) {
    console.error('Error in issues endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
