# Quick Start Guide

## 🚀 What's Been Built

You now have a complete job assessment platform with:

### ✅ Resume Upload & AI Parsing
- API endpoint: `/api/resume/upload`
- Extracts structured data from resumes using Claude AI
- Stores in Supabase database

### ✅ Job URL Parsing
- API endpoint: `/api/job/parse`
- Fetches and analyzes any job posting URL
- Extracts requirements, skills, salary, etc.

### ✅ Assessment Engine with Stability Scoring
- API endpoint: `/api/assessment/create`
- Comprehensive fit analysis (0-100 scores)
- **Stability scoring** that analyzes:
  - Average tenure per job
  - Job hopping patterns
  - Career progression
  - Red flags and positive indicators
- Skills match analysis
- Experience level matching
- Culture fit assessment
- Detailed recommendations

### ✅ User Interface
- Assessment page at `/assessment`
- Full workflow: Upload → Parse → Assess
- Beautiful results dashboard
- Linked from main dashboard

## ⚡ Before You Can Use It

### 1. Add Your Anthropic API Key

Open [`.env.local`](./env.local) and replace the placeholder:

```env
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

Get your key from: https://console.anthropic.com

### 2. Run Database Migration

The `jobs` table needs to be created in Supabase:

**Option A: Supabase Dashboard (Recommended)**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** → **New Query**
4. Copy contents of [`supabase/migrations/002_add_jobs_table.sql`](./supabase/migrations/002_add_jobs_table.sql)
5. Paste and run (Ctrl/Cmd + Enter)

**Option B: Command Line**
```bash
# If you have Supabase CLI installed
supabase db push
```

### 3. That's It!

Your server is already running at http://localhost:3000

## 🎯 Try It Out

1. **Go to**: http://localhost:3000/assessment

2. **Upload a resume** (`.txt` format works best for initial testing)
   - You can create a simple test resume in a text file

3. **Parse a job URL**
   - Try any public job posting (LinkedIn, Indeed, company career pages)
   - Example: https://jobs.netflix.com/... (any public URL)

4. **Generate assessment**
   - Click "Create Assessment"
   - Wait 10-20 seconds for AI analysis
   - View comprehensive results with stability scoring!

## 📊 What You'll See

The assessment includes:

- **Overall Fit Score**: 0-100 combined rating
- **Skills Match**: Which skills match, which are missing
- **Experience Match**: Years and level analysis
- **Stability Score**:
  - Average tenure in months/years
  - Job changes count
  - Red flags (frequent moves, gaps)
  - Positive indicators (promotions, long tenure)
  - Risk assessment
- **Strengths & Concerns**: Key points for hiring decision
- **Recommendations**: AI-generated advice

## 💡 Testing Tips

**For Resume Upload:**
- TXT files work best initially (PDF parsing needs additional library)
- Include: name, email, work history with dates, education, skills
- Clear date formats help stability analysis (e.g., "Jan 2020 - Dec 2022")

**For Job Parsing:**
- Most public job boards work
- LinkedIn jobs, Indeed, company career pages
- Some sites may block automated fetching

**Sample Test Resume:**
```text
John Doe
john.doe@email.com
(555) 123-4567

EXPERIENCE

Senior Software Engineer | Tech Corp
Jan 2021 - Present
- Led team of 5 engineers
- Implemented microservices architecture
- Increased system performance by 40%

Software Engineer | StartupXYZ
Jun 2018 - Dec 2020
- Built RESTful APIs
- Worked with React and Node.js

EDUCATION
BS Computer Science | State University | 2018

SKILLS
JavaScript, React, Node.js, Python, AWS, Docker
```

## 🐛 Troubleshooting

**"Unauthorized" error:**
- Log in at http://localhost:3000/login
- Make sure you're authenticated

**"Failed to parse" error:**
- Check `.env.local` has valid `ANTHROPIC_API_KEY`
- Verify API key has credits
- Check browser console for details

**"Failed to save" error:**
- Did you run the database migration?
- Check Supabase dashboard for `jobs` table

**Job parsing fails:**
- Some websites block automated requests
- Try a different job posting URL
- Ensure URL is publicly accessible

## 📈 Next Steps

Once this works, you can:

1. Add PDF resume support (install `pdf-parse` library)
2. Store resume files in Supabase Storage
3. Create assessment history page
4. Export assessments as PDF reports
5. Compare multiple candidates
6. Batch process resumes

## 💰 Cost Estimates

Claude API usage per assessment:
- Resume parsing: ~2,000 tokens (~$0.006)
- Job parsing: ~3,000 tokens (~$0.009)
- Assessment: ~5,000 tokens (~$0.015)

**Total: ~$0.03 per complete assessment**

Very affordable for production use!

## 📚 Full Documentation

See [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) for complete documentation.
