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
        content: `You are an expert technical recruiter and HR analyst. Analyze this candidate's resume against the job requirements and provide a detailed assessment.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB REQUIREMENTS:
${JSON.stringify(jobData, null, 2)}

Provide a comprehensive assessment with the following JSON structure:

{
  "overallFit": <number 0-100>,
  "skillsMatch": {
    "score": <number 0-100>,
    "matched": ["skills that match job requirements"],
    "missing": ["required skills the candidate lacks"],
    "transferable": ["skills that could transfer to missing requirements"]
  },
  "experienceMatch": {
    "score": <number 0-100>,
    "relevantYears": <number of years of relevant experience>,
    "levelMatch": <boolean - does their level match the job level>,
    "analysis": "detailed analysis of experience fit"
  },
  "stabilityScore": {
    "score": <number 0-100, where higher means more stable>,
    "averageTenure": <average months per job>,
    "jobChangesCount": <number of job changes>,
    "redFlags": [
      "frequent job hopping (< 1 year stints)",
      "unexplained employment gaps",
      "pattern of lateral moves",
      "etc"
    ],
    "positiveIndicators": [
      "consistent career progression",
      "long tenures at companies",
      "promotions within same company",
      "etc"
    ],
    "analysis": "detailed stability assessment"
  },
  "cultureFit": {
    "score": <number 0-100>,
    "analysis": "assessment of potential culture fit based on work history and company types"
  },
  "recommendations": [
    "specific recommendations for hiring decision"
  ],
  "strengths": [
    "key strengths of this candidate"
  ],
  "concerns": [
    "areas of concern or risk"
  ],
  "detailedAnalysis": "comprehensive narrative assessment (2-3 paragraphs)"
}

STABILITY SCORING GUIDELINES:
- 90-100: Highly stable (3+ years average tenure, clear progression)
- 75-89: Stable (2-3 years average, reasonable progression)
- 60-74: Moderate (1.5-2 years average, some concerns)
- 40-59: Concerning (1-1.5 years average, pattern of short stints)
- 0-39: High risk (<1 year average, frequent job hopping)

Consider context like:
- Industry norms (tech vs finance vs retail)
- Career stage (early career may have more movement)
- Company shutdowns or layoffs
- Contract vs permanent positions
- Promotions and internal transfers

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
