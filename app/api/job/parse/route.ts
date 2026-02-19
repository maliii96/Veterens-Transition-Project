import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface ParsedJob {
  jobTitle: string
  company: string
  location?: string
  remoteType?: 'remote' | 'hybrid' | 'onsite'
  salaryRange?: {
    min?: number
    max?: number
    currency?: string
  }
  description: string
  requirements: {
    required: string[]
    preferred: string[]
  }
  responsibilities: string[]
  skills: string[]
  experienceLevel: string
  employmentType?: string
}

async function fetchJobPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0',
    },
  })

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('This website blocks automated requests. Please try a different job URL or copy-paste the job description manually.')
    }
    throw new Error(`Failed to fetch job page: ${response.statusText}`)
  }

  return await response.text()
}

async function parseJobWithClaude(jobHtml: string, url: string): Promise<ParsedJob> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are a job posting parser. Extract structured information from this job posting HTML and return it as JSON.

URL: ${url}

HTML:
${jobHtml.slice(0, 50000)}

Return a JSON object with this exact structure:
{
  "jobTitle": "string",
  "company": "string",
  "location": "string (optional)",
  "remoteType": "remote | hybrid | onsite (optional)",
  "salaryRange": {
    "min": number (optional),
    "max": number (optional),
    "currency": "USD, EUR, etc (optional)"
  },
  "description": "string - full job description",
  "requirements": {
    "required": ["array of required qualifications"],
    "preferred": ["array of preferred qualifications"]
  },
  "responsibilities": ["array of key responsibilities"],
  "skills": ["array of required technical and soft skills"],
  "experienceLevel": "Entry, Mid, Senior, Lead, etc",
  "employmentType": "Full-time, Part-time, Contract, etc (optional)"
}

Return ONLY the JSON object, no additional text.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response format from Claude')
  }

  // Strip markdown code blocks if present
  let jsonText = content.text.trim()
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '')
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '')
  }

  return JSON.parse(jsonText)
}

export async function POST(request: NextRequest) {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization')
    let accessToken = authHeader?.replace('Bearer ', '')

    // If no header, try cookies
    if (!accessToken) {
      // Check all cookies for Supabase auth token
      const cookies = request.cookies
      const allCookies = cookies.getAll()

      for (const cookie of allCookies) {
        if (cookie.name.includes('auth-token')) {
          try {
            const parsed = JSON.parse(cookie.value)
            accessToken = parsed.access_token || parsed
            break
          } catch {
            accessToken = cookie.value
            break
          }
        }
      }
    }

    if (!accessToken) {
      return NextResponse.json({
        error: 'Unauthorized',
        details: 'Please log in again'
      }, { status: 401 })
    }

    // Use admin client to verify the user
    const adminClient = createAdminClient()
    const { data: { user }, error: userError } = await adminClient.auth.getUser(accessToken)

    if (userError || !user) {
      return NextResponse.json({
        error: 'Unauthorized',
        details: 'Session expired - please log in again'
      }, { status: 401 })
    }

    const { url, text } = await request.json()

    if (!url && !text) {
      return NextResponse.json({ error: 'No URL or job description provided' }, { status: 400 })
    }

    let jobContent: string
    let jobUrl = url || 'pasted-job-description'

    if (text) {
      // Use pasted text directly - no scraping needed
      jobContent = text
    } else {
      // Validate URL
      try {
        new URL(url)
      } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
      }

      // Fetch job page HTML
      jobContent = await fetchJobPage(url)
    }

    // Parse with Claude
    const parsedData = await parseJobWithClaude(jobContent, jobUrl)

    // Store in database (adminClient already created above for auth)
    const { data: job, error: insertError } = await adminClient
      .from('jobs')
      .insert({
        user_id: user.id,
        url: jobUrl,
        parsed_data: parsedData,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save job' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      job,
      parsed: parsedData,
    })
  } catch (error) {
    console.error('Job parse error:', error)

    // Handle rate limit errors specifically
    if (error instanceof Error && error.message.includes('rate_limit_error')) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          details: 'Your Anthropic API rate limit has been reached. Please wait a moment or add credits at console.anthropic.com/settings/billing'
        },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to parse job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
