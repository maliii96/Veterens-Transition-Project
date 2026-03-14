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
    const usage = await checkAndIncrementUsage(adminClient, user.id, 'diagnostic')
    if (!usage.allowed) {
      return NextResponse.json(
        usageLimitResponse(usage.current, usage.limit, usage.isPaid, 'diagnostic'),
        { status: 429 }
      )
    }

    // Fetch user profile
    const { data: profile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Fetch latest resume
    const { data: resume } = await adminClient
      .from('resumes')
      .select('parsed_data, file_name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const resumeText = resume?.parsed_data
      ? JSON.stringify(resume.parsed_data, null, 2)
      : 'No resume uploaded'

    const profileContext = `
TARGET ROLE: ${profile?.desired_job || 'Not specified'}
TARGET INDUSTRY: ${profile?.desired_industry || 'Not specified'}
MOS/RATE: ${profile?.mos || 'Not provided'}
BRANCH: ${profile?.branch || 'Not provided'}
CLEARANCE: ${profile?.clearance || 'None'}
LOCATION: ${[profile?.target_city, profile?.target_state].filter(Boolean).join(', ') || 'Not specified'}
TARGET SALARY: $${profile?.target_annual_income?.toLocaleString() || 'Not specified'}

RESUME DATA:
${resumeText}
`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `You are a senior recruiter and military-to-civilian career transition expert. Act as if you're reviewing this veteran's application — analyze their resume against their target role and identify the most likely reasons they are NOT receiving interview callbacks.

VETERAN DATA:
${profileContext}

Be specific and actionable. Reference actual content from their resume. Return ONLY this JSON:

{
  "overallScore": <number 1-10, where 10 means highly competitive>,
  "verdict": "One sentence summary of the single biggest problem holding them back",
  "issues": [
    {
      "category": "Positioning" | "Keywords" | "Experience Framing" | "Role Mismatch" | "Format",
      "severity": "critical" | "moderate" | "minor",
      "finding": "Specific issue found — reference actual resume content",
      "fix": "Exactly what to change, with example language if possible"
    }
  ],
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "strongPoints": ["strength1", "strength2"],
  "quickWins": ["Immediate action 1", "Immediate action 2", "Immediate action 3"]
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

    const diagnostic = JSON.parse(jsonText)
    return NextResponse.json({ diagnostic })
  } catch (error) {
    console.error('Diagnostic error:', error)
    return NextResponse.json(
      { error: 'Failed to run diagnostic', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
