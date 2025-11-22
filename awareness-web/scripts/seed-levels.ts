/**
 * Seed Levels of Implication
 * Creates comprehensive implication levels and actions for Gaza, Climate, and Sudan
 *
 * Run with: npx tsx scripts/seed-levels.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function seedLevels() {
  console.log('🎯 Seeding Levels of Implication...\n')

  // Get issues
  const { data: issues, error: issuesError } = await supabase
    .from('issues')
    .select('id, slug, title')

  if (issuesError || !issues) {
    console.error('Error fetching issues:', issuesError)
    return
  }

  const gazaIssue = issues.find((i) => i.slug === 'gaza-humanitarian-crisis')
  const climateIssue = issues.find((i) => i.slug === 'climate-crisis')
  const sudanIssue = issues.find((i) => i.slug === 'sudan-conflict')

  if (!gazaIssue || !climateIssue || !sudanIssue) {
    console.error('Required issues not found. Run seed-phase-2-5.ts first.')
    return
  }

  // ==========================================
  // GAZA LEVELS
  // ==========================================
  console.log('📍 Creating levels for Gaza...')

  const gazaLevels = [
    {
      level: 'individual',
      display_order: 1,
      implication_prompt:
        'How do my consumer choices, information diet, and daily conversations relate to this crisis?',
      implication_description:
        'Your individual choices about what you buy, what media you consume, and how you talk about Gaza all contribute to the larger ecosystem that enables or challenges the status quo.',
      implication_examples: [
        'The news sources I follow shape my understanding of what\'s happening',
        'My consumer purchases may support companies complicit in the occupation',
        'The language I use when discussing this affects how others understand it',
        'My social media engagement amplifies certain narratives over others',
      ],
      action_prompt: 'What can I do at the individual level?',
      action_description:
        'Individual actions build awareness and create the foundation for larger change.',
      actions: [
        {
          title: 'Educate yourself on the history and context',
          description:
            'Spend 30-60 minutes learning about the history of Palestine, the Nakba, the occupation, and the current crisis. Understanding context is essential.',
          difficulty: 'easy',
          time_commitment: '30-60 minutes',
          resources: {
            links: [
              {
                title: 'The Question of Palestine - Edward Said',
                url: 'https://www.versobooks.com/products/2509-the-question-of-palestine',
              },
              {
                title: 'Palestine: A Four Thousand Year History - Nur Masalha',
                url: 'https://www.zedbooks.net/shop/book/palestine/',
              },
              {
                title: 'Decolonize Palestine',
                url: 'https://decolonizepalestine.com/',
              },
            ],
          },
        },
        {
          title: 'Examine your media consumption',
          description:
            'Notice which news sources you follow. Do they center Palestinian voices? Do they use dehumanizing language? Diversify your sources to include Palestinian journalists and perspectives.',
          difficulty: 'easy',
          time_commitment: 'Ongoing',
          resources: {
            links: [
              {
                title: 'Eye on Palestine (Instagram)',
                url: 'https://www.instagram.com/eye.on.palestine/',
              },
              {
                title: 'Electronic Intifada',
                url: 'https://electronicintifada.net/',
              },
              {
                title: '+972 Magazine',
                url: 'https://www.972mag.com/',
              },
            ],
          },
        },
        {
          title: 'Share verified information with your network',
          description:
            'When you see misinformation, share verified facts. When you see important news, amplify Palestinian voices. Use your platform, however small.',
          difficulty: 'easy',
          time_commitment: '5-10 minutes',
          resources: {
            links: [
              {
                title: 'Visualizing Palestine - Infographics',
                url: 'https://visualizingpalestine.org/',
              },
            ],
          },
        },
        {
          title: 'Donate to humanitarian aid organizations',
          description:
            'Direct financial support to organizations providing medical care, food, and shelter in Gaza. Every dollar helps.',
          difficulty: 'easy',
          time_commitment: '15 minutes',
          resources: {
            links: [
              {
                title: 'Palestine Children\'s Relief Fund',
                url: 'https://www.pcrf.net/',
              },
              {
                title: 'Medical Aid for Palestinians',
                url: 'https://www.map.org.uk/',
              },
              {
                title: 'UNRWA',
                url: 'https://www.unrwa.org/',
              },
            ],
          },
        },
      ],
    },
    {
      level: 'family',
      display_order: 2,
      implication_prompt:
        'How are my family\'s investments, intergenerational stories, and household decisions connected to this crisis?',
      implication_description:
        'Your family\'s financial investments, the stories you pass down, and collective household choices all have implications for Palestine.',
      implication_examples: [
        'Retirement accounts or pensions may invest in weapons manufacturers',
        'Family narratives about Israel/Palestine shape younger generations',
        'Household purchasing decisions may support BDS or contradict it',
        'Family wealth may be connected to systems that enable occupation',
      ],
      action_prompt: 'What can my family do?',
      action_description:
        'Family-level actions leverage collective resources and intergenerational power.',
      actions: [
        {
          title: 'Review investment portfolios (401k, pensions, stocks)',
          description:
            'Check if your family\'s investments include companies profiting from the occupation (weapons manufacturers, surveillance tech, etc.). Consider divestment.',
          difficulty: 'moderate',
          time_commitment: '1-2 hours',
          resources: {
            links: [
              {
                title: 'Investigate - Who Profits from Occupation',
                url: 'https://www.whoprofits.org/',
              },
              {
                title: 'AFSC - Investigate Your Investments',
                url: 'https://investigate.afsc.org/',
              },
            ],
          },
        },
        {
          title: 'Have difficult family conversations',
          description:
            'Discuss Palestine with family members who may have different views. Share what you\'ve learned. Listen and ask questions. This is slow, necessary work.',
          difficulty: 'challenging',
          time_commitment: 'Ongoing',
          resources: {
            guides: [
              {
                title: 'How to Talk to Family About Palestine',
                url: 'https://www.afsc.org/resource/talking-about-israelpalestine',
              },
            ],
          },
        },
        {
          title: 'Establish family donation matching',
          description:
            'If some family members can afford it, create a matching system where donations to Palestinian humanitarian aid are matched by other family members.',
          difficulty: 'moderate',
          time_commitment: '30 minutes setup',
          resources: {},
        },
      ],
    },
    {
      level: 'community',
      display_order: 3,
      implication_prompt:
        'How do my local institutions, organizations, and community infrastructure enable or resist this crisis?',
      implication_description:
        'Your community\'s institutions - universities, faith communities, businesses, local government - all have connections to Israeli policy and the occupation.',
      implication_examples: [
        'Local universities may have research partnerships with Israeli institutions',
        'Community businesses may be complicit in occupation economy',
        'Faith communities may uncritically support Israeli government',
        'Local government may have sister-city relationships with Israeli cities',
      ],
      action_prompt: 'What can my community do?',
      action_description:
        'Community organizing creates visible, collective witness and applies local pressure.',
      actions: [
        {
          title: 'Organize a local vigil or community gathering',
          description:
            'Hold space in your community for collective grief, witness, and solidarity. Make it visible. Invite Palestinian speakers if possible.',
          difficulty: 'moderate',
          time_commitment: '5-10 hours organizing',
          resources: {
            guides: [
              {
                title: 'Organizing a Vigil - Resource Guide',
                url: 'https://www.afsc.org/resource/organizing-vigil-or-rally',
              },
            ],
          },
        },
        {
          title: 'Engage your faith community',
          description:
            'If you\'re part of a religious community, organize study sessions, invite Palestinian Christians/Muslims to speak, push for institutional statements.',
          difficulty: 'moderate',
          time_commitment: 'Ongoing',
          resources: {
            links: [
              {
                title: 'Kairos Palestine',
                url: 'https://www.kairospalestine.ps/',
              },
              {
                title: 'Sabeel Ecumenical Liberation Theology Center',
                url: 'https://sabeel.org/',
              },
            ],
          },
        },
        {
          title: 'Campaign for BDS in local institutions',
          description:
            'Work to get your university, union, or local government to divest from companies profiting from occupation. This is long-term organizing.',
          difficulty: 'requires_commitment',
          time_commitment: '6+ months',
          resources: {
            links: [
              {
                title: 'BDS Movement',
                url: 'https://bdsmovement.net/',
              },
            ],
          },
        },
      ],
    },
    {
      level: 'culture',
      display_order: 4,
      implication_prompt:
        'How do cultural narratives, art, and identity shape understanding and response to this crisis?',
      implication_description:
        'Cultural representations of Palestine, Israeli, Jews, Arabs, and Muslims shape how people understand this crisis. Art and narrative create reality.',
      implication_examples: [
        'Hollywood narratives often center Israeli perspectives, erasing Palestinians',
        'Cultural conflation of Judaism with Zionism harms both Palestinians and Jews',
        'Art and music can humanize or dehumanize',
        'Cultural memory determines what is remembered and what is forgotten',
      ],
      action_prompt: 'What cultural work can be done?',
      action_description:
        'Cultural work shapes consciousness and creates space for different futures.',
      actions: [
        {
          title: 'Create or support art addressing Palestine',
          description:
            'Support Palestinian artists, create art yourself, attend cultural events that center Palestinian narratives and voices.',
          difficulty: 'moderate',
          time_commitment: 'Varies',
          resources: {
            links: [
              {
                title: 'Palestinian Museum',
                url: 'https://palmuseum.org/',
              },
              {
                title: 'Palestine Writes Literature Festival',
                url: 'https://palestinewrites.org/',
              },
            ],
          },
        },
        {
          title: 'Challenge dehumanizing cultural narratives',
          description:
            'When you encounter cultural products (films, books, media) that dehumanize Palestinians or erase them, speak up. Write reviews. Organize discussions.',
          difficulty: 'moderate',
          time_commitment: 'Ongoing',
          resources: {},
        },
        {
          title: 'Amplify Palestinian cultural voices',
          description:
            'Read Palestinian authors, watch Palestinian films, listen to Palestinian music. Share these with your community.',
          difficulty: 'easy',
          time_commitment: 'Ongoing',
          resources: {
            links: [
              {
                title: 'Palestinian Literature Reading List',
                url: 'https://www.arablit.org/2023/12/21/100-palestinian-works-of-literature/',
              },
            ],
          },
        },
      ],
    },
    {
      level: 'country',
      display_order: 5,
      implication_prompt:
        'How is this crisis enabled by national policy, and what is my responsibility as a citizen/resident?',
      implication_description:
        'The US provides $3.8 billion annually in military aid to Israel, plus diplomatic cover. Other countries have their own forms of complicity. You have power as a citizen.',
      implication_examples: [
        'US tax dollars fund Israeli military operations',
        'Congressional representatives vote for unconditional military aid',
        'UN veto power shields Israel from accountability',
        'Weapons manufacturers profit and lobby for continued support',
      ],
      action_prompt: 'What national-level action can I take?',
      action_description:
        'Political action at the national level directly impacts policy that enables or challenges occupation.',
      actions: [
        {
          title: 'Call and write your representatives',
          description:
            'Regularly contact your House rep and Senators. Demand ceasefire, conditioning of military aid, support for Palestinian rights. Make your voice heard.',
          difficulty: 'easy',
          time_commitment: '10-15 minutes weekly',
          resources: {
            links: [
              {
                title: '5 Calls - Gaza Scripts',
                url: 'https://5calls.org/',
              },
            ],
          },
        },
        {
          title: 'Make this a voting issue',
          description:
            'Commit to only voting for candidates who support Palestinian rights, conditioning military aid, and a just peace. Tell candidates this is your red line.',
          difficulty: 'moderate',
          time_commitment: 'Ongoing',
          resources: {},
        },
        {
          title: 'Join national advocacy campaigns',
          description:
            'Connect with national organizations working on policy change. Add your voice to coordinated campaigns.',
          difficulty: 'moderate',
          time_commitment: '2-5 hours/month',
          resources: {
            links: [
              {
                title: 'US Campaign for Palestinian Rights',
                url: 'https://uscpr.org/',
              },
              {
                title: 'American Friends Service Committee',
                url: 'https://www.afsc.org/israel-palestine',
              },
            ],
          },
        },
      ],
    },
    {
      level: 'systemic',
      display_order: 6,
      implication_prompt:
        'How are global systems (capitalism, colonialism, militarism, white supremacy) at play, and how am I positioned within them?',
      implication_description:
        'Palestine is not an isolated issue - it\'s connected to settler colonialism, racial capitalism, US imperialism, and militarism globally. Systemic change requires connecting struggles.',
      implication_examples: [
        'Israeli occupation uses tactics tested on Palestinians then exported globally',
        'Weapons companies profit from endless war, here and elsewhere',
        'Settler colonial logic connects Palestine to Indigenous struggles globally',
        'US imperialism in Middle East shapes multiple crises',
      ],
      action_prompt: 'What systemic transformation work can I do?',
      action_description:
        'Systemic change requires long-term organizing, coalition-building, and structural analysis.',
      actions: [
        {
          title: 'Join movements for systemic change',
          description:
            'Connect Palestine solidarity to anti-imperialist, anti-racist, Indigenous sovereignty, and anti-capitalist organizing. Build coalitions across struggles.',
          difficulty: 'requires_commitment',
          time_commitment: 'Long-term',
          resources: {
            links: [
              {
                title: 'Black-Palestinian Solidarity',
                url: 'https://blackforpalestine.com/',
              },
              {
                title: 'Indigenous Action',
                url: 'https://www.indigenousaction.org/',
              },
            ],
          },
        },
        {
          title: 'Study structural analysis',
          description:
            'Deepen your understanding of how colonialism, capitalism, and imperialism function. Read theory. Attend study groups.',
          difficulty: 'moderate',
          time_commitment: 'Ongoing',
          resources: {
            links: [
              {
                title: 'Settlers: The Mythology of the White Proletariat - J. Sakai',
                url: 'https://readsettlers.org/',
              },
              {
                title: 'The Wretched of the Earth - Frantz Fanon',
                url: 'https://www.penguinrandomhouse.com/books/295061/the-wretched-of-the-earth-by-frantz-fanon/',
              },
            ],
          },
        },
        {
          title: 'Build alternative institutions',
          description:
            'Support and create institutions that prefigure a different world - mutual aid networks, cooperatives, community defense, alternative media.',
          difficulty: 'requires_commitment',
          time_commitment: 'Long-term',
          resources: {},
        },
      ],
    },
  ]

  // Create Gaza levels and actions
  for (const levelData of gazaLevels) {
    const { actions, ...levelFields } = levelData

    const { data: level, error: levelError } = await supabase
      .from('implication_levels')
      .insert({
        ...levelFields,
        issue_id: gazaIssue.id,
      })
      .select()
      .single()

    if (levelError) {
      console.error('Error creating level:', levelError)
      continue
    }

    console.log(`  ✓ ${levelData.level} level`)

    // Create actions for this level
    for (const action of actions) {
      const { error: actionError } = await supabase.from('level_actions').insert({
        implication_level_id: level.id,
        ...action,
      })

      if (actionError) {
        console.error('Error creating action:', actionError)
      }
    }
  }

  console.log('\n✅ Levels of Implication seeded successfully!\n')
  console.log('Created:')
  console.log(`  - 6 levels for Gaza with ${gazaLevels.reduce((sum, l) => sum + l.actions.length, 0)} actions`)
  console.log('\nNext: Create similar data for Climate and Sudan issues')
}

seedLevels()
  .then(() => {
    console.log('\nDone!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
