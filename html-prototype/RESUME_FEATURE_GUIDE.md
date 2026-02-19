# Resume Upload & Job Fit Analysis - Feature Guide

## Overview

The profile now includes **resume upload functionality** that transforms job assessments from generic stability scores into **personalized fit analysis** showing how well the user matches each job's requirements.

---

## Core Concept

**Before Resume Upload:**
- Assessment shows: Company stability score (8.2/10)
- User question: "Is this company stable?"

**After Resume Upload:**
- Assessment shows: Company stability (8.2/10) + **Your Fit Score (87%)**
- User question: "Is this company stable **AND am I a good fit?**"

---

## User Experience Flow

### Step 1: User Creates Profile
```
Sign up → Fill basic info:
- Name, email
- Branch, MOS, separation date
- Location, clearance status
- Monthly expenses, savings, VA income
```

### Step 2: Upload Resume to Profile
```
Navigate to Profile page → Resume section:

1. Drag & drop resume OR click to browse
2. Upload PDF/DOCX (max 5MB)
3. System parses resume (2-3 seconds)
4. Extracts:
   - Skills (Network Security, SIEM, Linux, etc.)
   - Certifications (Security+, CCNA, etc.)
   - Years of experience (6 years)
   - Education (Bachelor's in CS)
```

**Visual Feedback:**
- ✅ Green checkmark "Resume Uploaded"
- Shows extracted skills as tags
- Lists detected certifications
- Displays experience and education

### Step 3: Assess Job with Resume
```
Paste job URL → Parse job listing:
- Company: Booz Allen Hamilton
- Role: Cybersecurity Analyst
- Requirements:
  ✓ TS/SCI clearance (required)
  ✓ Security+ cert (required)
  ✓ 3+ years experience (required)
  ✓ SIEM tools (preferred)
  ! Cloud security (preferred)
  ! Python scripting (preferred)

Click "Run Assessment"
```

### Step 4: Get Dual Analysis
**Standard Assessment (Everyone gets this):**
- Company Stability: 8.2/10
- Financial Runway: 14 months
- Risk Level: MODERATE
- Recommendation: ACCEPT

**+ Personalized Fit Analysis (Only with resume):**
- **Your Fit Score: 87%** (STRONG MATCH)
- ✅ **What you have:** Clearance, Security+, 6 yrs exp, SIEM skills
- ⚠️ **What you're missing:** Cloud certs, Python experience
- 💡 **Quick wins:** Add Python projects, mention any cloud exposure
- 🎯 **Application strategy:** HIGHLY RECOMMEND - You're ahead of most candidates

---

## What Gets Extracted from Resume

### Automatic Parsing (AI-powered)

**Skills:**
- Technical skills (programming languages, tools, platforms)
- Soft skills (leadership, communication)
- Domain expertise (cybersecurity, networking, cloud)

**Certifications:**
- Name + Issuing org (e.g., "Security+ by CompTIA")
- Status: Active/Expired (if dates provided)

**Experience:**
- Total years of work experience
- Relevant job titles
- Military service translation (25B → IT Specialist)

**Education:**
- Degree level (Bachelor's, Master's, etc.)
- Field of study
- Institution (optional)

**Clearance Status:**
- Type (Secret, TS, TS/SCI)
- Active/Inactive

---

## Fit Score Calculation

### Algorithm (Production Implementation)

```typescript
function calculateFitScore(userProfile, jobRequirements) {
  let score = 0;
  let maxScore = 0;

  // Required skills (60% weight)
  jobRequirements.requiredSkills.forEach(skill => {
    maxScore += 10;
    if (userProfile.skills.includes(skill)) {
      score += 10; // Perfect match
    }
  });

  // Certifications (20% weight)
  jobRequirements.requiredCerts.forEach(cert => {
    maxScore += 10;
    if (userProfile.certifications.includes(cert)) {
      score += 10;
    }
  });

  // Experience (10% weight)
  maxScore += 10;
  if (userProfile.yearsExperience >= jobRequirements.minExperience) {
    score += 10;
  } else {
    score += (userProfile.yearsExperience / jobRequirements.minExperience) * 10;
  }

  // Clearance (10% weight)
  maxScore += 10;
  if (userProfile.clearance === jobRequirements.clearance) {
    score += 10;
  }

  return Math.round((score / maxScore) * 100);
}
```

### Score Interpretation

| Score | Label | Recommendation |
|-------|-------|----------------|
| 90-100% | EXCELLENT MATCH | Apply immediately - you exceed requirements |
| 80-89% | STRONG MATCH | Highly recommend applying |
| 70-79% | GOOD MATCH | Worth applying - address gaps in cover letter |
| 60-69% | MODERATE MATCH | Apply if interested, but expect competition |
| 50-59% | WEAK MATCH | Consider upskilling first |
| <50% | POOR MATCH | Focus on better-fit roles |

---

## Skill Gap Analysis

### What It Shows

**Gaps You Can Fill Quickly (< 3 months):**
```
⚠️ Python Scripting
   → Solution: 2-week online course + add projects to resume
   → Impact: +5% fit score

⚠️ Cloud Security Basics
   → Solution: AWS Security Fundamentals (free course)
   → Impact: +3% fit score
```

**Gaps Requiring More Time (3-12 months):**
```
⚠️ CISSP Certification
   → Solution: 5 years experience required + 6-month study
   → Impact: Only pursue if targeting senior roles
```

**Not Critical to Address:**
```
ℹ️ Java Development
   → Listed as "nice to have" in JD
   → You have Python (similar enough)
   → Impact: 0% - don't worry about this
```

---

## Benefits for Free vs. Paid Users

### Free Tier (Basic Users)
✅ Upload 1 resume
✅ Resume parsing and skill extraction
✅ Fit score on assessments (basic)
✅ Skill gap identification
❌ Limited to 5 assessments/month
❌ No historical fit tracking

### Pro Tier ($19/mo)
✅ Upload multiple resumes (different role targets)
✅ Advanced fit score with confidence intervals
✅ Unlimited assessments with fit analysis
✅ Skill gap prioritization (quick wins highlighted)
✅ Historical fit tracking ("Your avg fit: 82%")
✅ Resume optimization suggestions
✅ ATS compatibility check

---

## Backend Implementation Plan

### Resume Parsing Approach

**Option 1: AI-Powered (Recommended for MVP)**
```typescript
// Upload resume → Send to Claude API

const resumeText = await extractTextFromPDF(resumeFile);

const prompt = `
Extract structured data from this resume:
- Skills (array)
- Certifications (array of {name, issuer})
- Years of experience (number)
- Education (string)
- Clearance status (string)

Resume text:
${resumeText}

Return JSON only.
`;

const extraction = await claude.messages.create({
  model: "claude-3-5-sonnet-20241022",
  messages: [{ role: "user", content: prompt }]
});

const resumeData = JSON.parse(extraction.content[0].text);
```

**Pros:**
- Works with any resume format/layout
- Handles unstructured data (e.g., skills in paragraphs)
- Low maintenance (no regex updates)

**Cons:**
- $0.003 per resume parse
- 2-3 second latency

**Option 2: Dedicated Resume Parser Library**
- **Affinda Resume Parser** ($0.10/resume, very accurate)
- **Sovren** (enterprise, expensive)
- **Open-source:** pyresparser (free but less accurate)

### Job Requirement Extraction

When parsing job URL, also extract:
```json
{
  "requiredSkills": ["Network Security", "SIEM", "Incident Response"],
  "preferredSkills": ["Cloud Security", "Python"],
  "requiredCerts": ["Security+"],
  "preferredCerts": ["CISSP", "CEH"],
  "minExperience": 3,
  "clearanceRequired": "TS/SCI",
  "education": "Bachelor's in related field"
}
```

### Matching Algorithm

```typescript
// /api/assess-job-fit

export async function POST(request: Request) {
  const { jobId, userId } = await request.json();

  // 1. Fetch user's resume data from DB
  const userProfile = await db.profiles.findUnique({
    where: { userId },
    include: { resume: true }
  });

  // 2. Fetch job requirements (from parsed job URL)
  const job = await db.jobs.findUnique({
    where: { id: jobId },
    include: { requirements: true }
  });

  // 3. Calculate fit score
  const fitScore = calculateFitScore(
    userProfile.resume,
    job.requirements
  );

  // 4. Generate skill gaps
  const gaps = identifySkillGaps(
    userProfile.resume.skills,
    job.requirements.requiredSkills,
    job.requirements.preferredSkills
  );

  // 5. Get AI recommendations
  const recommendation = await generateApplicationStrategy(
    fitScore,
    gaps,
    userProfile,
    job
  );

  return Response.json({
    fitScore,
    gaps,
    recommendation,
    competitiveEdges: userProfile.resume.strengths
  });
}
```

---

## Database Schema Updates

### New Tables

```sql
-- Resumes
CREATE TABLE resumes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  file_name TEXT,
  file_url TEXT, -- S3/storage URL
  file_size INTEGER,
  uploaded_at TIMESTAMP,
  parsed_at TIMESTAMP,

  -- Extracted data (JSONB for flexibility)
  skills JSONB, -- ["Network Security", "Python", ...]
  certifications JSONB, -- [{name, issuer, date}]
  experience_years INTEGER,
  education TEXT,
  clearance TEXT,

  -- Full parsed output
  raw_parsed_data JSONB,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Job Fit Analyses
CREATE TABLE job_fit_analyses (
  id UUID PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id),
  resume_id UUID REFERENCES resumes(id),

  fit_score DECIMAL, -- 0-100
  fit_label TEXT, -- "STRONG MATCH", etc.

  matched_skills JSONB,
  skill_gaps JSONB,
  competitive_edges JSONB,

  recommendation TEXT, -- AI-generated

  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## UI/UX Enhancements (Future)

### Resume Optimization Tips
```
🚀 Improve Your Fit Score:

Current: 78% → Potential: 88%

Quick Wins (1-2 weeks):
1. Add Python to skills section
   → Run through free course + add projects
   → +5% fit boost

2. Mention cloud exposure
   → Even if informal (AWS free tier, personal projects)
   → +3% fit boost

3. Quantify SIEM experience
   → "Monitored 10k+ security events daily"
   → +2% fit boost (makes experience tangible)
```

### Multiple Resume Support (Pro Feature)
```
Resumes:
├── Resume_CyberSecurity.pdf (Active)
│   → Best for: SOC Analyst, Security Engineer roles
│   → Avg Fit: 84%
│
├── Resume_CloudSecurity.pdf
│   → Best for: Cloud Security, AWS Security roles
│   → Avg Fit: 79%
│
└── Resume_Pentesting.pdf
    → Best for: Penetration Tester, Red Team roles
    → Avg Fit: 71%
```

### Skill Trending
```
Your Skills vs. Market Demand (DMV Area):

🔥 High Demand (from you):
✓ Security+ → 95% of jobs require
✓ TS/SCI → 87% of jobs require
✓ SIEM → 76% of jobs require

📈 Growing Demand (missing):
⚠️ Cloud Security → 68% of jobs (↑12% YoY)
⚠️ Python → 54% of jobs (↑8% YoY)

📉 Declining Demand:
ℹ️ Windows Server 2008 → 12% of jobs (↓15% YoY)
```

---

## Testing Checklist

### Resume Upload
- [ ] PDF upload works (< 5MB)
- [ ] DOCX upload works
- [ ] File too large shows error
- [ ] Invalid file type shows error
- [ ] Drag & drop works
- [ ] Parsing shows loading spinner
- [ ] Extracted data displays correctly
- [ ] Remove resume works
- [ ] Session persistence works (refresh page)

### Fit Analysis
- [ ] Fit score shows only when resume uploaded
- [ ] Score calculates correctly (80-90% range typical)
- [ ] Competitive edges list appears
- [ ] Skill gaps identified accurately
- [ ] AI recommendation makes sense
- [ ] Works across different job types

### Edge Cases
- [ ] Resume with no certs → shows "No certifications listed"
- [ ] Resume with 15+ skills → shows "8 skills + 7 more"
- [ ] Job with no clearance req → clearance section hidden
- [ ] User has more experience than required → bonus highlighted

---

## Competitive Advantage

### Why This Matters

**Other platforms:**
- "Here's the job description"
- "Here's the company info"
- User manually compares → time-consuming, error-prone

**SITREP with Resume:**
- "You're an 87% match - here's why"
- "You're missing Python - here's how to fix it"
- "Apply now - you're ahead of most candidates"
- User gets **confidence + action plan**

### Unique Value Props

1. **Military-to-Civilian Translation**
   - Automatically maps MOS to civilian skills
   - "25B" → "Network Administration, Cybersecurity, IT Support"

2. **Clearance Quantification**
   - Shows clearance value in dollars (+$15-20k/year in DMV)
   - Highlights jobs where clearance = competitive moat

3. **Financial Integration**
   - "This job pays $95k → 14-month runway (vs. 2.7 now)"
   - "Your fit is 87% → accept rate: 68% for similar profiles"

4. **Actionable Gaps**
   - Not just "you lack Python"
   - But "2-week course + add to resume = +5% fit"

---

## Metrics to Track (Analytics)

### User Engagement
- % of users who upload resume (target: 60%+)
- Avg time from signup → resume upload (target: <10 min)
- Resume re-upload rate (optimization iterations)

### Fit Score Accuracy
- User-reported "Did you get the job?" vs. fit score
- Correlation between fit score and interview rate
- Skill gap suggestions that led to successful hires

### Business Impact
- Conversion rate: Free → Pro (hypothesis: +resume = +40%)
- NPS score by cohort (with resume vs. without)
- Feature usage: Assessments with fit vs. without

---

**Ready to build?** This feature transforms SITREP from "company research tool" to "personal career advisor" - a much stickier, more valuable product.
