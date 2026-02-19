# Job URL Parsing - Implementation Guide

## Overview

The job assessment flow now supports **URL-first input**, where users paste a job listing URL and the system automatically extracts all relevant details (company, role, salary, location, requirements).

This prevents false information and provides a much better UX than manual data entry.

---

## Frontend Flow (Already Implemented)

### User Experience

1. **User pastes job URL** (e.g., from Indeed, LinkedIn, ClearanceJobs)
2. **Clicks "Parse Job" button**
3. **Loading state shows** (~2-3 seconds)
4. **Form auto-populates** with extracted data
5. **User reviews/edits** if needed
6. **Clicks "Run Assessment"** to proceed

### UI Components

- ✅ URL input field with validation
- ✅ "Parse Job" button
- ✅ Loading spinner with status text
- ✅ Auto-populated form fields with green highlight
- ✅ Example URLs collapsible section
- ✅ Manual entry fallback option

---

## Backend Implementation (To Build)

### Architecture

```
User Input (URL)
    ↓
Next.js API Route (/api/parse-job)
    ↓
Job Parser Service
    ↓
    ├→ URL Validation
    ├→ Domain Detection (Indeed/LinkedIn/etc)
    ├→ Web Scraping / API Call
    ├→ HTML Parsing
    ├→ AI Data Extraction (Claude)
    └→ Structured JSON Response
    ↓
Frontend (auto-populate form)
```

### Option 1: Web Scraping (Recommended for MVP)

**Technology Stack:**
- **Puppeteer** or **Playwright** (headless browser)
- **Cheerio** (HTML parsing)
- **Claude API** (intelligent data extraction)

**Implementation:**

```typescript
// /api/parse-job.ts
export async function POST(request: Request) {
  const { url } = await request.json();

  // 1. Launch headless browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // 2. Navigate to job URL
  await page.goto(url);

  // 3. Get page HTML
  const html = await page.content();
  await browser.close();

  // 4. Send HTML to Claude for structured extraction
  const jobData = await extractJobDataWithAI(html);

  return Response.json(jobData);
}

async function extractJobDataWithAI(html: string) {
  const prompt = `
    Extract structured job data from this HTML.
    Return JSON with: company, role, salary, location, clearance, benefits

    HTML:
    ${html}
  `;

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: prompt
    }]
  });

  // Parse AI response to get structured data
  return JSON.parse(response.content[0].text);
}
```

**Pros:**
- Works with any job board (universal)
- AI handles layout changes automatically
- Extracts even unstructured data (e.g., salary ranges, clearance in description)

**Cons:**
- Slower (~2-5 seconds)
- Higher cost (browser + AI API call)
- May break if sites heavily use JavaScript rendering

---

### Option 2: Job Board APIs (Best for Production)

Many job boards offer official APIs:

#### Indeed API
```typescript
const response = await fetch(
  `https://api.indeed.com/ads/apisearch?publisher=${INDEED_API_KEY}&q=job_id&format=json`
);
const job = await response.json();
```

#### LinkedIn Scraper API (RapidAPI)
```typescript
const response = await fetch(
  'https://linkedin-data-api.p.rapidapi.com/get-job-details',
  {
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': RAPID_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: jobUrl })
  }
);
```

#### ClearanceJobs
- Direct scraping (no public API)
- Use Puppeteer + Cheerio

**Pros:**
- Fast (~500ms)
- Structured data guaranteed
- Reliable (official APIs)

**Cons:**
- Requires API keys/subscriptions
- Limited to supported job boards
- APIs may change or require paid tiers

---

### Option 3: Hybrid Approach (Recommended)

Combine both methods:

```typescript
export async function parseJobUrl(url: string) {
  const domain = new URL(url).hostname;

  // Use API if available
  if (domain.includes('indeed.com')) {
    return await parseIndeedAPI(url);
  }
  if (domain.includes('linkedin.com')) {
    return await parseLinkedInAPI(url);
  }

  // Fallback to web scraping + AI
  return await parseWithScraping(url);
}
```

**Benefits:**
- Fast for major job boards (API)
- Universal fallback (scraping + AI)
- Best of both worlds

---

## Data Structure

### Input (from frontend)
```json
{
  "url": "https://www.indeed.com/viewjob?jk=abc123456"
}
```

### Output (to frontend)
```json
{
  "success": true,
  "data": {
    "company": "Booz Allen Hamilton",
    "role": "Cybersecurity Analyst",
    "salary": "$85,000 - $105,000",
    "salaryMin": 85000,
    "salaryMax": 105000,
    "location": "McLean, VA",
    "clearance": "TS/SCI",
    "clearanceLevel": "ts-sci",
    "benefits": "Full package including 401k, health insurance, PTO",
    "benefitsLevel": "full",
    "jobDescription": "Full description text...",
    "requirements": [
      "Active TS/SCI clearance",
      "Security+ certification",
      "3+ years experience"
    ],
    "sourceUrl": "https://www.indeed.com/viewjob?jk=abc123456",
    "extractedAt": "2026-02-15T10:30:00Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Unable to parse job listing. Please enter details manually.",
  "details": "Invalid URL or page not accessible"
}
```

---

## Edge Cases to Handle

### 1. Salary Not Listed
- Many jobs don't list salary publicly
- **Solution:** Leave empty, AI can analyze role/company to estimate range

### 2. Multiple Locations
- "Remote" or "Multiple locations available"
- **Solution:** Extract all locations, default to first or "Remote"

### 3. Clearance Requirements
- Often buried in description text (not structured field)
- **Solution:** AI extracts from description using NLP

### 4. Expired/Removed Listings
- Job may be taken down between user finding it and pasting URL
- **Solution:** Cache recent parses for 24 hours

### 5. Login Walls
- Some sites require login to view full job details (LinkedIn)
- **Solution:** Use authenticated browser session or API

---

## Caching Strategy

To avoid re-parsing the same job URL:

```typescript
// Cache in Redis/Vercel KV
const cacheKey = `job:${url}`;
const cached = await kv.get(cacheKey);

if (cached) {
  return cached; // Instant response
}

// Parse fresh data
const jobData = await parseJobUrl(url);

// Cache for 24 hours
await kv.set(cacheKey, jobData, { ex: 86400 });

return jobData;
```

**Benefits:**
- Instant response for popular jobs
- Reduces API/scraping costs
- Better UX (no waiting for repeat URLs)

---

## Security Considerations

### SSRF Protection
Prevent users from attacking internal services:

```typescript
const url = new URL(userInput);

// Whitelist allowed domains
const allowedDomains = [
  'indeed.com',
  'linkedin.com',
  'clearancejobs.com',
  'glassdoor.com',
  'dice.com',
  'ziprecruiter.com'
];

const isAllowed = allowedDomains.some(domain =>
  url.hostname.endsWith(domain)
);

if (!isAllowed) {
  throw new Error('Job board not supported');
}
```

### Rate Limiting
Prevent abuse:

```typescript
// Vercel Edge Config or Upstash Ratelimit
const { success } = await ratelimit.limit(userId);
if (!success) {
  return new Response('Too many requests', { status: 429 });
}
```

---

## Cost Analysis

### Scraping + AI Approach
- **Puppeteer:** Free (self-hosted) or $0.001/request (serverless)
- **Claude API:** ~$0.003 per job parse (with caching)
- **Total:** ~$0.004 per unique job URL

### API Approach
- **Indeed API:** Free tier (limited) or $0.05/request
- **LinkedIn API (RapidAPI):** $0.01/request
- **Total:** $0.01-$0.05 per job URL

### Hybrid (Recommended)
- **Average:** ~$0.007 per job parse
- **With caching:** ~$0.001 per parse (80% cache hit rate)

**For 1,000 assessments/month:** ~$7/month in API costs

---

## MVP Implementation Checklist

- [ ] Create `/api/parse-job` Next.js API route
- [ ] Install Puppeteer/Playwright
- [ ] Set up Claude API client
- [ ] Implement basic URL validation
- [ ] Add domain whitelist
- [ ] Build HTML → structured data extractor
- [ ] Add Redis/KV caching layer
- [ ] Implement rate limiting
- [ ] Add error handling for failed parses
- [ ] Test with 5 major job boards
- [ ] Monitor parse accuracy (>90% target)

---

## Testing Strategy

### Test Cases

1. **Indeed Job:**
   - URL: `https://www.indeed.com/viewjob?jk=123`
   - Expected: All fields extracted

2. **LinkedIn Job:**
   - URL: `https://www.linkedin.com/jobs/view/456`
   - Expected: Company, role, location (salary often missing)

3. **ClearanceJobs:**
   - URL: `https://www.clearancejobs.com/jobs/789`
   - Expected: Clearance level extracted from description

4. **No Salary Listed:**
   - Expected: Salary field empty, AI estimates range

5. **Expired Job:**
   - Expected: Graceful error, manual entry prompt

---

## Future Enhancements

1. **Browser Extension:** Auto-detect job page, one-click parse
2. **Bulk Import:** Upload CSV of job URLs
3. **Auto-Apply Tracking:** Monitor if user applied, track response rate
4. **Salary Estimation AI:** If salary not listed, estimate from role + location + company
5. **Company Database:** Pre-populated company data for faster lookups

---

## Example User Flow (Full Experience)

```
User on ClearanceJobs.com
    ↓
Sees: "Cybersecurity Analyst - Booz Allen Hamilton"
    ↓
Copies URL: https://www.clearancejobs.com/jobs/12345
    ↓
Navigates to SITREP platform
    ↓
Pastes URL in assessment form
    ↓
Clicks "Parse Job" button
    ↓
[Loading: "Parsing job listing..." 2 seconds]
    ↓
Form auto-fills:
    - Company: Booz Allen Hamilton ✓
    - Role: Cybersecurity Analyst ✓
    - Salary: $85k - $105k ✓
    - Location: McLean, VA ✓
    - Clearance: TS/SCI ✓
    - Benefits: Full ✓
    ↓
User reviews (all correct!)
    ↓
Clicks "Run Assessment"
    ↓
Gets stability report: 8.2/10, 14 months runway
    ↓
Decision: ACCEPT offer
```

**Time saved:** 3 minutes of manual data entry → 5 seconds

---

## Questions to Answer Before Building

1. **Which job boards are most important to veterans?**
   - ClearanceJobs? Indeed? LinkedIn? Dice?
   - Focus on top 3 for MVP

2. **How accurate does parsing need to be?**
   - 90%+ for company/role (critical)
   - 70%+ for salary (often not listed)
   - 95%+ for clearance (critical for veterans)

3. **What's the budget for external APIs?**
   - Free tier only? Or willing to pay $50-100/month for better APIs?

4. **Should we store parsed job data?**
   - Yes → Build job database, track market trends
   - No → Just parse on-demand

---

**Ready to implement?** Start with Option 1 (Scraping + AI) for MVP, then optimize with APIs once you validate demand.
