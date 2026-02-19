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

    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    // Check usage limit before running expensive Claude call
    const usage = await checkAndIncrementUsage(adminClient, user.id, 'chat')
    if (!usage.allowed) {
      return NextResponse.json(
        usageLimitResponse(usage.current, usage.limit, usage.isPaid, 'chat'),
        { status: 429 }
      )
    }

    // Fetch user profile for context
    const { data: profile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const profileContext = profile ? `
USER PROFILE:
- Name: ${profile.name || 'Not provided'}
- Branch: ${profile.branch || 'Not provided'}
- MOS/Rate: ${profile.mos || 'Not provided'}
- Separation Date: ${profile.separation_date || 'Not provided'}
- Location: ${profile.location || 'Not provided'}
- Security Clearance: ${profile.clearance || 'Not provided'}
- Monthly Expenses: $${profile.monthly_expenses?.toLocaleString() || '0'}
- Current Savings: $${profile.current_savings?.toLocaleString() || '0'}
- VA Disability: $${profile.va_disability?.toLocaleString() || '0'}/month
` : 'No profile data available.'

    const systemPrompt = `You are SITREP AI, a specialized career transition advisor for military veterans. You provide direct, practical guidance on transitioning from military to civilian careers.

${profileContext}

Your expertise includes:
- Translating military experience to civilian resume language
- Identifying civilian roles that match military skills and MOSs
- Salary negotiation and compensation benchmarking
- Understanding GS (government service) positions and defense contractor roles
- Financial planning during transition (leveraging VA benefits, severance, GI Bill)
- Evaluating job offers, company stability, and career trajectory
- Networking strategies for veterans

Be direct and tactical — veterans appreciate straight answers, not corporate fluff. Reference the user's specific profile data when relevant. Keep responses concise but thorough.`

    // Build message history for multi-turn conversation
    const messages: Anthropic.MessageParam[] = [
      ...(history || []),
      { role: 'user', content: message }
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    })

    const reply = response.content[0]
    if (reply.type !== 'text') {
      throw new Error('Unexpected response format')
    }

    return NextResponse.json({ reply: reply.text })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to get response', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
