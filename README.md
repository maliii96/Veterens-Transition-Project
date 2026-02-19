# SitRep — Veteran Transition Platform

A full-stack web application built to help military veterans navigate the transition to civilian life. SitRep provides AI-powered tools for career planning, resume assessment, job fit analysis, and benefits tracking — all in one place.

---

## Features

- **AI Chat Advisor** — Real-time conversation with an AI specialist that knows your military background and goals
- **90-Day Transition Plan** — Personalized, week-by-week action plan generated from your profile (MOS, separation date, target job, financial runway)
- **Resume Upload & Job Assessment** — Upload your resume, paste a job listing, get an AI-scored fit analysis with gap analysis and recommendations
- **Transition Checklist** — Track document preparation (DD-214, VA claim, etc.) and benefits enrollment (healthcare, GI Bill, home loan, etc.)
- **Financial Dashboard** — Monthly expense tracking, VA disability income offset, financial runway calculator, target salary planner
- **Career Goals** — Set desired job title, target industry, and work type preference to personalize AI outputs
- **Freemium Usage Limits** — Free tier included; paid tier unlocks higher monthly limits

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database & Auth | Supabase (PostgreSQL + Row Level Security) |
| AI | Anthropic Claude (claude-sonnet-4-5) |
| Hosting | Vercel |

---

## Project Structure

```
sitrep-platform/
├── app/
│   ├── api/
│   │   ├── assessment/create/   # AI job fit scoring
│   │   ├── chat/                # AI advisor chat
│   │   ├── plan/                # 90-day plan generation
│   │   ├── resume/upload/       # Resume parsing
│   │   └── job/parse/           # Job listing parser
│   ├── assessment/              # Assessment UI page
│   ├── checklist/               # Transition checklist page
│   ├── chat/                    # AI chat page
│   ├── dashboard/               # Main dashboard
│   ├── plan/                    # 90-day plan page
│   └── profile/                 # User profile page
├── lib/
│   ├── supabase/                # Supabase client helpers
│   ├── usageLimits.ts           # Freemium usage tracking
│   └── costOfLiving.ts          # COL salary adjustment
└── supabase/
    └── migrations/              # DB migration files (001–009)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Database Setup

Run all migrations in your Supabase SQL Editor in order:

```
supabase/migrations/001_initial_schema.sql  through  009_add_checklists.sql
```

### Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Usage Limits

| Feature | Free | Paid |
|---------|------|------|
| Job Assessments | 3 / month | 25 / month |
| AI Chat Messages | 10 / month | 100 / month |
| 90-Day Plans | 1 / month | 3 / month |
| Resume Uploads | 2 / month | 10 / month |

Limits reset on the 1st of each month. Tracked in the `profiles` table — no cron job required.

---

## Deployment

1. Push to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Set Supabase Auth → URL Configuration to your production domain
5. Deploy

---

## License

Private — all rights reserved.
