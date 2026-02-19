import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { checkAndIncrementUsage, usageLimitResponse } from '@/lib/usageLimits'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const { data: { user }, error: userError } = await adminClient.auth.getUser(accessToken)

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check usage limit before running expensive Claude call
    const usage = await checkAndIncrementUsage(adminClient, user.id, 'plan')
    if (!usage.allowed) {
      return NextResponse.json(
        usageLimitResponse(usage.current, usage.limit, usage.isPaid, 'plan'),
        { status: 429 }
      )
    }

    // Fetch user profile
    const { data: profile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Calculate financial runway
    const runway = profile?.current_savings && profile?.monthly_expenses
      ? (profile.current_savings / profile.monthly_expenses).toFixed(1)
      : null

    // Days to separation for urgency context
    const daysToSep = profile?.separation_date
      ? Math.ceil((new Date(profile.separation_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    const profileContext = profile ? `
MILITARY BACKGROUND:
- Name: ${profile.name || 'Not provided'}
- Branch: ${profile.branch || 'Not provided'}
- MOS/Rate/AFSC: ${profile.mos || 'Not provided'}
- Security Clearance: ${profile.clearance || 'None'}
- Separation Date: ${profile.separation_date || 'Not provided'}${daysToSep !== null ? ` (${daysToSep > 0 ? daysToSep + ' days away' : 'already separated'})` : ''}

CAREER GOALS:
- Desired Job Title: ${profile.desired_job || 'Not specified'}
- Target Industry: ${profile.desired_industry || 'Not specified'}
- Work Type Preference: ${profile.work_type || 'No preference stated'}

LOCATION:
- Current Location: ${[profile.current_city, profile.current_state].filter(Boolean).join(', ') || profile.location || 'Not provided'}
- Target Location: ${[profile.target_city, profile.target_state].filter(Boolean).join(', ') || 'Not specified'}

FINANCIAL SITUATION:
- Monthly Expenses: $${profile.monthly_expenses?.toLocaleString() || '0'}
- Current Savings: $${profile.current_savings?.toLocaleString() || '0'}
- Financial Runway: ${runway ? runway + ' months' : 'Unknown'}
- VA Disability Income: $${profile.va_disability?.toLocaleString() || '0'}/month
- Target Annual Salary: $${profile.target_annual_income?.toLocaleString() || 'Not specified'}
` : 'No profile data available.'

    const urgencyNote = daysToSep !== null && daysToSep >= 0 && daysToSep < 60
      ? `URGENCY: Separates in ${daysToSep} days — compress Phase 1 timelines, prioritize income fast.`
      : daysToSep !== null && daysToSep < 0
      ? `NOTE: Already separated. Skip prep tasks — focus on immediate job search execution.`
      : ''

    const clearanceNote = profile?.clearance && profile.clearance !== 'None'
      ? `CLEARANCE ASSET: ${profile.clearance} clearance is a major differentiator. Prioritize ClearanceJobs.com, defense contractors (Booz Allen, CACI, Leidos, SAIC, Raytheon, Northrop Grumman), and federal agencies.`
      : ''

    const financialNote = runway
      ? `FINANCIAL CONTEXT: ${runway} months runway. ${parseFloat(runway) < 3 ? 'CRITICAL urgency — accept qualifying offers quickly.' : parseFloat(runway) < 6 ? 'Moderate urgency — conclude search within 60 days.' : 'Good runway — can be selective about fit and salary.'}`
      : ''

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are an expert military transition specialist. Create a hyper-personalized 90-day plan for this specific veteran.

VETERAN PROFILE:
${profileContext}
${urgencyNote ? urgencyNote + '\n' : ''}${clearanceNote ? clearanceNote + '\n' : ''}${financialNote ? financialNote + '\n' : ''}
INSTRUCTIONS — every task must be specific, not generic:
- Reference their actual MOS (${profile?.mos || 'unknown'}) and how those skills map to ${profile?.desired_job || 'civilian roles'}
- Name real companies in ${profile?.desired_industry || 'their target industry'}, real certifications, real LinkedIn groups
- If clearance exists, include clearance-specific job boards in resources
- Reference their target location (${[profile?.target_city, profile?.target_state].filter(Boolean).join(', ') || 'not specified'}) where relevant for networking/cost
- Financial plan must use their actual numbers above

Generate a detailed, actionable 90-day plan. Return ONLY this JSON structure, no other text:

{
  "summary": "2-3 sentence personalized overview of the plan",
  "phases": [
    {
      "phase": 1,
      "title": "Phase 1: Foundation (Days 1-30)",
      "focus": "One sentence describing the main focus",
      "weeks": [
        {
          "week": 1,
          "title": "Week title",
          "tasks": ["specific actionable task", "specific actionable task", "specific actionable task"]
        },
        {
          "week": 2,
          "title": "Week title",
          "tasks": ["task", "task", "task"]
        },
        {
          "week": 3,
          "title": "Week title",
          "tasks": ["task", "task", "task"]
        },
        {
          "week": 4,
          "title": "Week title",
          "tasks": ["task", "task", "task"]
        }
      ],
      "milestone": "What success looks like at end of Phase 1"
    },
    {
      "phase": 2,
      "title": "Phase 2: Active Search (Days 31-60)",
      "focus": "One sentence",
      "weeks": [
        { "week": 5, "title": "Week title", "tasks": ["task", "task", "task"] },
        { "week": 6, "title": "Week title", "tasks": ["task", "task", "task"] },
        { "week": 7, "title": "Week title", "tasks": ["task", "task", "task"] },
        { "week": 8, "title": "Week title", "tasks": ["task", "task", "task"] }
      ],
      "milestone": "What success looks like at end of Phase 2"
    },
    {
      "phase": 3,
      "title": "Phase 3: Decision & Launch (Days 61-90)",
      "focus": "One sentence",
      "weeks": [
        { "week": 9, "title": "Week title", "tasks": ["task", "task", "task"] },
        { "week": 10, "title": "Week title", "tasks": ["task", "task", "task"] },
        { "week": 11, "title": "Week title", "tasks": ["task", "task", "task"] },
        { "week": 12, "title": "Week title", "tasks": ["task", "task", "task"] }
      ],
      "milestone": "What success looks like at end of Phase 3"
    }
  ],
  "keyResources": [
    "Specific resource relevant to their MOS/background",
    "Another specific resource",
    "Another specific resource",
    "Another specific resource"
  ],
  "financialPlan": "2-3 sentences about managing finances during transition based on their profile",
  "topPriority": "The single most important thing they should do first"
}`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format')
    }

    let jsonText = content.text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '')
    }

    const plan = JSON.parse(jsonText)

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Plan generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate plan', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
