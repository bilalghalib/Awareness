/**
 * Pack Presence Component
 * FOR MAYA: Visualizes collective holding
 * Shows who else is present with this event right now
 */

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabase } from '@/hooks/useSupabase'
import type { PackPresence, Profile, PresenceStatus } from '@/types/database.types'

interface PackPresenceProps {
  packId?: string
  eventId: string
  activeMembers: (PackPresence & { profile: Profile })[]
}

export function PackPresence({ packId, eventId, activeMembers: initialMembers }: PackPresenceProps) {
  const supabase = useSupabase()
  const [members, setMembers] = useState(initialMembers)
  const [myStatus, setMyStatus] = useState<PresenceStatus>('active')

  useEffect(() => {
    if (!packId) return

    // Send heartbeat every 30 seconds
    const sendHeartbeat = () => {
      supabase.from('pack_presence').upsert({
        pack_id: packId,
        event_id: eventId,
        status: myStatus,
        last_heartbeat_at: new Date().toISOString(),
        current_activity: getCurrentActivity(),
      })
    }

    sendHeartbeat() // Initial
    const heartbeatInterval = setInterval(sendHeartbeat, 30000)

    // Subscribe to presence changes
    const channel = supabase
      .channel(`presence:${packId}:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pack_presence',
          filter: `pack_id=eq.${packId}`,
        },
        async (payload) => {
          // Refetch presence data
          const { data } = await supabase
            .from('pack_presence')
            .select('*, profile:profiles(username, display_name, avatar_url)')
            .eq('pack_id', packId)
            .eq('event_id', eventId)
            .gt('last_heartbeat_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())

          if (data) setMembers(data)
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval)
      supabase.removeChannel(channel)

      // Mark as away
      supabase.from('pack_presence').update({
        status: 'away',
        last_heartbeat_at: new Date().toISOString(),
      }).eq('pack_id', packId).eq('event_id', eventId)
    }
  }, [packId, eventId, myStatus, supabase])

  if (!packId || members.length === 0) {
    return null
  }

  const activeMemberCount = members.filter(m => m.status === 'active').length
  const reflectingCount = members.filter(m => m.status === 'reflecting').length
  const respondingCount = members.filter(m => m.status === 'responding').length

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Your Pack is here
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {activeMemberCount + reflectingCount + respondingCount} member
            {activeMemberCount + reflectingCount + respondingCount !== 1 && 's'} present with this event
          </p>
        </div>

        {/* Status selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs text-gray-500 dark:text-gray-400">
            You are:
          </label>
          <select
            value={myStatus}
            onChange={(e) => setMyStatus(e.target.value as PresenceStatus)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="active">Present</option>
            <option value="reflecting">Reflecting</option>
            <option value="responding">Responding</option>
          </select>
        </div>
      </div>

      {/* Activity breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <ActivityCard
          label="Present"
          count={activeMemberCount}
          color="blue"
        />
        <ActivityCard
          label="Reflecting"
          count={reflectingCount}
          color="purple"
        />
        <ActivityCard
          label="Responding"
          count={respondingCount}
          color="green"
        />
      </div>

      {/* Member avatars */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <AnimatePresence>
          {members.slice(0, 12).map((member, index) => (
            <motion.div
              key={member.user_id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ring-2 ${getStatusRingColor(member.status)}`}
                style={{
                  backgroundColor: member.profile.avatar_url
                    ? 'transparent'
                    : getAvatarColor(member.profile.username),
                  backgroundImage: member.profile.avatar_url
                    ? `url(${member.profile.avatar_url})`
                    : 'none',
                  backgroundSize: 'cover',
                }}
              >
                {!member.profile.avatar_url &&
                  (member.profile.display_name || member.profile.username)[0].toUpperCase()}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {member.profile.display_name || member.profile.username}
                {member.current_activity && (
                  <div className="text-gray-400">
                    {member.current_activity}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {members.length > 12 && (
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400">
            +{members.length - 12}
          </div>
        )}
      </div>

      {/* Gentle message */}
      <div className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-100 italic">
          You are not alone in holding this. Your Pack is with you.
        </p>
      </div>
    </div>
  )
}

interface ActivityCardProps {
  label: string
  count: number
  color: 'blue' | 'purple' | 'green'
}

function ActivityCard({ label, count, color }: ActivityCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100',
  }

  return (
    <div className={`rounded-lg p-3 text-center ${colorClasses[color]}`}>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-xs uppercase tracking-wide mt-1">{label}</div>
    </div>
  )
}

// Utility functions

function getStatusRingColor(status: PresenceStatus): string {
  switch (status) {
    case 'active':
      return 'ring-blue-400 dark:ring-blue-500'
    case 'reflecting':
      return 'ring-purple-400 dark:ring-purple-500'
    case 'responding':
      return 'ring-green-400 dark:ring-green-500'
    default:
      return 'ring-gray-300 dark:ring-gray-600'
  }
}

function getAvatarColor(username: string): string {
  const colors = [
    '#EF4444', // red
    '#F59E0B', // amber
    '#10B981', // green
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#EC4899', // pink
  ]

  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

function getCurrentActivity(): string {
  // This could be inferred from scroll position, focus, etc.
  // For now, return a default
  return 'reading'
}
