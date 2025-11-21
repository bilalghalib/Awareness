/**
 * Seed Data Script
 * Creates initial Packs and sample events for testing
 * Run with: node --loader tsx scripts/seed-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function seedPacks() {
  console.log('Seeding Packs...')

  const packs = [
    {
      name: 'San Francisco Bay Area Pack',
      description:
        'Connected community across San Francisco and Manila, synchronized for dinner time responses',
      timezone: 'America/Los_Angeles',
      sync_time: '18:00:00',
      region: 'San Francisco Bay Area',
      values_statement:
        'We believe in staying informed without overwhelm, verifying truth collaboratively, and coordinating meaningful action.',
    },
    {
      name: 'Manila Metro Pack',
      description:
        'Morning awareness community in Manila, connected with evening responders in SF',
      timezone: 'Asia/Manila',
      sync_time: '08:00:00',
      region: 'Manila Metro',
      values_statement:
        'We hold space for global awareness while supporting local action and collective healing.',
    },
    {
      name: 'Berlin Timezone Pack',
      description: 'European awareness community with global connections',
      timezone: 'Europe/Berlin',
      sync_time: '19:00:00',
      region: 'Berlin, Germany',
      values_statement:
        'We practice sustained attention to what matters, building bridges of understanding across distances.',
    },
  ]

  const { data, error } = await supabase.from('packs').insert(packs).select()

  if (error) {
    console.error('Error seeding packs:', error)
    return null
  }

  console.log(`✅ Created ${data.length} packs`)
  return data
}

async function seedEvents() {
  console.log('Seeding Events...')

  const events = [
    {
      title: 'Community Center Opens in Refugee Camp',
      description:
        'A new community center providing education and support services has opened in a refugee camp, offering hope and resources to displaced families.',
      location: 'Zaatari Refugee Camp, Jordan',
      occurred_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      source_type: 'manual',
      source_url: 'https://example.com/news/community-center',
      status: 'verified',
      verification_confidence_score: 0.95,
      estimated_casualties: { displaced: 0, injured: 0, killed: 0 },
      verification_trail: [
        {
          step: 1,
          action: 'checked_original_source',
          details:
            'Verified with UNHCR official press release and on-ground photos',
          sources: ['https://unhcr.org/news/...'],
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          step: 2,
          action: 'cross_referenced_news',
          details: 'Confirmed by Al Jazeera and local news outlets',
          sources: ['https://aljazeera.com/...', 'https://localnews.jo/...'],
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      title: 'Earthquake in Southern Turkey',
      description:
        'A 6.2 magnitude earthquake struck southern Turkey near the Syrian border. Search and rescue operations are underway.',
      location: 'Hatay Province, Turkey',
      occurred_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      source_type: 'manual',
      source_url: 'https://example.com/news/earthquake',
      status: 'verified',
      verification_confidence_score: 0.92,
      estimated_casualties: { killed: 12, injured: 145, missing: 8 },
      verification_trail: [
        {
          step: 1,
          action: 'checked_original_source',
          details: 'USGS seismic data confirmed magnitude and location',
          sources: ['https://earthquake.usgs.gov/...'],
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          step: 2,
          action: 'verified_image_metadata',
          details: 'Photos verified authentic, timestamped correctly',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          step: 3,
          action: 'contacted_local_sources',
          details: 'Confirmed with local authorities and aid organizations',
          sources: ['https://afad.gov.tr/...'],
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      title: 'Flooding Displaces Families in Bangladesh',
      description:
        'Heavy monsoon rains have caused severe flooding, displacing thousands of families. Relief efforts are being coordinated.',
      location: 'Sylhet Division, Bangladesh',
      occurred_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      source_type: 'manual',
      source_url: 'https://example.com/news/flooding',
      status: 'verified',
      verification_confidence_score: 0.88,
      estimated_casualties: { killed: 0, injured: 23, displaced: 3400 },
      verification_trail: [
        {
          step: 1,
          action: 'checked_original_source',
          details: 'Bangladesh Meteorological Department confirmed rainfall levels',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          step: 2,
          action: 'cross_referenced_news',
          details: 'Multiple international news agencies reporting',
          sources: ['https://bbc.com/...', 'https://reuters.com/...'],
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
  ]

  const { data: eventsData, error } = await supabase
    .from('events')
    .insert(events)
    .select()

  if (error) {
    console.error('Error seeding events:', error)
    return null
  }

  console.log(`✅ Created ${eventsData.length} events`)

  // Create impact tracking for each event
  const impactTracking = eventsData.map((event, index) => ({
    event_id: event.id,
    initial_damage_score: [60, 85, 70][index], // Varied impact levels
    current_damage_score: [35, 70, 60][index], // Some healing from responses
    response_count: [15, 8, 12][index],
    healing_rate: 5.0,
  }))

  const { error: impactError } = await supabase
    .from('event_impact_tracking')
    .insert(impactTracking)

  if (impactError) {
    console.error('Error seeding impact tracking:', impactError)
  } else {
    console.log(`✅ Created impact tracking for ${impactTracking.length} events`)
  }

  return eventsData
}

async function seedResponseTemplates() {
  console.log('Seeding Response Templates...')

  const templates = [
    {
      title: 'Donate to Medical Relief',
      description:
        'Research and donate to reputable medical charities providing aid in the affected region',
      response_type: 'donation',
      action_steps: {
        steps: [
          {
            order: 1,
            instruction: 'Research reputable medical charities operating in the region',
          },
          {
            order: 2,
            instruction:
              'Coordinate with Pack members on donation amount (suggest $20-50)',
          },
          {
            order: 3,
            instruction: 'Make donation and save receipt',
          },
          {
            order: 4,
            instruction: 'Post proof to Pack for collective impact tracking',
          },
        ],
        estimated_time: '30 minutes',
        estimated_cost: '$20-50',
        can_be_done_remotely: true,
      },
    },
    {
      title: 'Organize Local Vigil',
      description:
        'Host a candlelight vigil or moment of silence in your community',
      response_type: 'vigil',
      action_steps: {
        steps: [
          {
            order: 1,
            instruction: 'Choose a public location and time (coordinate with Pack)',
          },
          {
            order: 2,
            instruction: 'Create simple flyer or social media post',
          },
          {
            order: 3,
            instruction: 'Bring candles or materials for moment of remembrance',
          },
          {
            order: 4,
            instruction: 'Share photos with Pack after event',
          },
        ],
        estimated_time: '2-3 hours',
        can_be_done_remotely: false,
        required_skills: ['event organizing'],
      },
    },
    {
      title: 'Translate and Share Accurate Information',
      description:
        'Help combat misinformation by translating and sharing verified details',
      response_type: 'amplification',
      action_steps: {
        steps: [
          {
            order: 1,
            instruction:
              'Review the verification trail to understand confirmed facts',
          },
          {
            order: 2,
            instruction: 'Translate key information into your language',
          },
          {
            order: 3,
            instruction:
              'Share on social media with links to verification sources',
          },
          {
            order: 4,
            instruction:
              'Monitor comments and correct misinformation if it appears',
          },
        ],
        estimated_time: '45 minutes',
        can_be_done_remotely: true,
        required_skills: ['translation', 'fact-checking'],
      },
    },
  ]

  const { data, error } = await supabase
    .from('response_templates')
    .insert(templates)
    .select()

  if (error) {
    console.error('Error seeding templates:', error)
    return null
  }

  console.log(`✅ Created ${data.length} response templates`)
  return data
}

async function main() {
  console.log('🌱 Starting seed process...\n')

  try {
    await seedPacks()
    await seedEvents()
    await seedResponseTemplates()

    console.log('\n✅ Seed completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Sign up for an account at http://localhost:3000')
    console.log('2. Join a Pack via the dashboard')
    console.log('3. Explore events at http://localhost:3000/events')
  } catch (error) {
    console.error('\n❌ Seed failed:', error)
    process.exit(1)
  }
}

main()
