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
    const usage = await checkAndIncrementUsage(adminClient, user.id, 'role_clarity')
    if (!usage.allowed) {
      return NextResponse.json(
        usageLimitResponse(usage.current, usage.limit, usage.isPaid, 'role_clarity'),
        { status: 429 }
      )
    }

    // Fetch user profile
    const { data: profile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Fetch latest resume for skills context
    const { data: resume } = await adminClient
      .from('resumes')
      .select('parsed_data')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const resumeSummary = resume?.parsed_data
      ? JSON.stringify(resume.parsed_data, null, 2).substring(0, 2000)
      : 'No resume uploaded'

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `You are a military-to-civilian career mapping expert. Based on this veteran's complete profile, identify the most realistic and high-value civilian job titles they should target. Eliminate roles that are misaligned or too broad. Define a focused job search direction.

VETERAN PROFILE:
- Branch: ${profile?.branch || 'Not provided'}
- MOS/Rate/AFSC: ${profile?.mos || 'Not provided'}
- Security Clearance: ${profile?.clearance || 'None'}
- Current Desired Job: ${profile?.desired_job || 'Not specified'}
- Target Industry: ${profile?.desired_industry || 'Not specified'}
- Target Location: ${[profile?.target_city, profile?.target_state].filter(Boolean).join(', ') || 'Not specified'}
- Target Salary: $${profile?.target_annual_income?.toLocaleString() || 'Not specified'}
- Work Type: ${profile?.work_type || 'No preference'}

RESUME SUMMARY:
${resumeSummary}

Return ONLY this JSON:

{
  "summary": "2-3 sentence overview of their strongest career direction",
  "topRoles": [
    {
      "title": "Exact civilian job title",
      "fitScore": <number 1-10>,
      "salaryRange": "$XX,000 - $XX,000",
      "whyFit": "One sentence on why their military background maps to this role",
      "searchTerms": ["LinkedIn search term 1", "Indeed search term 2"],
      "topEmployers": ["Company 1", "Company 2", "Company 3"]
    }
  ],
  "avoidRoles": [
    {
      "title": "Job title to avoid",
      "reason": "Why this is a poor fit despite seeming relevant"
    }
  ],
  "skillGaps": ["Skill or certification they should pursue for their top roles"],
  "focusStatement": "One sentence they can use as their job search mission statement"
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

    const roleClarity = JSON.parse(jsonText)
    return NextResponse.json({ roleClarity })
  } catch (error) {
    console.error('Role clarity error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze roles', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
