# CodeVerse — Competitive Coding Contest Platform

> A full-stack, production-ready coding contest platform where students compete and admins orchestrate. Think Codeforces meets a modern SaaS product.

---

## Project Overview

| Field | Detail |
|---|---|
| **Project Name** | CodeArena |
| **Type** | Full-Stack Web Application |
| **Purpose** | Host, manage, and participate in competitive coding contests |
| **Primary Users** | Students (contestants), Teachers (admins/organizers) |
| **Design Theme** | Dark, Minimalist — deep navy/charcoal with electric cyan accents |

---

## Complete Site Structure

```
CodeArena/
├── client/                        # React + TypeScript Frontend
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── common/            # Navbar, Footer, Button, Modal, Badge
│       │   ├── contest/           # ContestCard, ContestTimer, ProblemList
│       │   ├── editor/            # CodeEditor, LanguageSelector, TestCasePanel
│       │   ├── leaderboard/       # LeaderboardTable, RankBadge, ScoreCell
│       │   └── admin/             # AdminSidebar, ContestForm, UserTable
│       ├── pages/
│       │   ├── public/            # Home, Contests, Contest Detail, Leaderboard
│       │   ├── auth/              # Login, Register, ForgotPassword
│       │   ├── user/              # Dashboard, Profile, My Submissions
│       │   └── admin/             # Admin Dashboard, Manage Contests, Problems, Users
│       ├── hooks/                 # useAuth, useContest, useTimer, useWebSocket
│       ├── context/               # AuthContext, ThemeContext
│       ├── services/              # api.ts, auth.service.ts, contest.service.ts
│       ├── types/                 # TypeScript interfaces
│       ├── utils/                 # formatTime, rankColor, parseTestCase
│       └── router/                # React Router DOM v6 routes + guards
│
├── server/                        # Node.js + Express + TypeScript Backend
│   └── src/
│       ├── config/                # db.ts, jwt.config.ts, env.ts
│       ├── controllers/           # auth, contest, problem, submission, leaderboard
│       ├── middleware/            # authMiddleware, roleGuard, rateLimiter, errorHandler
│       ├── models/                # User, Contest, Problem, Submission, Leaderboard
│       ├── routes/                # /api/auth, /api/contests, /api/problems, /api/admin
│       ├── services/              # JudgeService, EmailService, ScoreService
│       ├── utils/                 # ApiError, asyncWrapper, paginate
│       └── app.ts
│
└── shared/                        # Shared types between client & server
    └── types/
```

---

##  Pages — Full Breakdown

### 1. Home / Landing Page (`/`)
**Purpose:** First impression. Converts visitors into registered users.

**Sections:**
- **Hero** — Full-viewport hero with animated background (particle grid or code rain effect), headline: *"Code. Compete. Conquer."*, two CTAs: `Browse Contests` + `Start Competing`
- **Stats Bar** — Animated counters: Total Contests, Active Participants, Problems Solved, Countries
- **Featured Contests** — 3-card horizontal strip of upcoming/live contests with countdown timers
- **How It Works** — 3-step visual flow: Register → Join Contest → Climb Leaderboard
- **Testimonials** — Student/teacher quotes with avatar, university/school name
- **Footer** — Logo, nav links, social icons, copyright

---

### 2. Contest List Page (`/contests`)
**Purpose:** Browse all available contests.

**Sections:**
- **Page Header** — Title + search bar + filter chips (Live, Upcoming, Past, Difficulty)
- **Filter Sidebar (Desktop) / Drawer (Mobile)** — Difficulty, Duration, Tags (DP, Graphs, etc.), Date range
- **Contest Grid** — Responsive card grid. Each card shows:
  - Contest title + organizer
  - Status badge (LIVE ��� / UPCOMING / ENDED)
  - Start time + duration
  - Participant count
  - Difficulty rating (stars or color band)
  - `Register` / `Enter` / `View Results` CTA button
- **Pagination / Infinite Scroll**

---

### 3. Contest Detail Page (`/contests/:id`)
**Purpose:** Contest hub — register, read rules, and enter.

**Tabs:**
- **Overview** — Contest description, rules, scoring format, prizes (if any), organizer info
- **Problems** — List of problems (visible only after contest starts or if registered), with title, points, solved count
- **Leaderboard** — Live leaderboard during contest (auto-refreshing every 30s)
- **My Submissions** — Personal submission history for this contest

**Sidebar:**
- Countdown timer (large, animated)
- Register / Enter Arena button
- Participant count
- Share contest button

---

### 4. Problem Solving Page (`/contests/:id/problems/:problemId`)
**Purpose:** The coding arena — the core product experience.

**Layout (3-panel):**
- **Left Panel** — Problem statement, constraints, examples, hints toggle, tags
- **Center Panel** — Monaco/CodeMirror editor with syntax highlighting, language selector (C++, Python, Java, JS, etc.), theme toggle
- **Right Panel** — Test case runner (custom input), expected output, submission status
- **Bottom Bar** — Run Code | Submit buttons, execution time/memory display
- **Top Bar** — Problem name, contest timer, points, difficulty badge

---

### 5. Global Leaderboard (`/leaderboard`)
**Purpose:** All-time rankings across the platform.

**Sections:**
- **Filter Tabs** — Global / By Contest / Monthly / Weekly
- **Top 3 Podium** — Visual podium for rank 1, 2, 3 with avatars
- **Rankings Table** — Rank, Avatar, Username, Rating, Problems Solved, Contests Won, Streak
- **My Rank Card** — Sticky card at bottom showing current user's rank even if outside top 50

---

### 6. User Dashboard (`/dashboard`)
**Purpose:** Personal hub for the student/contestant.

**Sections:**
- **Welcome Header** — Username, avatar, rating badge, join date
- **Stats Overview** — Total contests, problems solved, best rank, current streak (cards)
- **Active Contests** — Contests currently registered for with countdown
- **Recent Submissions** — Last 10 submissions with status (AC/WA/TLE/CE)
- **Activity Heatmap** — GitHub-style daily activity grid
- **Recommended Contests** — Based on user's performance level

---

### 7. User Profile (`/profile/:username`)
**Purpose:** Public-facing user profile (like Codeforces profile).

**Sections:**
- Avatar, username, bio, social links
- Rating graph over time
- Contest history table
- Solved problems by category (radar/bar chart)
- Badges/achievements

---

### 8. Auth Pages

#### Register (`/register`)
- Name, Username, Email, Password, Role (Student / Teacher)
- University/School (optional)
- Terms checkbox

#### Login (`/login`)
- Email + Password
- Remember me, Forgot password link
- OAuth optional (Google)

#### Forgot Password (`/forgot-password`)
- Email input → OTP/email link flow

---

### 9. Admin Pages (Role-guarded: `ADMIN` or `TEACHER`)

#### Admin Dashboard (`/admin`)
- KPI cards: Total Users, Active Contests, Submissions Today, Pending Reviews
- Recent activity feed
- Quick action buttons: + New Contest, + New Problem

#### Manage Contests (`/admin/contests`)
- Full CRUD table of all contests
- Bulk actions: Publish, Archive, Delete
- Status toggle (Draft → Published → Live → Ended)

#### Create / Edit Contest (`/admin/contests/new`, `/admin/contests/:id/edit`)
**Form Fields:**
- Title, Description (rich text editor)
- Start DateTime, End DateTime, Duration
- Visibility (Public / Private + invite code)
- Difficulty Level
- Scoring type (ACM-style / IOI-style)
- Add Problems (from problem bank or create new)
- Tags
- Max participants (optional cap)

#### Problem Bank (`/admin/problems`)
- Table of all problems with difficulty, tags, usage count
- Create/Edit problem form:
  - Title, Statement (LaTeX/Markdown support)
  - Input/Output format
  - Constraints
  - Test Cases (hidden + sample) with file upload
  - Time limit, Memory limit
  - Editorial (optional, revealed after contest)
  - Tags (DP, Graph, Math, etc.)

#### Manage Users (`/admin/users`)
- Table: Avatar, Name, Email, Role, Status, Join Date
- Search + filter
- Actions: Promote to Admin, Ban, View Profile

#### Submissions Review (`/admin/submissions`)
- All submissions across all contests
- Filter by contest, problem, language, status
- View code, re-judge option

---

### 10. Help / FAQ Page (`/help`)
- Accordion FAQ sections: Getting Started, Contests, Scoring, Technical Issues
- Contact form
- Links to documentation

---

### 11. ��� Terms & Privacy (`/terms`, `/privacy`)
- Static legal pages

---

## ��� Design System — Tailwind v4 + tweakcn

> **Tailwind v4 is CSS-first.** No more `tailwind.config.js` for design tokens. All theme customization lives in your CSS file using `@theme` and `@layer`. tweakcn extends this with a shadcn/ui-compatible semantic token layer.

---

### Installation

```bash
# Tailwind CSS v4
npm install tailwindcss@next @tailwindcss/vite@next

# tweakcn CLI (generates your CSS theme)
npx tweakcn@latest init

# shadcn/ui (component library powered by tweakcn tokens)
npx shadcn@latest init
```

#### `vite.config.ts`
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),   // ← replaces postcss plugin entirely in v4
  ],
})
```

#### `src/index.css` — single entry point, no config file needed
```css
@import "tailwindcss";
@import "./theme.css";   /* tweakcn-generated theme tokens */
```

---

### tweakcn Theme — `src/theme.css`

tweakcn generates a semantic CSS variable layer that maps to Tailwind v4's `@theme`. Below is the **full CodeArena dark theme**:

```css
/* ============================================================
   CodeArena — tweakcn Theme (Dark Mode Default)
   Generated with: npx tweakcn@latest
   Compatible with: Tailwind v4 + shadcn/ui
   ============================================================ */

@layer base {
  :root {
    /* ── Radius ─────────────────────────────────────────── */
    --radius: 0.75rem;

    /* ── Base Colors (Dark Theme) ────────────────────────── */
    --background:        210 33% 6%;     /* #0A0E1A deep navy */
    --foreground:        210 20% 98%;    /* #F9FAFB near white */

    --card:              220 26% 9%;     /* #111827 surface */
    --card-foreground:   210 20% 98%;

    --popover:           220 26% 9%;
    --popover-foreground:210 20% 98%;

    /* ── Primary — Electric Cyan ─────────────────────────── */
    --primary:           189 94% 43%;    /* #06B6D4 */
    --primary-foreground:210 33% 6%;     /* dark text on cyan */

    /* ── Secondary — Violet ──────────────────────────────── */
    --secondary:         262 83% 63%;    /* #8B5CF6 */
    --secondary-foreground: 210 20% 98%;

    /* ── Muted ───────────────────────────────────────────── */
    --muted:             217 19% 17%;    /* #1F2937 */
    --muted-foreground:  215 14% 44%;    /* #6B7280 */

    /* ── Accent (hover states, subtle highlights) ────────── */
    --accent:            189 94% 43%;    /* same as primary for focus rings */
    --accent-foreground: 210 33% 6%;

    /* ── Destructive / Error ─────────────────────────────── */
    --destructive:       0 84% 60%;      /* #EF4444 */
    --destructive-foreground: 210 20% 98%;

    /* ── Border & Input ──────────────────────────────────── */
    --border:            217 19% 17%;    /* #1F2937 */
    --input:             217 19% 17%;
    --ring:              189 94% 43%;    /* cyan focus ring */

    /* ── Semantic Status Colors (CodeArena-specific) ─────── */
    --status-accepted:   158 64% 52%;    /* #10B981 green */
    --status-wrong:      0 84% 60%;      /* #EF4444 red */
    --status-tle:        38 92% 50%;     /* #F59E0B amber */
    --status-pending:    215 14% 44%;    /* #6B7280 gray */
    --status-ce:         271 81% 60%;    /* #A855F7 purple */
    --status-re:         25 95% 53%;     /* #F97316 orange */

    /* ── Difficulty Colors ───────────────────────────────── */
    --diff-beginner:     158 64% 52%;    /* green */
    --diff-intermediate: 38 92% 50%;     /* amber */
    --diff-advanced:     0 84% 60%;      /* red */
    --diff-expert:       271 81% 60%;    /* purple */

    /* ── Rank Colors (Leaderboard) ───────────────────────── */
    --rank-gold:         43 96% 56%;     /* #FBBF24 */
    --rank-silver:       215 14% 71%;    /* #9CA3AF */
    --rank-bronze:       25 75% 53%;     /* #D97706 */

    /* ── Chart Colors ────────────────────────────────────── */
    --chart-1:           189 94% 43%;    /* cyan */
    --chart-2:           262 83% 63%;    /* violet */
    --chart-3:           158 64% 52%;    /* green */
    --chart-4:           38 92% 50%;     /* amber */
    --chart-5:           0 84% 60%;      /* red */

    /* ── Sidebar (Admin Panel) ───────────────────────────── */
    --sidebar-background:    220 30% 7%;
    --sidebar-foreground:    210 20% 90%;
    --sidebar-primary:       189 94% 43%;
    --sidebar-primary-foreground: 210 33% 6%;
    --sidebar-accent:        217 19% 14%;
    --sidebar-accent-foreground: 210 20% 90%;
    --sidebar-border:        217 19% 14%;
    --sidebar-ring:          189 94% 43%;
  }

  /* Optional: light mode override (not default, but available) */
  .light {
    --background:        0 0% 100%;
    --foreground:        220 26% 9%;
    --card:              0 0% 98%;
    --card-foreground:   220 26% 9%;
    --primary:           189 94% 33%;
    --primary-foreground:0 0% 100%;
    --secondary:         262 83% 55%;
    --secondary-foreground: 0 0% 100%;
    --muted:             210 20% 94%;
    --muted-foreground:  215 14% 44%;
    --border:            214 20% 88%;
    --input:             214 20% 88%;
    --ring:              189 94% 33%;
  }
}
```

---

### Tailwind v4 `@theme` Extension — `src/index.css`

In v4, you extend the design system directly in CSS using `@theme`. This replaces `theme.extend` in the old config:

```css
@import "tailwindcss";
@import "./theme.css";

@theme {
  /* ── Fonts ───────────────────────────────────────────── */
  --font-display:  "Outfit Variable", sans-serif;
  --font-body:     "DM Sans Variable", sans-serif;
  --font-mono:     "JetBrains Mono Variable", monospace;

  /* ── Custom Animations ───────────────────────────────── */
  --animate-pulse-glow:    pulse-glow 2s ease-in-out infinite;
  --animate-slide-up:      slide-up 0.3s ease-out;
  --animate-fade-in:       fade-in 0.4s ease-out;
  --animate-countdown:     countdown-tick 1s step-end infinite;
  --animate-rank-flash:    rank-flash 0.5s ease-out;

  /* ── Custom Shadows (glow effects) ──────────────────── */
  --shadow-glow-cyan:   0 0 20px hsl(189 94% 43% / 0.3);
  --shadow-glow-violet: 0 0 20px hsl(262 83% 63% / 0.3);
  --shadow-glow-green:  0 0 20px hsl(158 64% 52% / 0.2);
  --shadow-glow-red:    0 0 20px hsl(0 84% 60% / 0.2);

  /* ── Breakpoints (same as v3 defaults, explicit in v4) ─ */
  --breakpoint-sm:  40rem;
  --breakpoint-md:  48rem;
  --breakpoint-lg:  64rem;
  --breakpoint-xl:  80rem;
  --breakpoint-2xl: 96rem;
}

/* ── Keyframes ────────────────────────────────────────────── */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 10px hsl(189 94% 43% / 0.2); }
  50%       { box-shadow: 0 0 30px hsl(189 94% 43% / 0.6); }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes rank-flash {
  0%   { background-color: hsl(189 94% 43% / 0.2); }
  100% { background-color: transparent; }
}

/* ── Utility Layer — custom utilities using CSS vars ─────── */
@layer utilities {
  .text-gradient-cyan {
    background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .bg-glass {
    background: hsl(var(--card) / 0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid hsl(var(--border) / 0.5);
  }

  .glow-cyan {
    box-shadow: var(--shadow-glow-cyan);
  }

  .glow-violet {
    box-shadow: var(--shadow-glow-violet);
  }

  .border-glow {
    border-color: hsl(var(--primary) / 0.4);
    box-shadow: 0 0 0 1px hsl(var(--primary) / 0.15);
  }

  /* Status badge utilities */
  .status-accepted   { color: hsl(var(--status-accepted)); }
  .status-wrong      { color: hsl(var(--status-wrong)); }
  .status-tle        { color: hsl(var(--status-tle)); }
  .status-pending    { color: hsl(var(--status-pending)); }
  .status-ce         { color: hsl(var(--status-ce)); }
  .status-re         { color: hsl(var(--status-re)); }

  /* Difficulty badge utilities */
  .diff-beginner     { color: hsl(var(--diff-beginner)); }
  .diff-intermediate { color: hsl(var(--diff-intermediate)); }
  .diff-advanced     { color: hsl(var(--diff-advanced)); }
  .diff-expert       { color: hsl(var(--diff-expert)); }
}
```

---

### tweakcn Component Tokens — Usage Examples

tweakcn maps these CSS variables to shadcn/ui component props. Use them directly in JSX:

```tsx
// Contest Card using tweakcn tokens
<div className="bg-card border border-border rounded-xl p-6 hover:glow-cyan transition-all duration-200">
  <Badge className="bg-primary/10 text-primary border-primary/20">LIVE</Badge>
  <h3 className="font-display text-foreground mt-2">Algo Sprint #12</h3>
  <p className="text-muted-foreground text-sm">by Prof. Mehta</p>
</div>

// Status verdict badge
<span className="status-accepted font-mono text-sm font-semibold">● Accepted</span>
<span className="status-wrong font-mono text-sm font-semibold">● Wrong Answer</span>
<span className="status-tle font-mono text-sm font-semibold">● Time Limit</span>

// Difficulty badge
<Badge className="diff-beginner bg-[hsl(var(--diff-beginner)/0.1)]">Easy</Badge>
<Badge className="diff-advanced bg-[hsl(var(--diff-advanced)/0.1)]">Hard</Badge>

// Glass card (modals, overlays)
<div className="bg-glass rounded-2xl p-8 shadow-glow-cyan">
  ...
</div>

// Gradient text (hero headline)
<h1 className="font-display text-6xl font-bold text-gradient-cyan">
  Code. Compete. Conquer.
</h1>
```

---

### Component Token Reference Table

| Token | CSS Variable | Used In |
|---|---|---|
| `bg-background` | `--background` | Page root, body |
| `bg-card` | `--card` | Contest cards, panels |
| `text-foreground` | `--foreground` | Primary body text |
| `text-muted-foreground` | `--muted-foreground` | Labels, captions |
| `bg-primary` | `--primary` | CTA buttons, links |
| `text-primary` | `--primary` | Active nav, badges |
| `bg-secondary` | `--secondary` | Secondary buttons |
| `border-border` | `--border` | Card borders, dividers |
| `ring-ring` | `--ring` | Focus rings |
| `bg-muted` | `--muted` | Input backgrounds |
| `bg-destructive` | `--destructive` | Delete buttons, errors |
| `bg-sidebar-background` | `--sidebar-background` | Admin sidebar |

---

### Key v3 → v4 Migration Notes

| v3 (old) | v4 (new) |
|---|---|
| `tailwind.config.js` theme extension | `@theme {}` block in CSS |
| `postcss.config.js` | `@tailwindcss/vite` plugin |
| `content: [...]` paths in config | Auto-detected by Vite plugin |
| `theme.extend.colors` | `@theme { --color-*: ... }` |
| `darkMode: 'class'` | `@variant dark (&:is(.dark *)) {}` |
| `theme.extend.fontFamily` | `@theme { --font-*: ... }` |
| `arbitrary: [value]` syntax | Still supported, same syntax |

---

### ���️ Typography

```css
/* Add to index.css after @import "tailwindcss" */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300..800&family=DM+Sans:wght@300..700&family=JetBrains+Mono:wght@400;500;600&display=swap');
```

| Role | Font | Tailwind Class |
|---|---|---|
| Hero / Display | Outfit (300–800) | `font-display` |
| Body / UI | DM Sans (300–700) | `font-body` or default |
| Code / Mono | JetBrains Mono | `font-mono` |

---

### Component Tokens (Spatial)

```
Rounded corners:  --radius: 0.75rem  →  rounded-xl cards, rounded-lg buttons
Card padding:     p-6 (desktop) / p-4 (mobile)
Section spacing:  space-y-8 between sections, gap-6 in grids
Glow shadows:     shadow-glow-cyan on primary actions, shadow-glow-violet on secondary
Transitions:      transition-all duration-200 ease-in-out (all interactive elements)
Glass morphism:   .bg-glass utility on modals, drawers, overlays
```

---

## ��� Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite |
| **Routing** | React Router DOM v6 |
| **Styling** | TailwindCSS v4 + tweakcn (CSS-first theming) |
| **State** | React Context + React Query (TanStack) |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Charts** | Recharts or Chart.js |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (access + refresh tokens) + bcrypt |
| **Real-time** | Socket.IO (live leaderboard, submission status) |
| **File Storage** | AWS S3 or Cloudinary (problem assets) |
| **Email** | Nodemailer or Resend |
| **Code Judge** | Judge0 API (self-hosted or cloud) |
| **Deployment** | Docker + Vercel (client) + Railway/Render (server) |

---

## ���️ MongoDB Data Models

### User
```ts
{
  _id, username, email, passwordHash,
  role: 'STUDENT' | 'TEACHER' | 'ADMIN',
  profile: { avatar, bio, institution, country },
  rating: Number,
  stats: { solved, contests, wins, streak },
  createdAt, updatedAt
}
```

### Contest
```ts
{
  _id, title, description, slug,
  createdBy: ObjectId(User),
  status: 'DRAFT' | 'PUBLISHED' | 'LIVE' | 'ENDED',
  startTime, endTime, duration,
  scoringType: 'ACM' | 'IOI',
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
  visibility: 'PUBLIC' | 'PRIVATE',
  inviteCode?,
  problems: [ObjectId(Problem)],
  participants: [ObjectId(User)],
  tags: [String],
  maxParticipants?
}
```

### Problem
```ts
{
  _id, title, slug, statement,
  inputFormat, outputFormat, constraints,
  sampleTestCases: [{ input, output, explanation }],
  hiddenTestCases: [{ input, output }],
  timeLimit, memoryLimit,
  difficulty, tags,
  points, editorial?,
  createdBy: ObjectId(User)
}
```

### Submission
```ts
{
  _id,
  userId: ObjectId(User),
  contestId: ObjectId(Contest),
  problemId: ObjectId(Problem),
  language, code,
  status: 'PENDING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TLE' | 'MLE' | 'CE' | 'RE',
  score, executionTime, memoryUsed,
  testResults: [{ passed, time, memory }],
  submittedAt
}
```

### Leaderboard (cached/materialized view)
```ts
{
  _id, contestId,
  rankings: [{
    userId, username, avatar,
    totalScore, penalty,
    solvedProblems: [{ problemId, attempts, acceptedAt, score }],
    rank, lastSubmission
  }],
  updatedAt
}
```

---

## ��� API Routes

```
AUTH
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/logout
  POST   /api/auth/refresh
  POST   /api/auth/forgot-password
  POST   /api/auth/reset-password

CONTESTS
  GET    /api/contests               — list (filters, pagination)
  GET    /api/contests/:id           — detail
  POST   /api/contests/:id/register  — join contest
  GET    /api/contests/:id/problems  — problems (auth + registered)
  GET    /api/contests/:id/leaderboard

PROBLEMS
  GET    /api/problems/:id
  POST   /api/problems/:id/submit
  GET    /api/problems/:id/submissions (mine)

SUBMISSIONS
  GET    /api/submissions/:id        — result polling

LEADERBOARD
  GET    /api/leaderboard/global
  GET    /api/leaderboard/monthly

USERS
  GET    /api/users/:username
  PUT    /api/users/me
  GET    /api/users/me/dashboard

ADMIN (role: ADMIN | TEACHER)
  GET/POST/PUT/DELETE  /api/admin/contests
  GET/POST/PUT/DELETE  /api/admin/problems
  GET                  /api/admin/users
  PUT                  /api/admin/users/:id/role
  GET                  /api/admin/submissions
  POST                 /api/admin/submissions/:id/rejudge
  GET                  /api/admin/stats
```

---

## ��� Key User Flows

### Student Flow
```
Land on Home → Browse Contests → Register Account →
Join Contest → Solve Problems → Submit Code →
See Verdict (AC/WA/TLE) → View Leaderboard → Check Profile
```

### Admin/Teacher Flow
```
Login → Admin Dashboard → Create Contest →
Add Problems (from bank or new) → Set Test Cases →
Publish Contest → Monitor Live Submissions →
Review Leaderboard → End Contest → Publish Editorials
```

---

## ��� Responsive Breakpoints

| Breakpoint | Layout Change |
|---|---|
| `sm` (640px) | Single column cards, stacked nav |
| `md` (768px) | 2-col grid, sidebar appears |
| `lg` (1024px) | 3-col grid, full admin sidebar |
| `xl` (1280px) | Full 3-panel problem layout |

---

## ⚡ Performance Considerations

- Code splitting per route with `React.lazy + Suspense`
- React Query for server state caching + background refetch
- Debounced search inputs
- Virtualized list for leaderboard (react-window)
- Monaco Editor loaded lazily
- Contest list paginated (20/page)
- Leaderboard updates via Socket.IO (avoid polling)
- JWT refresh token rotation

---

## ��� Security

- Passwords hashed with `bcrypt` (cost factor 12)
- JWT: short-lived access token (15min) + refresh token (7d) in httpOnly cookie
- Role-based route guards on both client and server
- Rate limiting on auth endpoints (`express-rate-limit`)
- Input validation with `zod` on all API routes
- CORS restricted to client origin
- Contest problems hidden behind auth + registration check
- Code submissions sandboxed via Judge0

---

## ��� Development Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Project scaffolding (Vite + Express + Mongo)
- [ ] Auth system (register, login, JWT, guards)
- [ ] User model + basic profile
- [ ] Navigation + Layout components

### Phase 2 — Core Contest Flow (Week 3–4)
- [ ] Contest CRUD (admin)
- [ ] Contest list + detail pages
- [ ] Contest registration
- [ ] Problem bank + problem detail

### Phase 3 — Code Execution (Week 5–6)
- [ ] Monaco Editor integration
- [ ] Judge0 API integration
- [ ] Submission pipeline + status polling
- [ ] Scoring logic (ACM/IOI)

### Phase 4 — Leaderboard & Real-time (Week 7)
- [ ] Socket.IO leaderboard updates
- [ ] Global leaderboard
- [ ] Per-contest leaderboard

### Phase 5 — Polish & Deploy (Week 8)
- [ ] Dashboard + activity heatmap
- [ ] Public profile page
- [ ] Mobile responsiveness audit
- [ ] Docker setup + deployment

---

## ��� Suggested Folder Naming Conventions

- Components: `PascalCase` (e.g., `ContestCard.tsx`)
- Hooks: `camelCase` prefixed with `use` (e.g., `useContestTimer.ts`)
- Services: `camelCase` with `.service.ts` suffix
- Types: `PascalCase` interfaces in `types/` directory
- Constants: `SCREAMING_SNAKE_CASE` in `constants/` files
- Routes: kebab-case URLs (`/admin/manage-contests`)

---
