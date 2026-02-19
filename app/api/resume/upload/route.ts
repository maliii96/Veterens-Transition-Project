import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { checkAndIncrementUsage, usageLimitResponse } from '@/lib/usageLimits'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface ParsedResume {
  fullName: string
  email: string
  phone?: string
  location?: string
  summary?: string
  experience: Array<{
    company: string
    title: string
    startDate: string
    endDate?: string
    current: boolean
    description: string
    achievements: string[]
  }>
  education: Array<{
    institution: string
    degree: string
    field: string
    graduationDate?: string
  }>
  skills: Array<{
    category: string
    items: string[]
  }>
  certifications?: Array<{
    name: string
    issuer: string
    date?: string
  }>
}

async function parseResumeWithClaude(fileBuffer: Buffer, mimeType: string): Promise<ParsedResume> {
  // Claude can read PDFs directly!
  const isPDF = mimeType === 'application/pdf'

  const schemaText = `{
  "fullName": "string",
  "email": "string",
  "phone": "string (optional)",
  "location": "string (optional)",
  "summary": "string (optional)",
  "experience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "YYYY-MM or YYYY format",
      "endDate": "YYYY-MM or YYYY format (optional if current)",
      "current": boolean,
      "description": "string",
      "achievements": ["string array of key achievements"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "graduationDate": "YYYY or YYYY-MM (optional)"
    }
  ],
  "skills": [
    {
      "category": "e.g., Programming Languages, Tools, Soft Skills",
      "items": ["array of skills in this category"]
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "YYYY or YYYY-MM (optional)"
    }
  ]
}

Return ONLY the JSON object, no additional text.`

  const content: any = isPDF ? [
    {
      type: 'document' as const,
      source: {
        type: 'base64' as const,
        media_type: 'application/pdf' as const,
        data: fileBuffer.toString('base64'),
      },
    },
    {
      type: 'text' as const,
      text: `Extract all information from this resume and return it as JSON with this exact structure:\n\n${schemaText}`,
    },
  ] : `You are a resume parser. Extract structured information from this resume and return it as JSON.

Resume:
${fileBuffer.toString('utf-8')}

Return a JSON object with this exact structure:
${schemaText}`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: isPDF ? content : [{ type: 'text', text: content }],
      },
    ],
  })

  const responseContent = message.content[0]
  if (responseContent.type !== 'text') {
    throw new Error('Unexpected response format from Claude')
  }

  // Strip markdown code blocks if present
  let jsonText = responseContent.text.trim()
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '')
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '')
  }

  return JSON.parse(jsonText)
}

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    console.log('[Resume Upload] Auth header present:', !!authHeader)
    console.log('[Resume Upload] Access token present:', !!accessToken)

    if (!accessToken) {
      console.log('[Resume Upload] No access token found')
      return NextResponse.json({
        error: 'Unauthorized',
        details: 'No authentication token provided'
      }, { status: 401 })
    }

    // Use admin client to verify the user
    const adminClient = createAdminClient()
    const { data: { user }, error: userError } = await adminClient.auth.getUser(accessToken)

    console.log('[Resume Upload] User verification:', {
      hasUser: !!user,
      hasError: !!userError,
      errorMessage: userError?.message
    })

    if (userError || !user) {
      console.log('[Resume Upload] User verification failed:', userError)
      return NextResponse.json({
        error: 'Unauthorized',
        details: userError?.message || 'Invalid authentication token'
      }, { status: 401 })
    }

    console.log('[Resume Upload] User authenticated:', user.id)

    // Check usage limit before running expensive Claude call
    const usage = await checkAndIncrementUsage(adminClient, user.id, 'resume')
    if (!usage.allowed) {
      return NextResponse.json(
        usageLimitResponse(usage.current, usage.limit, usage.isPaid, 'resume'),
        { status: 429 }
      )
    }

    // Get the uploaded file
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    console.log('[Resume Upload] File type:', file.type, 'Size:', file.size)

    // Parse resume with Claude (handles PDFs directly!)
    const parsedData = await parseResumeWithClaude(fileBuffer, file.type)

    // For raw_text storage, extract text if PDF, otherwise use buffer
    let rawText = ''
    if (file.type === 'application/pdf') {
      // For PDFs, we'll store a simplified version
      rawText = `PDF Resume: ${parsedData.fullName || file.name}`
    } else {
      rawText = fileBuffer.toString('utf-8')
    }

    // Clean raw text - remove null bytes that cause PostgreSQL errors
    const cleanedText = rawText.replace(/\u0000/g, '')

    // Store in database (adminClient already created above for auth)
    const { data: resume, error: insertError } = await adminClient
      .from('resumes')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        raw_text: cleanedText.substring(0, 50000), // Limit size to avoid huge text fields
        parsed_data: parsedData,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save resume' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      resume,
      parsed: parsedData,
    })
  } catch (error) {
    console.error('Resume upload error:', error)

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
      { error: 'Failed to process resume', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
