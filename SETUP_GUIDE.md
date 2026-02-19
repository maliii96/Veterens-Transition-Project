# SITREP Platform Setup Guide

## Overview
SITREP is a job application assessment platform that uses AI to analyze resumes, parse job postings, and provide comprehensive fit scoring with stability analysis.

## Features Implemented

### 1. **Resume Upload with AI Parsing** ✅
- Upload resumes in various formats (TXT, PDF, DOC, DOCX)
- AI-powered parsing using Claude Sonnet 4.5
- Extracts: contact info, experience, education, skills, certifications
- Stores parsed data in structured format

### 2. **Job URL Parsing** ✅
- Fetches job postings from any URL
- AI-powered extraction of job requirements
- Parses: title, company, requirements, responsibilities, skills, salary

### 3. **Assessment Engine with Stability Scoring** ✅
- **Overall Fit Score** (0-100): Comprehensive match assessment
- **Skills Match**: Matched vs missing skills analysis
- **Experience Match**: Years and level comparison
- **Stability Score**: Career stability analysis including:
  - Average tenure calculation
  - Job change frequency
  - Red flags (job hopping, gaps)
  - Positive indicators (promotions, long tenures)
- **Culture Fit**: Work history pattern analysis
- Detailed recommendations and insights

## Setup Instructions

### 1. Environment Variables

Update your `.env.local` file with your Anthropic API key:

```env
# Get your API key from https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 2. Database Migration

You need to create the `jobs` table in your Supabase database. Follow these steps:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `supabase/migrations/002_add_jobs_table.sql`
6. Click **Run** or press `Ctrl/Cmd + Enter`

The migration creates:
- `jobs` table for storing parsed job postings
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

### 3. Install Dependencies

```bash
npm install
# The @anthropic-ai/sdk package is already installed
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## Using the Platform

### Assessment Page
Navigate to http://localhost:3000/assessment to use the full workflow:

#### Step 1: Upload Resume
1. Click "Choose File" and select a resume
2. Click "Upload & Parse Resume"
3. Wait for AI parsing (usually 3-10 seconds)
4. You'll see confirmation with name and email

#### Step 2: Parse Job Posting
1. Enter a job posting URL (e.g., from LinkedIn, Indeed, company careers page)
2. Click "Parse Job URL"
3. Wait for AI parsing (usually 5-15 seconds)
4. You'll see confirmation with job title and company

#### Step 3: Generate Assessment
1. Click "Create Assessment"
2. Wait for comprehensive AI analysis (usually 10-20 seconds)
3. View detailed results including:
   - Overall fit score
   - Individual metric scores
   - Stability analysis with tenure and job changes
   - Strengths and concerns
   - Detailed recommendations

## API Endpoints

### Resume Upload
**POST** `/api/resume/upload`
- Body: FormData with `file` field
- Returns: Parsed resume data and database ID

### Job Parsing
**POST** `/api/job/parse`
- Body: `{ "url": "https://..." }`
- Returns: Parsed job data and database ID

### Assessment Creation
**POST** `/api/assessment/create`
- Body: `{ "resumeId": "uuid", "jobId": "uuid" }`
- Returns: Complete assessment with all scores and analysis

## Database Schema

### Tables Created

1. **users** - Authentication (Supabase managed)
2. **profiles** - User profile information
3. **resumes** - Uploaded resumes and parsed data
4. **jobs** - Parsed job postings
5. **assessments** - Generated assessments with scores

## Stability Scoring System

The stability score (0-100) evaluates career stability:

- **90-100**: Highly stable (3+ years average tenure)
- **75-89**: Stable (2-3 years average)
- **60-74**: Moderate (1.5-2 years average)
- **40-59**: Concerning (1-1.5 years average)
- **0-39**: High risk (<1 year average)

Factors considered:
- Average tenure per job
- Number of job changes
- Employment gaps
- Career progression
- Promotions within companies
- Industry norms
- Career stage context

## Tech Stack

- **Frontend**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Claude Sonnet 4.5 (Anthropic API)
- **Deployment**: Ready for Vercel

## Next Steps

1. **Profile Management**: Complete the profile pages
2. **Resume Storage**: Add file upload to cloud storage (Supabase Storage)
3. **PDF Support**: Add PDF parsing library for better resume extraction
4. **Assessment History**: View past assessments
5. **Export Reports**: Generate PDF reports of assessments
6. **Batch Processing**: Assess multiple resumes against one job
7. **Analytics Dashboard**: Track assessment metrics over time

## Troubleshooting

### "Unauthorized" errors
- Make sure you're logged in
- Check that your session hasn't expired

### "Failed to parse resume/job"
- Verify your ANTHROPIC_API_KEY is set correctly
- Check API key has sufficient credits
- Ensure file format is supported (TXT works best initially)

### Database errors
- Verify you ran the migration SQL in Supabase
- Check RLS policies are enabled
- Ensure you're authenticated

### Job parsing fails
- Some websites block automated fetching
- Try a different job posting URL
- Check that the URL is publicly accessible

## Cost Considerations

Claude API usage:
- Resume parsing: ~1,000-3,000 tokens per request
- Job parsing: ~2,000-5,000 tokens per request (depends on page size)
- Assessment: ~3,000-8,000 tokens per request

Estimated cost per complete assessment: $0.01-0.03

## Support

For issues or questions:
1. Check the browser console for errors
2. Check the terminal for API errors
3. Review Supabase logs in the dashboard
4. Verify all environment variables are set
