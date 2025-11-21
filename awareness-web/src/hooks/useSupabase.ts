/**
 * Supabase client hook for client components
 */

import { createClient } from '@/lib/supabase/client'
import { useMemo } from 'react'

export function useSupabase() {
  return useMemo(() => createClient(), [])
}
