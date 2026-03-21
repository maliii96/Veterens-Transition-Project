import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { checkAndIncrementUsage, usageLimitResponse } from '@/lib/usageLimits'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface AssessmentResult {
  overallFit: number // 0-100
  skillsMatch: {
    score: number
    matched: string[]
    missing: string[]
    transferable: string[]
  }
  experienceMatch: {
    score: number
    relevantYears: number
    levelMatch: boolean
    analysis: string
  }
  stabilityScore: {
    score: number // 0-100
    averageTenure: number // in months
    jobChangesCount: number
    redFlags: string[]
    positiveIndicators: string[]
    analysis: string
  }
  cultureFit: {
    score: number
    analysis: string
  }
  recommendations: string[]
  strengths: string[]
  concerns: string[]
  detailedAnalysis: string
}

async function assessCandidateWithClaude(
  resumeData: any,
  jobData: any
): Promise<AssessmentResult> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `You are a military-to-civilian career transition recruiter and HR analyst who specializes in evaluating veteran candidates. You deeply understand how military service, deployments, duty station changes, rank progression, and military job titles translate to civilian roles.

IMPORTANT MILITARY CONTEXT — READ BEFORE ANALYZING:
- Military members change duty stations every 2-4 years by orders — this is NOT job hopping. Treat each military assignment as a promotion/transfer within the same "organization" (the U.S. Military), not as job hopping.
- Military service entries (active duty, National Guard, Reserve) should be treated as ONE organization — the branch of service — with multiple internal roles/assignments.
- Deployments (OIF, OEF, GWOT, etc.) are high-value leadership and operational experience, often equivalent to senior civilian management roles under high pressure.
- Rank progression (E-1 to E-9, O-1 to O-10) signals consistent high performance — treat promotions as strong positive indicators.
- Military awards (ARCOM, MSM, BSM, Purple Heart, CIB, etc.) signal above-average performance evaluations.
- MOS/rate/AFSC codes represent specialized training worth years of civilian equivalent. Translate them to civilian skills.
- Security clearances (Secret, TS, TS/SCI) are major assets — treat them as a premium skill worth flagging positively.
- Military resumes often list units (1st Infantry Division, Naval Air Station, etc.) as "company" — these are duty stations, not separate employers.
- Leadership at junior enlisted/officer ranks (E-6 supervising 10-20 people) is extraordinary compared to civilian peers at the same age.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB REQUIREMENTS:
${JSON.stringify(jobData, null, 2)}

Analyze the candidate's military background against the civilian job requirements and provide an accurate assessment that correctly interprets military service.

{
  "overallFit": <number 0-100>,
  "skillsMatch": {
    "score": <number 0-100>,
    "matched": ["civilian skills and military competencies that directly match job requirements"],
    "missing": ["required skills the candidate genuinely lacks after considering military equivalents"],
    "transferable": ["military skills that transfer to missing civilian requirements with minimal training"]
  },
  "experienceMatch": {
    "score": <number 0-100>,
    "relevantYears": <number of years of relevant experience, counting military service in equivalent roles>,
    "levelMatch": <boolean - does their military leadership level match the job level>,
    "analysis": "detailed analysis that correctly translates military experience to civilian equivalents"
  },
  "stabilityScore": {
    "score": <number 0-100, where higher means more stable — military duty station changes must score HIGH not low>,
    "averageTenure": <average months per assignment — treat all military service as one organization>,
    "jobChangesCount": <number of actual civilian employer changes only, NOT military duty station changes>,
    "redFlags": ["only list genuine civilian red flags — do NOT flag duty station changes or military branch transfers"],
    "positiveIndicators": ["rank progression", "long military service", "deployments", "security clearance", "awards", "promotions within service"],
    "analysis": "stability assessment that correctly treats military service as a single stable career track"
  },
  "cultureFit": {
    "score": <number 0-100>,
    "analysis": "assessment considering that military veterans bring discipline, mission-focus, team orientation, and high-pressure decision-making experience"
  },
  "recommendations": ["specific actionable recommendations for this veteran candidate"],
  "strengths": ["key strengths — highlight military leadership, clearance, deployments, specific MOS skills relevant to this role"],
  "concerns": ["genuine skill gaps or concerns — not military service patterns"],
  "detailedAnalysis": "comprehensive 2-3 paragraph narrative that properly contextualizes military service, translates rank/MOS to civilian equivalents, and gives an honest assessment of fit"
}

STABILITY SCORING GUIDELINES FOR MILITARY CANDIDATES:
- 90-100: Long military service (6+ years), consistent rank progression, honorable discharge
- 75-89: Military service with normal duty station rotations, good progression
- 60-74: Mixed military and civilian with some short civilian stints
- 40-59: Short military service (<2 years) or civilian job hopping post-service
- 0-39: Genuine civilian job hopping with no military explanation

NEVER penalize a veteran for duty station changes — these are orders, not choices. ALWAYS recognize military service as a single stable career track.

Return ONLY the JSON object, no additional text.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response format from Claude')
  }

  let jsonText = content.text.trim()
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '')
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '')
  }

  try {
    return JSON.parse(jsonText)
  } catch {
    // Extract JSON object from response if it contains extra text
    const match = jsonText.match(/\{[\s\S]*\}/)
    if (match) {
      return JSON.parse(match[0])
    }
    throw new Error('Failed to parse assessment response as JSON')
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token from Authorization header
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

    const { resumeId, jobId } = await request.json()

    if (!resumeId || !jobId) {
      return NextResponse.json(
        { error: 'Missing resumeId or jobId' },
        { status: 400 }
      )
    }

    // Check usage limit before running expensive Claude call
    const usage = await checkAndIncrementUsage(adminClient, user.id, 'assessment')
    if (!usage.allowed) {
      return NextResponse.json(
        usageLimitResponse(usage.current, usage.limit, usage.isPaid, 'assessment'),
        { status: 429 }
      )
    }

    // Fetch resume data
    const { data: resume, error: resumeError } = await adminClient
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single()

    if (resumeError || !resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      )
    }

    // Fetch job data
    const { data: job, error: jobError } = await adminClient
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Perform assessment with Claude
    const assessmentResult = await assessCandidateWithClaude(
      resume.parsed_data,
      job.parsed_data
    )

    // Store assessment in database
    const { data: assessment, error: insertError } = await adminClient
      .from('assessments')
      .insert({
        user_id: user.id,
        resume_id: resumeId,
        job_id: jobId,
        overall_fit_score: assessmentResult.overallFit,
        skills_match_score: assessmentResult.skillsMatch.score,
        experience_match_score: assessmentResult.experienceMatch.score,
        stability_score: assessmentResult.stabilityScore.score,
        culture_fit_score: assessmentResult.cultureFit.score,
        assessment_data: assessmentResult,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save assessment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      assessment,
      result: assessmentResult,
    })
  } catch (error) {
    console.error('Assessment error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create assessment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
