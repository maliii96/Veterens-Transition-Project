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

  const militaryParsingInstructions = `
CRITICAL MILITARY RESUME PARSING RULES:
- If this is a military resume, the "company" field for military positions should be the unit/command (e.g., "1st Battalion, 75th Ranger Regiment" or "USS Enterprise (CVN-65)") — preserve exact unit names
- Military job titles should include rank and role (e.g., "Staff Sergeant (E-6) / Squad Leader" or "Captain / Company Commander")
- Treat each military assignment/duty station as a separate experience entry even if under the same branch
- Extract MOS/rate/AFSC codes and include them in the title or description (e.g., "11B Infantryman", "IT2 Information Systems Technician", "3D0X2 Cyber Systems Operations")
- List security clearance as a certification (e.g., "Top Secret/SCI Clearance", "Secret Clearance")
- Military awards and decorations belong in certifications (e.g., "Army Commendation Medal (ARCOM)", "Combat Infantryman Badge (CIB)", "Navy Achievement Medal")
- Deployments should be captured in the description (e.g., "Deployed to Afghanistan (OEF), 2018-2019")
- Translate military abbreviations in descriptions to their full meaning followed by the abbreviation in parentheses
- Skills should include categories like: Leadership & Management, Operations & Logistics, Intelligence & Analysis, Communications, Medical/Healthcare, Technical/IT, Security & Law Enforcement, Aviation, Engineering — based on their MOS
- For the summary field, write a civilian-focused 2-3 sentence professional summary that translates their military background into civilian value
`

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
      text: `You are a specialized military resume parser who understands military service, MOS codes, rank structures, unit designations, military awards, and how they translate to civilian equivalents.

${militaryParsingInstructions}

Extract all information from this resume and return it as JSON with this exact structure:

${schemaText}`,
    },
  ] : `You are a specialized military resume parser who understands military service, MOS codes, rank structures, unit designations, military awards, and how they translate to civilian equivalents.

${militaryParsingInstructions}

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

    if (!accessToken) {
      return NextResponse.json({
        error: 'Unauthorized',
        details: 'No authentication token provided'
      }, { status: 401 })
    }

    // Use admin client to verify the user
    const adminClient = createAdminClient()
    const { data: { user }, error: userError } = await adminClient.auth.getUser(accessToken)

    if (userError || !user) {
      return NextResponse.json({
        error: 'Unauthorized',
        details: userError?.message || 'Invalid authentication token'
      }, { status: 401 })
    }

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

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only PDF and plain text files are supported' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

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
