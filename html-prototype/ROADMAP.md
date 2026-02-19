# SITREP Platform - Product Roadmap

## Current State (MVP - Phase 1)

### ✅ Completed Features
- [x] Landing page with value proposition
- [x] User dashboard (quick actions, recent assessments, financial runway)
- [x] Profile management (basic info, financial snapshot)
- [x] Resume upload & parsing (skill extraction)
- [x] Job URL parsing (copy/paste job listing)
- [x] Company stability assessment
- [x] Financial runway calculator
- [x] Personalized job fit analysis
- [x] Skill gap identification
- [x] AI chat advisor (career guidance)

### 🎯 Focus: Core Assessment Features
- Job security scoring
- Resume-based fit analysis
- Financial planning tools

---

## Phase 2: Enhanced Pro Features (Months 1-3)

### Offer Comparison Tool
**Priority:** HIGH
**Tier:** Pro ($19/mo)

**Features:**
- Side-by-side comparison of 2+ job offers
- Stability score comparison
- Total compensation calculator (salary + RSU + bonus + benefits)
- 5-year financial projection
- Risk-adjusted value calculation
- AI recommendation: which offer to accept

**User Flow:**
```
Dashboard → "Compare Offers" →
Select Offer A (from saved assessments) →
Enter Offer B (new or saved) →
See comparison matrix →
Get AI recommendation
```

**Database:**
```sql
CREATE TABLE offer_comparisons (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  offer_a_id UUID REFERENCES assessments(id),
  offer_b_id UUID REFERENCES assessments(id),
  comparison_data JSONB, -- Matrix, projections
  ai_recommendation TEXT,
  created_at TIMESTAMP
);
```

---

### 90-Day Transition Planner
**Priority:** HIGH
**Tier:** Pro ($19/mo)

**Features:**
- Personalized weekly milestones
- Application tracking (jobs applied, interviews, offers)
- Certification roadmap
- Networking goals
- Financial runway tracking
- Progress dashboard

**User Flow:**
```
Dashboard → "Build 90-Day Plan" →
Enter separation date + target role →
AI generates weekly plan →
User tracks progress (checkboxes) →
Updates based on actual progress
```

**Database:**
```sql
CREATE TABLE transition_plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  separation_date DATE,
  target_role TEXT,
  weekly_milestones JSONB, -- Array of week objects
  progress JSONB, -- Completed items
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Phase 3: Premium Tier - Interview Prep Bot (Months 4-6) 🚀

**Priority:** MEDIUM (Roadmap)
**Tier:** Premium ($39/mo or $349/year)

### Overview
**AI-powered interview practice bot** that simulates real job interviews customized to:
- The specific job the user is applying for
- Their resume and background
- Their veteran status and MOS
- Common cleared job interview scenarios

### Why This Is Valuable

**Problem:**
- Veterans struggle translating military experience to civilian interview language
- Don't know what questions to expect for cleared roles
- No practice with behavioral interviews (STAR method)
- Nervous about first civilian interviews

**Solution:**
- Unlimited practice interviews with AI
- Job-specific questions based on actual job posting
- Real-time feedback on answers
- Veteran-specific guidance (how to explain MOS, deployments, etc.)

---

### Core Features

#### 1. **Job-Specific Interview Simulation**
```
User selects a saved job assessment →
"Practice Interview for this Role" button →
AI generates 10-15 relevant questions based on:
  - Job requirements (from parsed job posting)
  - User's resume (their experience level)
  - Industry (defense, tech, consulting, etc.)
```

**Question Types:**
- **Behavioral:** "Tell me about a time you handled a security incident"
- **Technical:** "Explain how you would configure a SIEM tool"
- **Situational:** "A team member leaked classified info—what do you do?"
- **Cultural Fit:** "Why do you want to work for Booz Allen?"
- **Veteran Transition:** "How does your military experience apply to this role?"

**Interview Modes:**
1. **Text-based** (MVP) - Type answers, AI responds
2. **Voice** (Future) - Speak answers, AI transcribes + analyzes
3. **Video** (Future) - Record yourself, AI analyzes body language

---

#### 2. **Real-Time Answer Feedback**

**User answers a question →**
AI provides instant feedback:

```
Question: "Tell me about a time you led a team under pressure."

Your Answer: "I was a squad leader in Afghanistan and we had
to secure a compound with limited resources."

AI Feedback:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ STRENGTHS:
  • Good setup - establishes leadership context
  • High-pressure scenario is relevant

⚠️ AREAS TO IMPROVE:
  • Missing STAR structure (Situation, Task, Action, Result)
  • No specific metrics or outcomes
  • Didn't mention team size or timeline

💡 SUGGESTED REFRAME:
"As a squad leader in Afghanistan (Situation), my 8-person team
was tasked with securing a compound within 24 hours despite
being down 2 members (Task). I reorganized the team into 2
shifts, trained them on new SOPs, and delegated roles based on
strengths (Action). We secured the compound 6 hours early with
zero incidents, earning a commendation (Result)."

🎯 TIP: Civilian employers love numbers - add team size, timeline,
and measurable outcomes whenever possible.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Score: 6/10 → Improved Answer: 9/10
```

---

#### 3. **STAR Method Training**

**Built-in coaching for behavioral questions:**

```
Before each behavioral question, show reminder:

┌─────────────────────────────────────┐
│ STAR Method Framework                │
├─────────────────────────────────────┤
│ S - Situation: Set the context      │
│ T - Task: What needed to be done    │
│ A - Action: What YOU specifically did│
│ R - Result: Measurable outcome       │
└─────────────────────────────────────┘

Common Mistakes to Avoid:
❌ Talking about "we" instead of "I"
❌ No specific metrics or timeline
❌ Skipping the result
```

---

#### 4. **Military → Civilian Translation**

**Veteran-specific guidance:**

```
Question: "How does your military experience apply to
cybersecurity?"

🎖️ VETERAN TIP:
When explaining your MOS (25B), translate to civilian terms:

Instead of: "I did COMSEC and maintained SIPR/NIPR networks"
Say: "I managed classified and unclassified network security
for a 500-person organization, ensuring zero security incidents
over 3 years."

Key phrases civilians understand:
✓ "Network security" (not COMSEC)
✓ "Incident response" (not threat mitigation)
✓ "Compliance" (not AR 25-2)
✓ "Team of X people" (not squad/platoon)
```

---

#### 5. **Mock Interview Sessions**

**Full interview simulation:**

```
Interview Type: Technical + Behavioral
Duration: 30 minutes
Questions: 10 total

┌─────────────────────────────────────────────┐
│ Mock Interview - Booz Allen Cybersecurity   │
├─────────────────────────────────────────────┤
│ [Q1/10] Behavioral                          │
│                                              │
│ "Tell me about a time you had to learn      │
│  a new technology quickly to solve a        │
│  critical problem."                          │
│                                              │
│ [Type your answer...]                        │
│                                              │
│ Time spent: 2m 34s                           │
│ Suggested time: 2-3 minutes                  │
└─────────────────────────────────────────────┘

After interview:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTERVIEW PERFORMANCE SUMMARY

Overall Score: 7.8/10 (Good - Likely to Advance)

Breakdown:
✓ Technical Knowledge: 8.5/10 (Strong)
⚠ Behavioral Answers: 7.0/10 (Needs STAR structure)
✓ Communication: 8.0/10 (Clear and concise)
⚠ Veteran Translation: 6.5/10 (Too much jargon)

Top 3 Improvements:
1. Add specific metrics to behavioral answers
2. Reduce military acronyms (said "SIPR" 3 times)
3. Practice explaining TS/SCI value to non-cleared interviewers

🎯 Recommended: Practice 2 more behavioral questions
```

---

### User Experience Flow

#### Entry Point 1: From Job Assessment
```
User assesses job → sees fit score (87%) →

[Button: "Practice Interview for This Role"]

Clicks button →
"You're a strong match! Let's practice the interview."

Interview Bot launches with:
- Pre-loaded job requirements
- Questions tailored to role
- Resume context (knows their background)
```

#### Entry Point 2: From Dashboard
```
Dashboard → "Interview Prep" card →

Select a job:
├── Booz Allen - Cybersecurity Analyst
├── Leidos - Network Engineer
└── [+ Add New Role]

Choose interview type:
○ Quick Practice (5 questions, 10 min)
○ Standard Interview (10 questions, 30 min)
○ Full Panel (15 questions, 45 min)

Start interview
```

---

### Technical Implementation

#### Frontend Components

```typescript
// /components/InterviewBot.tsx

interface InterviewBotProps {
  jobId: string;        // From assessment
  resumeId: string;     // User's resume
  interviewType: 'quick' | 'standard' | 'full';
}

Components needed:
- InterviewQuestion (displays question)
- AnswerInput (text/voice input)
- FeedbackCard (AI response)
- ProgressTracker (X/10 questions)
- PerformanceSummary (final report)
```

#### Backend API

```typescript
// /api/interview/generate-questions

POST /api/interview/generate-questions
{
  "jobId": "uuid",
  "resumeId": "uuid",
  "interviewType": "standard",
  "focusAreas": ["behavioral", "technical"]
}

Response:
{
  "questions": [
    {
      "id": "q1",
      "type": "behavioral",
      "category": "leadership",
      "question": "Tell me about a time...",
      "context": "This company values team leadership",
      "tips": ["Use STAR method", "Include metrics"]
    },
    ...
  ],
  "estimatedDuration": 30
}
```

```typescript
// /api/interview/evaluate-answer

POST /api/interview/evaluate-answer
{
  "questionId": "q1",
  "userAnswer": "I was a squad leader...",
  "resumeContext": { ... },
  "jobContext": { ... }
}

Response:
{
  "score": 6,
  "strengths": ["Good setup", "Relevant scenario"],
  "improvements": ["Add metrics", "Use STAR structure"],
  "suggestedRewrite": "As a squad leader...",
  "veteranTips": ["Translate MOS to civilian terms"],
  "nextQuestion": "q2"
}
```

#### AI Prompting Strategy

```typescript
const systemPrompt = `
You are an expert interview coach specializing in helping
military veterans transition to civilian cybersecurity roles.

User Context:
- Name: ${user.name}
- MOS: ${user.mos}
- Separation: ${user.separationDate}
- Target: ${job.role} at ${job.company}

User's Background (from resume):
- Skills: ${resume.skills}
- Certifications: ${resume.certs}
- Experience: ${resume.experience}

Job Requirements:
${job.requirements}

Your role:
1. Ask relevant interview questions
2. Evaluate answers using STAR framework
3. Provide specific, actionable feedback
4. Help translate military experience to civilian language
5. Be encouraging but honest

Scoring Rubric:
9-10: Excellent - Would definitely advance
7-8: Good - Likely to advance
5-6: Acceptable - Needs improvement
3-4: Weak - Significant gaps
1-2: Poor - Not ready

Always include:
- Score with justification
- 2-3 strengths
- 2-3 improvements
- Suggested rewrite (if score < 7)
- Veteran-specific tip
`;
```

---

### Database Schema

```sql
-- Interview Sessions
CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  job_id UUID REFERENCES assessments(id),
  interview_type TEXT, -- 'quick', 'standard', 'full'
  questions JSONB, -- Array of question objects
  status TEXT, -- 'in_progress', 'completed'
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  overall_score DECIMAL,
  summary JSONB -- Performance breakdown
);

-- Interview Answers
CREATE TABLE interview_answers (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES interview_sessions(id),
  question_id TEXT,
  question_text TEXT,
  user_answer TEXT,
  answer_score DECIMAL,
  ai_feedback JSONB, -- Strengths, improvements, tips
  time_spent INTEGER, -- Seconds
  created_at TIMESTAMP
);

-- Interview Analytics
CREATE TABLE interview_analytics (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  total_sessions INTEGER,
  avg_score DECIMAL,
  common_weaknesses JSONB,
  improvement_trend JSONB,
  last_practice TIMESTAMP
);
```

---

### Pricing & Positioning

#### Free Tier
❌ No interview prep

#### Pro Tier ($19/mo)
❌ No interview prep
(Focuses on assessment + fit analysis)

#### Premium Tier ($39/mo) ⭐ NEW
✅ Unlimited interview practice sessions
✅ Job-specific question generation
✅ Real-time answer feedback
✅ STAR method coaching
✅ Veteran translation tips
✅ Performance tracking & analytics
✅ Mock panel interviews
✅ Priority AI responses

**Positioning:**
"Get the job offer, not just the interview invite"

---

### Value Proposition

**For Users:**
```
Without Interview Bot:
❌ Wing it in real interviews (risky)
❌ Generic interview prep (not role-specific)
❌ No feedback on answers
❌ Waste actual interview opportunities

With Interview Bot:
✅ Practice unlimited times before real interview
✅ Questions tailored to exact job you're applying for
✅ Instant feedback on every answer
✅ Learn STAR method with real examples
✅ Translate military experience confidently
✅ Track improvement over time
✅ Enter interviews prepared and confident
```

**ROI Calculation:**
- Premium tier: $39/mo
- Average job offer increase from better interviews: $5k-10k
- Break-even after landing ONE job
- 1 month of prep → lifetime career benefit

---

### Competitive Analysis

**Existing Tools:**
- **Interviewing.io** - Tech interviews, no veteran focus ($100/mo)
- **Pramp** - Peer practice, not AI-driven (Free)
- **Big Interview** - Generic prep, no customization ($79/mo)

**SITREP Advantage:**
✅ Veteran-specific (military → civilian translation)
✅ Job-specific (uses actual job posting requirements)
✅ Resume-aware (knows your background)
✅ Cleared job focus (understands DoD 8570, etc.)
✅ Integrated platform (assessment → fit → interview prep)

**Unique moat:** Only platform that goes from "find job" → "assess stability" → "check fit" → "practice interview" in one place.

---

### Development Timeline

**Month 1: Core Interview Bot**
- [ ] Basic Q&A interface (text only)
- [ ] Question generation (5 behavioral + 5 technical)
- [ ] Claude API integration for feedback
- [ ] STAR method coaching prompts
- [ ] Simple scoring (1-10)

**Month 2: Veteran Translation**
- [ ] MOS → civilian skill mapping database
- [ ] Military jargon detection
- [ ] Suggested rewrites for common phrases
- [ ] Clearance value explanation coaching

**Month 3: Analytics & Tracking**
- [ ] Performance dashboard
- [ ] Improvement trends over time
- [ ] Common weakness identification
- [ ] Recommended practice areas

**Month 4: Advanced Features**
- [ ] Mock panel interviews (multiple questions in sequence)
- [ ] Company-specific coaching (e.g., "Booz Allen values X")
- [ ] Industry trend insights
- [ ] Video recording support (future)

---

### Success Metrics

**User Engagement:**
- % of Premium users who use interview bot weekly
- Avg sessions per user per month
- Completion rate (finish full mock interview)

**User Outcomes:**
- Job offer rate: Premium vs. Pro vs. Free
- Self-reported interview confidence (pre/post)
- Average score improvement over time

**Business:**
- Free → Premium conversion rate
- Premium churn rate
- NPS score for interview bot feature

**Target Metrics:**
- 70%+ Premium users use interview bot at least once
- 3+ practice sessions per user on average
- 15% boost in job offer rate (Premium vs. Pro)
- <5% churn for Premium tier

---

### Risk Mitigation

**Potential Issues:**

1. **AI gives bad advice**
   - Solution: Human review of sample responses, safety prompts
   - Quality assurance: Test with real HR professionals

2. **Users game the system (memorize answers)**
   - Solution: Randomize question variants, encourage understanding over memorization
   - Prompts: "Explain in your own words"

3. **Too expensive to run (Claude API costs)**
   - Solution: Cache common questions, limit free tier access
   - Tier gating: Premium only = sustainable unit economics

4. **Users expect voice/video immediately**
   - Solution: Launch text-only first, add voice as V2
   - Positioning: "Master content first, delivery second"

---

### Go-to-Market Strategy

**Launch Approach:**
1. **Private beta** (Month 1)
   - 50 users, gather feedback
   - Iterate based on real usage

2. **Public beta** (Month 2)
   - Premium tier only
   - $29/mo early adopter pricing

3. **Full launch** (Month 3)
   - $39/mo regular pricing
   - Marketing: Email existing Pro users

**Messaging:**
```
Subject: Introducing Interview Prep Bot - Land the Job, Not Just the Interview

Body:
You've assessed job stability ✓
You've checked your fit score ✓
Now it's time to ACE THE INTERVIEW ✓

New Premium Feature: AI Interview Prep Bot
→ Practice unlimited times before the real thing
→ Questions tailored to YOUR job and YOUR resume
→ Instant feedback on every answer
→ Master the STAR method with veteran-specific coaching

Upgrade to Premium: $39/mo
(Less than 1 hour of your future civilian salary)

[Start Practicing Now]
```

---

## Phase 4: Ecosystem Expansion (Months 7-12)

### Additional Premium Features

**Resume Builder (Premium)**
- Not just upload, but AI-optimized resume creation
- Military → civilian bullet point translator
- ATS optimization checker
- Clearance-focused formatting

**Networking Assistant (Premium)**
- LinkedIn connection suggestions (cleared professionals)
- Automated connection request templates
- Informational interview scheduler
- Veteran mentor matching

**Salary Negotiation Coach (Premium)**
- Compensation data for cleared roles
- Negotiation script generator
- Counter-offer analyzer
- Total comp calculator (salary + equity + benefits)

**Career Path Planner (Premium)**
- 5-year career roadmap
- Certification sequence optimizer
- Promotion timeline predictions
- Skill gap → salary increase calculator

---

## Tier Comparison (Future State)

| Feature | Free | Pro ($19/mo) | Premium ($39/mo) |
|---------|------|--------------|------------------|
| **Core** |
| Job assessments | 5/month | Unlimited | Unlimited |
| Company stability scores | ✓ | ✓ | ✓ |
| Financial runway calculator | ✓ | ✓ | ✓ |
| AI chat advisor | 10 msgs/mo | Unlimited | Unlimited |
| **Resume** |
| Resume upload | 1 resume | 1 resume | 3 resumes |
| Skill extraction | ✓ | ✓ | ✓ |
| Fit score analysis | ❌ | ✓ | ✓ |
| Resume builder | ❌ | ❌ | ✓ |
| ATS optimization | ❌ | ❌ | ✓ |
| **Planning** |
| Offer comparison | ❌ | ✓ | ✓ |
| 90-day planner | ❌ | ✓ | ✓ |
| Career path roadmap | ❌ | ❌ | ✓ |
| **Interview Prep** |
| Interview bot | ❌ | ❌ | ✓ |
| Mock interviews | ❌ | ❌ | ✓ |
| STAR method coaching | ❌ | ❌ | ✓ |
| Performance tracking | ❌ | ❌ | ✓ |
| **Advanced** |
| Networking assistant | ❌ | ❌ | ✓ |
| Salary negotiation coach | ❌ | ❌ | ✓ |
| Priority support | ❌ | ❌ | ✓ |

---

## Implementation Priority

### Immediate (Phase 1-2): Ship Core Features
1. ✅ Job assessment + resume fit analysis
2. ⏳ Offer comparison tool
3. ⏳ 90-day transition planner

### Near-term (Phase 3): Premium Launch
4. ⏳ Interview prep bot (text-based MVP)
5. ⏳ STAR method coaching
6. ⏳ Performance tracking

### Long-term (Phase 4): Ecosystem
7. Resume builder
8. Networking assistant
9. Salary negotiation coach
10. Career path planner

---

**Current focus:** Refine core features (assessment + fit analysis) before building premium tier.

**Interview Bot status:** Designed and ready for implementation when Phase 3 begins.
