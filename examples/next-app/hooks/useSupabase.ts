/**
 * Supabase client hook for client components
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useMemo } from 'react'
import type { Database } from '@/types/database.types'

export function useSupabase() {
  return useMemo(() => createClientComponentClient<Database>(), [])
}
