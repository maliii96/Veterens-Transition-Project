# SITREP - Veteran Transition Intelligence Platform

## Frontend Design Overview

A data-driven job security analysis platform for transitioning service members. Features a tactical, military-inspired dark theme with professional UI/UX.

## Design System

### Color Palette
- **Primary Dark**: `#0a0e14` (Main background)
- **Panel Background**: `#151921`
- **Accent Green**: `#00ff88` (Primary actions, success states)
- **Warning Amber**: `#ffb800` (Warnings, alerts)
- **Danger Red**: `#ff4444` (Critical alerts)
- **Info Blue**: `#00aaff` (Information, links)

### Typography
- **Headings & Mono**: JetBrains Mono (technical data, code-like elements)
- **Body Text**: DM Sans (readable, modern sans-serif)

### Visual Elements
- Tactical grid background pattern
- Gradient accents (green → blue)
- Smooth animations and transitions
- Hexagonal logo icon
- Card-based layout system

## Pages Included

### 1. Landing Page (`#landing`)
- Hero section with value proposition
- Live status badge
- Key statistics (avg stability score, runway, companies analyzed)
- Feature showcase grid
- Call-to-action buttons

### 2. Dashboard (`#dashboard`)
- Welcome header with user status bar
- Quick action cards (4 primary features)
- Recent assessments list
- Financial runway widget
- Financial snapshot panel

### 3. Assessment Tool (`#assessment`)
- Job offer input form
- Company name, role, salary, location, benefits
- Form validation and styling
- Submits to results page

### 4. Results Page (`#results`)
- Large stability score display (X/10)
- Financial runway analysis panel
- Company risk profile
- Risk assessment with icon indicators
- AI-generated recommendation
- Action buttons (back, new assessment, download PDF)

### 5. Chat Interface (`#chat`) - **NEW**
- Full-height chat container
- Context bar showing user profile data
- Scrollable message history
- User and AI message bubbles
- Styled insight boxes (info, warning, success)
- Quick suggestion chips
- Input area with send button
- Auto-resize textarea
- Keyboard shortcuts (Enter to send, Shift+Enter for newline)

## Features

### Interactive Elements
- **View Switching**: Single-page app with smooth transitions
- **Chat Functionality**: Real-time message sending with simulated AI responses
- **Contextual AI**: AI responses based on keywords (salary, resume, certs, companies, offers)
- **Suggestion Chips**: Quick-action buttons for common questions
- **Responsive Design**: Mobile-friendly layouts

### AI Chat Capabilities
The chat advisor provides intelligent responses for:
- Salary negotiation strategies
- Resume translation (military → civilian)
- Certification roadmaps (Security+, CISSP, etc.)
- Company recommendations by MOS
- Offer evaluation frameworks
- Generic career guidance

## File Structure

```
sitrep-platform/
├── index.html              # Main HTML file (all pages)
├── styles/
│   ├── global.css         # Global styles, navigation, utilities
│   ├── pages.css          # Landing, dashboard, assessment, results
│   └── chat.css           # Chat interface styles
├── scripts/
│   └── app.js             # JavaScript for interactivity
└── README.md              # This file
```

## How to Use

1. **Open**: Simply open `index.html` in any modern web browser
2. **Navigate**: Use the navigation bar or action cards to switch views
3. **Chat**: Click "AI Advisor" in nav or "Ask Transition Question" card
4. **Interact**: Type messages, click suggestion chips, explore features

## View Switching

Pages are controlled by `showView(viewName)` function:
- `showView('landing')` - Landing page
- `showView('dashboard')` - Main dashboard
- `showView('assessment')` - Job assessment form
- `showView('results')` - Assessment results
- `showView('chat')` - AI chat interface

## Next Steps (Implementation)

To turn this into a functional Next.js application:

1. **Install Node.js** (required)
2. **Create Next.js app** with TypeScript
3. **Convert HTML to React components**:
   - `components/Navigation.tsx`
   - `components/Landing.tsx`
   - `components/Dashboard.tsx`
   - `components/Assessment.tsx`
   - `components/Results.tsx`
   - `components/Chat.tsx`
4. **Set up Supabase** (database + auth)
5. **Integrate Claude API** (real AI responses)
6. **Add state management** (React Context or Zustand)
7. **Implement features**:
   - User authentication
   - Profile management
   - Real assessment engine
   - PDF export
   - Offer comparison
   - 90-day planner

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Credits

Design inspired by tactical military interfaces with modern web aesthetics.
Built for transitioning service members seeking data-driven career guidance.
