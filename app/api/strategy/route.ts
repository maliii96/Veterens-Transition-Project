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
    const usage = await checkAndIncrementUsage(adminClient, user.id, 'strategy')
    if (!usage.allowed) {
      return NextResponse.json(
        usageLimitResponse(usage.current, usage.limit, usage.isPaid, 'strategy'),
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

    const daysToSep = profile?.separation_date
      ? Math.ceil((new Date(profile.separation_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `You are a military transition job search strategist. Create a structured, personalized weekly job application game plan for this veteran. Be specific — reference their actual background, target roles, and location.

VETERAN PROFILE:
- Name: ${profile?.name || 'Veteran'}
- Branch: ${profile?.branch || 'Not provided'}
- MOS/Rate: ${profile?.mos || 'Not provided'}
- Target Role: ${profile?.desired_job || 'Not specified'}
- Target Industry: ${profile?.desired_industry || 'Not specified'}
- Target Location: ${[profile?.target_city, profile?.target_state].filter(Boolean).join(', ') || 'Flexible'}
- Target Salary: $${profile?.target_annual_income?.toLocaleString() || 'Not specified'}
- Security Clearance: ${profile?.clearance || 'None'}
- Separation Date: ${profile?.separation_date || 'Not provided'}${daysToSep !== null ? ` (${daysToSep > 0 ? daysToSep + ' days away' : 'already separated'})` : ''}
- Financial Runway: ${runway ? runway + ' months' : 'Unknown'}
- Work Type: ${profile?.work_type || 'No preference'}

Return ONLY this JSON:

{
  "summary": "2-3 sentence personalized strategy overview",
  "weeklyTargets": {
    "applicationsPerWeek": <number>,
    "networkingContactsPerWeek": <number>,
    "followUpsPerWeek": <number>
  },
  "priorityTiers": [
    {
      "tier": "Tier 1: Perfect Fit",
      "description": "Criteria for Tier 1 roles specific to their background",
      "customizationLevel": "Full tailoring — custom cover letter, resume keywords matched",
      "exampleRoles": ["specific role 1", "specific role 2"]
    },
    {
      "tier": "Tier 2: Strong Match",
      "description": "Criteria for Tier 2",
      "customizationLevel": "Moderate — adjust summary and top skills",
      "exampleRoles": ["role 1", "role 2"]
    },
    {
      "tier": "Tier 3: Volume Plays",
      "description": "Criteria for Tier 3",
      "customizationLevel": "Light — standard resume, quick apply",
      "exampleRoles": ["role 1", "role 2"]
    }
  ],
  "weeklySchedule": {
    "monday": "Specific tasks for Monday",
    "tuesday": "Specific tasks for Tuesday",
    "wednesday": "Specific tasks for Wednesday",
    "thursday": "Specific tasks for Thursday",
    "friday": "Specific tasks for Friday",
    "weekend": "Weekend activities"
  },
  "platformStrategy": [
    {
      "platform": "Platform name (LinkedIn, Indeed, ClearanceJobs, etc.)",
      "approach": "Specific strategy for this platform",
      "timePerWeek": "X hours"
    }
  ],
  "trackingFramework": {
    "columns": ["Column 1", "Column 2", "Column 3", "Column 4", "Column 5"],
    "instructions": "How to set up and use the tracker"
  },
  "urgencyNote": "Personalized note based on their timeline and financial situation"
}`,
      }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response format')

    let jsonText = content.text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '')
    }

    const strategy = JSON.parse(jsonText)
    return NextResponse.json({ strategy })
  } catch (error) {
    console.error('Strategy error:', error)
    return NextResponse.json(
      { error: 'Failed to build strategy', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
