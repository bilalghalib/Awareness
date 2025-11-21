/**
 * Phase 2.5 Seed Data Script
 * Seeds Issues (ongoing crises) and Moments (discrete events within issues)
 * Also adds sample interpretations and pack focus
 *
 * Run with: npx tsx scripts/seed-phase-2-5.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function seedPhase25() {
  console.log('🌱 Seeding Phase 2.5: Issues Model + Content Protection\n')

  try {
    // Get existing packs for linking
    const { data: packs } = await supabase.from('packs').select('id, name').limit(3)

    if (!packs || packs.length === 0) {
      console.log('⚠️  No packs found. Run seed-data.ts first to create packs.')
      return
    }

    console.log(`Found ${packs.length} packs\n`)

    // ==========================================
    // 1. CREATE ISSUES (Ongoing Crises)
    // ==========================================
    console.log('📍 Creating Issues...')

    const issues = [
      {
        title: 'Gaza Humanitarian Crisis',
        slug: 'gaza-humanitarian-crisis',
        description:
          'Ongoing humanitarian crisis in Gaza following the escalation of conflict in October 2023',
        type: 'humanitarian',
        current_status: 'active',
        started_at: '2023-10-07',
        what_we_know: `Verified facts:
• Ongoing military operations since Oct 2023
• 30,000+ Palestinian deaths (Gaza Health Ministry)
• 1,200+ Israeli deaths in initial attack (Israeli govt)
• 85% of Gaza population displaced (UN)
• Severe restrictions on aid (multiple sources)
• Multiple hospitals and schools damaged
• ICJ ruled "plausible genocide" case can proceed`,
        what_we_dont_know: `Open questions:
• Full extent of infrastructure damage
• Exact civilian vs combatant casualty breakdown
• Timeline for sustained humanitarian access
• Long-term displacement and reconstruction needs
• Full accounting of all parties' actions`,
        what_it_means: [
          {
            interpretation_text: 'This is genocide',
            source_name: 'UN Special Rapporteur on Palestine',
            source_url: 'https://www.ohchr.org/en/press-releases/2023/11/un-expert-warns-new-instance-genocide-calls-prevention-before-its-too',
            perspective_type: 'UN Expert',
          },
          {
            interpretation_text: 'This is self-defense against terrorism',
            source_name: 'Israeli Government',
            source_url: 'https://www.gov.il/en',
            perspective_type: 'Government',
          },
          {
            interpretation_text:
              'This is collective punishment and violates international humanitarian law',
            source_name: 'Human Rights Watch',
            source_url: 'https://www.hrw.org/middle-east/north-africa/israel/palestine',
            perspective_type: 'Human Rights NGO',
          },
        ],
      },
      {
        title: 'Climate Crisis',
        slug: 'climate-crisis',
        description:
          'Global climate change and its accelerating impacts on ecosystems, weather patterns, and human communities',
        type: 'environmental',
        current_status: 'escalating',
        started_at: '1850-01-01',
        what_we_know: `Verified facts:
• Global temperature +1.2°C above pre-industrial (IPCC)
• CO2 levels at 421ppm, highest in 3 million years
• Arctic sea ice declining 13% per decade
• Sea level rising 3.4mm per year
• Extreme weather events increasing in frequency and intensity
• 2023 was hottest year on record
• Coral reefs experiencing unprecedented bleaching`,
        what_we_dont_know: `Open questions:
• Exact tipping points for various Earth systems
• Full impact of methane feedback loops
• Precise regional climate predictions
• Effectiveness of current mitigation efforts at scale
• Geoengineering risks and benefits
• Social tipping points for transformative change`,
        what_it_means: [
          {
            interpretation_text:
              'We are in a climate emergency requiring immediate systemic transformation',
            source_name: 'IPCC Sixth Assessment Report',
            source_url: 'https://www.ipcc.ch/report/ar6/syr/',
            perspective_type: 'Scientific Consensus',
          },
          {
            interpretation_text:
              'Individual lifestyle changes alone are insufficient; we need to dismantle fossil capitalism',
            source_name: 'Climate Justice Alliance',
            source_url: 'https://climatejusticealliance.org/',
            perspective_type: 'Climate Justice Movement',
          },
          {
            interpretation_text:
              'Technology and market solutions can address climate change without radical economic restructuring',
            source_name: 'Breakthrough Energy',
            source_url: 'https://breakthroughenergy.org/',
            perspective_type: 'Tech-Optimist',
          },
        ],
      },
      {
        title: 'Sudan Conflict',
        slug: 'sudan-conflict',
        description:
          'Armed conflict in Sudan between the Sudanese Armed Forces and the Rapid Support Forces',
        type: 'humanitarian',
        current_status: 'active',
        started_at: '2023-04-15',
        what_we_know: `Verified facts:
• Fighting began April 15, 2023
• 10,000+ deaths (UN estimates, likely undercounted)
• 6+ million displaced internally
• 1.5+ million fled to neighboring countries
• Severe food insecurity affecting millions
• Health system largely collapsed
• Reports of atrocities in Darfur region`,
        what_we_dont_know: `Open questions:
• Full death toll (many areas inaccessible)
• Extent of atrocities and war crimes
• Prospects for negotiated ceasefire
• Regional implications and spillover
• Humanitarian access timeline
• Long-term political settlement`,
        what_it_means: [
          {
            interpretation_text:
              'This is a continuation of the Darfur genocide with international complicity through inaction',
            source_name: 'Sudan scholars and activists',
            source_url: 'https://savingdarfur.org/',
            perspective_type: 'Advocacy',
          },
          {
            interpretation_text:
              'This is a power struggle between military factions with roots in Sudan\'s transition failures',
            source_name: 'International Crisis Group',
            source_url: 'https://www.crisisgroup.org/africa/horn-africa/sudan',
            perspective_type: 'Conflict Analysis',
          },
        ],
      },
    ]

    const createdIssues = []
    for (const issue of issues) {
      const { data, error } = await supabase
        .from('issues')
        .insert({
          ...issue,
          what_it_means: issue.what_it_means as any,
        })
        .select()
        .single()

      if (error) {
        console.error(`Error creating ${issue.title}:`, error)
      } else {
        console.log(`  ✓ Created: ${issue.title}`)
        createdIssues.push(data)
      }
    }

    console.log()

    // ==========================================
    // 2. CREATE INTERPRETATIONS (Multiple Perspectives)
    // ==========================================
    console.log('💭 Creating Interpretations...')

    for (const issue of createdIssues) {
      const issueData = issues.find((i) => i.slug === issue.slug)
      if (!issueData) continue

      for (const interp of issueData.what_it_means) {
        const { error } = await supabase.from('interpretations').insert({
          issue_id: issue.id,
          interpretation_text: interp.interpretation_text,
          source_name: interp.source_name,
          source_url: interp.source_url,
          perspective_type: interp.perspective_type,
          verified: true,
        })

        if (error) {
          console.error(`Error creating interpretation:`, error)
        }
      }
    }

    console.log('  ✓ Created interpretations for all issues\n')

    // ==========================================
    // 3. LINK PACKS TO ISSUES (Pack Focus)
    // ==========================================
    console.log('🎒 Creating Pack-Issue Focus...')

    if (packs.length >= 2 && createdIssues.length >= 2) {
      const focuses = [
        {
          pack_id: packs[0].id,
          issue_id: createdIssues.find((i) => i.slug === 'gaza-humanitarian-crisis')?.id,
          priority: 'primary',
        },
        {
          pack_id: packs[1].id,
          issue_id: createdIssues.find((i) => i.slug === 'climate-crisis')?.id,
          priority: 'primary',
        },
      ]

      for (const focus of focuses) {
        if (!focus.issue_id) continue

        const { error } = await supabase.from('pack_issue_focus').insert(focus)

        if (error) {
          console.error('Error creating pack focus:', error)
        } else {
          const pack = packs.find((p) => p.id === focus.pack_id)
          const issue = createdIssues.find((i) => i.id === focus.issue_id)
          console.log(`  ✓ ${pack?.name} focusing on ${issue?.title}`)
        }
      }
    }

    console.log()

    // ==========================================
    // 4. CREATE MOMENTS (Events within Issues)
    // ==========================================
    console.log('📍 Creating Moments within Issues...')

    const moments = [
      // Gaza moments
      {
        title: 'UN Security Council Calls for Humanitarian Ceasefire',
        description:
          'UN Security Council passes resolution calling for extended humanitarian pauses and corridors for aid delivery.',
        location: 'New York, United States',
        occurred_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        source_type: 'official',
        source_url: 'https://www.un.org/securitycouncil/',
        status: 'verified',
        issue_slug: 'gaza-humanitarian-crisis',
        content_tier: 1,
        has_graphic_content: false,
        content_warnings: ['Humanitarian crisis', 'Diplomatic action'],
        verification_trail: [
          {
            step: 1,
            action: 'Source verification',
            details: 'Official UN Security Council press release verified',
            sources: ['https://www.un.org/securitycouncil/'],
            timestamp: new Date().toISOString(),
          },
          {
            step: 2,
            action: 'Cross-referencing',
            details: 'Confirmed by Reuters, BBC, Al Jazeera coverage',
            sources: [
              'https://reuters.com',
              'https://bbc.com',
              'https://aljazeera.com',
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      },
      {
        title: 'First Aid Convoy Reaches Northern Gaza',
        description:
          '25 trucks carrying food, water, and medical supplies reach northern Gaza after weeks of blocked access.',
        location: 'Northern Gaza Strip',
        occurred_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        source_type: 'humanitarian',
        source_url: 'https://www.unrwa.org/',
        status: 'verified',
        issue_slug: 'gaza-humanitarian-crisis',
        content_tier: 1,
        has_graphic_content: false,
        content_warnings: ['Humanitarian situation'],
        verification_trail: [
          {
            step: 1,
            action: 'Source verification',
            details: 'UNRWA official statement and photo documentation',
            timestamp: new Date().toISOString(),
          },
        ],
      },

      // Climate moments
      {
        title: 'Global Temperature Exceeds 1.5°C Threshold for Full Year',
        description:
          '2024 marks the first full calendar year where global temperatures exceeded 1.5°C above pre-industrial levels, crossing the Paris Agreement target.',
        location: 'Global',
        occurred_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        source_type: 'scientific',
        source_url: 'https://www.copernicus.eu/',
        status: 'verified',
        issue_slug: 'climate-crisis',
        content_tier: 1,
        has_graphic_content: false,
        content_warnings: ['Climate data', 'Environmental impact'],
        verification_trail: [
          {
            step: 1,
            action: 'Data verification',
            details: 'Copernicus Climate Change Service official data release',
            timestamp: new Date().toISOString(),
          },
          {
            step: 2,
            action: 'Scientific consensus',
            details: 'Confirmed by NOAA, NASA, Met Office',
            timestamp: new Date().toISOString(),
          },
        ],
      },
      {
        title: 'Youth Climate Strike Reaches 100 Cities Globally',
        description:
          'Coordinated global climate strikes organized by youth activists demanding fossil fuel phase-out and climate justice.',
        location: '100 cities worldwide',
        occurred_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        source_type: 'grassroots',
        source_url: 'https://fridaysforfuture.org/',
        status: 'verified',
        issue_slug: 'climate-crisis',
        content_tier: 1,
        has_graphic_content: false,
        content_warnings: ['Protest action'],
        verification_trail: [
          {
            step: 1,
            action: 'Event verification',
            details: 'Fridays for Future organizers and participant reports',
            timestamp: new Date().toISOString(),
          },
        ],
      },

      // Sudan moments
      {
        title: 'Ceasefire Talks Resume in Jeddah',
        description:
          'Representatives from SAF and RSF meet in Saudi Arabia for renewed ceasefire negotiations mediated by US and Saudi Arabia.',
        location: 'Jeddah, Saudi Arabia',
        occurred_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        source_type: 'diplomatic',
        source_url: 'https://www.state.gov/',
        status: 'verified',
        issue_slug: 'sudan-conflict',
        content_tier: 1,
        has_graphic_content: false,
        content_warnings: ['Conflict negotiation'],
        verification_trail: [
          {
            step: 1,
            action: 'Source verification',
            details: 'US State Department and Saudi Ministry of Foreign Affairs statements',
            timestamp: new Date().toISOString(),
          },
        ],
      },
    ]

    for (const moment of moments) {
      // Find the issue ID
      const issue = createdIssues.find((i) => i.slug === moment.issue_slug)
      if (!issue) continue

      const { data: event, error } = await supabase
        .from('events')
        .insert({
          title: moment.title,
          description: moment.description,
          location: moment.location,
          occurred_at: moment.occurred_at,
          source_type: moment.source_type,
          source_url: moment.source_url,
          status: moment.status,
          issue_id: issue.id,
          content_tier: moment.content_tier,
          has_graphic_content: moment.has_graphic_content,
          content_warnings: moment.content_warnings,
          verification_trail: moment.verification_trail as any,
          verification_confidence_score: 0.9,
        })
        .select()
        .single()

      if (error) {
        console.error(`Error creating moment "${moment.title}":`, error)
      } else {
        console.log(`  ✓ ${issue.title}: ${moment.title}`)

        // Create impact tracking
        await supabase.from('event_impact_tracking').insert({
          event_id: event.id,
          initial_damage_score: 75,
          current_damage_score: 75,
          healing_rate: 5.0,
        })
      }
    }

    console.log('\n✅ Phase 2.5 seeding complete!\n')
    console.log('Created:')
    console.log(`  - ${createdIssues.length} Issues (ongoing crises)`)
    console.log(`  - ${moments.length} Moments (events within issues)`)
    console.log(
      `  - ${createdIssues.reduce((sum, i) => sum + issues.find((iss) => iss.slug === i.slug)?.what_it_means.length || 0, 0)} Interpretations`
    )
    console.log('\nYou can now:')
    console.log('  - Visit /issues/gaza-humanitarian-crisis')
    console.log('  - Visit /issues/climate-crisis')
    console.log('  - Visit /issues/sudan-conflict')
    console.log('  - Create events/moments from admin panel with issue context')
  } catch (error) {
    console.error('Error seeding:', error)
    throw error
  }
}

// Run the seed
seedPhase25()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
