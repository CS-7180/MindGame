# MindGame — Product Requirements Document (PRD)

**Project:** MindGame — Pre-Game Mental Routine Builder for Peak Athletic Performance
**Authors:** Raj Laskar, Vineela Goli
**Version:** 1.0
**Last Updated:** February 2026
**Status:** Ready for Development

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Roles](#3-user-roles)
4. [Scope — MoSCoW Reference](#4-scope--moscow-reference)
5. [Functional Requirements](#5-functional-requirements)
6. [Technical Architecture & Implementation Plan](#6-technical-architecture--implementation-plan)
7. [Database Schema](#7-database-schema)
8. [API Design](#8-api-design)
9. [Sprint Plan](#9-sprint-plan)
10. [Sprint Milestones](#10-sprint-milestones)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Open Risks](#12-open-risks)

---

## 1. Product Overview

### Problem Statement

Athletes at all levels — from college competitors to weekend recreational players — consistently underperform relative to their training because they lack structured mental preparation. Sports psychology is gatekept behind elite programs and prohibitive costs. Existing resources (YouTube videos, generic journaling apps, articles) fail because they are unstructured, impersonal, and provide no feedback loop to tell athletes whether the effort is paying off.

Three independently validated pain points drive this product:

- The **practice-to-match performance gap** is mental, not physical
- Athletes have **tried something before** (playlists, YouTube, journaling) — but it didn't stick due to lack of structure, personalization, or feedback
- **Social stigma** around mental struggle means athletes need a private, non-judgmental space

### Solution

MindGame is a full-stack web application that lets athletes build personalized pre-game mental routines using techniques like visualization, breathing, and affirmations. A rule-based recommender matches athletes to a starting routine based on their sport and anxiety patterns. Post-game reflections surface correlations between routine adherence and performance over time. Coaches can create and share routine templates with their teams, while ensuring athlete ownership through mandatory customization.

### Core Insight

> Routines die when externally owned. The product's job is to make every athlete the author of their own routine — not a consumer of someone else's.

---

## 2. Goals & Success Metrics

### Product Goals

| Goal | Description |
|---|---|
| Habit formation | Athletes complete their routine on at least 60% of game days after 4 weeks |
| Adherence signal | Athletes who use the dashboard log for 5+ games before churning |
| Coach adoption | At least 1 coach shares a template with their full roster in Sprint 2 |
| Privacy trust | Zero athlete reports of data visibility concerns post-launch |

### Sprint-Level Success Criteria

**Sprint 1 Done When:**
- An athlete can sign up, complete onboarding, build a personalized routine, and execute it with guided steps
- All data is private by default, enforced at the database level via RLS

**Sprint 2 Done When:**
- An athlete can log pre-game and post-game entries and view their correlation dashboard
- A coach can create a template and share it; an athlete can receive, customize, and save it
- Push notification reminders fire correctly before a scheduled game

---

## 3. User Roles

| Role | Description | Key Permissions |
|---|---|---|
| **Athlete** | Primary user. College or recreational player. | Build/run routines, log pre/post game entries, view own dashboard and history. Cannot see other athletes' data. |
| **Coach** | Secondary user. Amateur or rec league coach. | Create routine templates, share with roster, view roster activation status only (not athlete logs). |
| **Admin** | Internal only (Raj/Vineela). No user-facing UI in either sprint. | Manage users, view aggregate system data for debugging. |

### Role Selection Flow

Single login path for all users. Role (Athlete / Coach) is selected at account creation and stored in the `profiles` table. Role cannot be changed post-signup without admin intervention.

---

## 4. Scope — MoSCoW Reference

| Story ID | Title | MoSCoW | Sprint |
|---|---|---|---|
| US-01 | Onboarding: Sport & Anxiety Profile | Must Have | Sprint 1 |
| US-02 | Routine Builder: Create Personal Routine | Must Have | Sprint 1 |
| US-03 | Guided Routine Execution | Must Have | Sprint 1 |
| US-04 | Time-Tiered Routine Templates | Must Have | Sprint 1 |
| US-05 | Pre-Game Entry Log | Must Have | Sprint 1 |
| US-12 | Privacy: All Data Private by Default | Must Have | Sprint 1 |
| US-06 | Post-Game Reflection Entry | Should Have | Sprint 2 |
| US-07 | Correlation Dashboard | Should Have | Sprint 2 |
| US-08 | Pre-Arrival Routine Reminder | Should Have | Sprint 2 |
| US-11 | Routine History & Entry Review | Should Have | Sprint 2 |
| US-09 | Coach: Create & Share Template | Could Have | Sprint 2 |
| US-10 | Athlete: Customize Coach Template | Could Have | Sprint 2 |
| — | Mid-Game Recovery Techniques | Won't Have | — |
| — | Group / Team Ritual Feature | Won't Have | — |
| — | Social / Community Features | Won't Have | — |

---

## 5. Functional Requirements

### FR-01 — Authentication & Role Management

- Users can sign up with email/password or Google OAuth (via Supabase Auth)
- Role (Athlete / Coach) is selected at signup and stored on the profile
- Authenticated session persists across browser refreshes using Supabase session tokens
- Unauthenticated users cannot access any app route beyond `/login` and `/signup`
- All routes are protected server-side via Next.js middleware

### FR-02 — Onboarding (Athlete)

- 4-step questionnaire: sport → competitive level → anxiety symptoms → available time
- Questionnaire completes in ≤2 minutes (4 screens, no long-form text input)
- On completion, a rule-based recommender generates a suggested starter routine
- Recommender logic: map anxiety symptoms + time preference to a curated technique set (no ML, pure if/else rules in a server-side utility function)
- Skip option available at step 1 — no forced gate
- Onboarding data saved to `athlete_profiles` table on completion

### FR-03 — Routine Builder (Athlete)

- Technique library: breathing, visualization, affirmations, focus cues, grounding (minimum 6 techniques at launch, seeded in DB)
- Athlete can add techniques as steps, reorder via drag-and-drop, remove steps
- Running time estimate displayed as steps are added/removed
- Routine saved with athlete-provided name; up to 5 routines per athlete profile
- Routine Builder is accessible from the athlete home screen at any time

### FR-04 — Guided Routine Execution (Athlete)

- Full-screen step-by-step walkthrough, one technique at a time
- Each step displays: technique name, explicit instruction text (not just the name), category, and duration
- Progress indicator shows steps remaining and estimated time left
- Pause state persisted in component state (not DB — session only)
- Completion screen triggers pre-game log prompt (FR-05)

### FR-05 — Pre-Game Entry Log (Athlete)

- Prompted automatically on routine completion; also accessible manually from home screen
- Captures: routine completed (yes/partial/no), anxiety level (1–5), confidence level (1–5), optional notes (max 200 chars)
- Entry saved with UTC timestamp, linked to athlete's profile and current date
- Entries accessible from history view (FR-11)

### FR-06 — Post-Game Reflection Entry (Athlete)

- Accessible manually from home screen or dashboard
- Push notification sent after game's scheduled end time (FR-08 handles scheduling)
- Captures: self-rated performance (1–5), mental state during game (1–5), optional one-word descriptor
- Reflection linked to the pre-game entry from the same calendar day
- Dismissible — no repeated reminders for the same game date

### FR-07 — Correlation Dashboard (Athlete)

- Requires minimum 5 logged game entries before patterns are displayed
- Below threshold: placeholder UI explains how many more entries are needed
- Above threshold: bar chart comparing avg performance on routine-completed days vs. not
- Streak counter: consecutive game days with routine completed
- Disclaimer displayed: "Results are self-reported and not scientifically validated"
- Chart built using Recharts (included in Next.js ecosystem, no additional license cost)

### FR-08 — Pre-Arrival Routine Reminder (Athlete)

- Athlete adds game to schedule with sport name, date, and start time
- Reminder options: 30, 45, or 60 minutes before game start time
- Default: 45 minutes, labeled "before you leave home"
- Notification payload: routine name, estimated completion time, deep link into routine walkthrough
- Implementation: Supabase scheduled Edge Function + Web Push API (via `web-push` npm package)
- Athlete can disable all reminders in notification settings without affecting other features

### FR-09 — Coach: Create & Share Template (Coach)

- Coach has a separate dashboard view after login (role-gated)
- Coach can create a routine template using the same technique library as athletes
- Coach sets: recommended time tier, optional team note
- Sharing sends in-app notification to all athletes on coach's roster
- Coach can view roster: athlete name + active routine saved (yes/no) — nothing else
- Coach cannot see anxiety scores, performance ratings, or reflection notes — enforced via RLS

### FR-10 — Athlete: Customize Coach Template (Athlete)

- Athlete receives in-app notification when a template is shared
- Notification shows: template name, coach note, step preview, estimated time
- Athlete must tap "Customize & Save" to enter routine builder with template pre-loaded
- Athlete cannot run the coach's template directly — they must save a personal copy first
- Saved copy is owned by athlete — future edits do not affect the coach's original
- Decline option available — dismissed templates do not appear in routine list

### FR-11 — Routine History & Entry Review (Athlete)

- Reverse chronological list of all game entries
- Each row shows: date, sport, routine completed badge, anxiety score, performance score
- Tap to expand: full pre-game log + post-game reflection for that day including notes
- Filter by: routine completed status, date range, sport
- Data persists across sessions; survives log-out/log-in

### FR-12 — Privacy: All Data Private by Default

- Implemented via Supabase Row Level Security (RLS) — enforced at DB level, not application layer
- Athletes can only SELECT/INSERT/UPDATE/DELETE their own rows across all tables
- Coaches can SELECT athlete rows only for: `athlete_id` and `has_active_routine` (boolean derived field)
- No public profiles, leaderboards, or sharing features exist anywhere in the app
- Data deletion: athlete can delete individual entries or full account from settings
- Account deletion triggers cascade delete across all athlete-owned rows

---

## 6. Technical Architecture & Implementation Plan

### 6.1 System Architecture Overview

```
┌─────────────────────────────────────────────┐
│               CLIENT BROWSER                │
│         Next.js React App (Vercel)          │
│   Pages / App Router + React Components     │
│   Tailwind CSS + shadcn/ui                  │
└──────────────────┬──────────────────────────┘
                   │ HTTPS
                   │ Next.js API Routes (/api/*)
                   │ Server Components (RSC)
┌──────────────────▼──────────────────────────┐
│            NEXT.JS SERVER LAYER             │
│   API Routes — business logic & DB queries  │
│   Middleware — auth gate on all routes      │
│   Edge Functions — reminder scheduling      │
└──────────────────┬──────────────────────────┘
                   │ Supabase JS Client
┌──────────────────▼──────────────────────────┐
│                 SUPABASE                    │
│   PostgreSQL — primary data store           │
│   Row Level Security — privacy enforcement  │
│   Supabase Auth — email/password + Google   │
│   Realtime — in-app notifications           │
│   Edge Functions — push notification cron   │
└─────────────────────────────────────────────┘
```

### 6.2 Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, file-based routing, API routes, Vercel-native |
| UI Library | React 18 | Component model, hooks, server components |
| Styling | Tailwind CSS v3 | Utility-first, matches wireframe aesthetic |
| Component Library | shadcn/ui | Accessible components (Dialog, Select, Slider) built on Radix UI + Tailwind |
| Charts | Recharts | Lightweight, React-native, sufficient for bar/line charts in dashboard |
| Database | Supabase (PostgreSQL) | Relational queries for correlation data, RLS for privacy, Auth built-in |
| Authentication | Supabase Auth | Email/password + Google OAuth, session management, JWT |
| Notifications | Web Push API + `web-push` npm | Browser push notifications for pre-game reminders |
| Deployment | Vercel | Zero-config Next.js deployment, preview URLs per PR |
| Environment Config | Vercel Environment Variables | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |

### 6.3 Project Directory Structure

```
mindgame/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (athlete)/
│   │   ├── onboarding/page.tsx
│   │   ├── home/page.tsx
│   │   ├── routine/
│   │   │   ├── builder/page.tsx
│   │   │   ├── execute/[id]/page.tsx
│   │   │   └── complete/page.tsx
│   │   ├── log/
│   │   │   ├── pre/page.tsx
│   │   │   └── post/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── history/page.tsx
│   │   └── settings/page.tsx
│   ├── (coach)/
│   │   ├── coach/home/page.tsx
│   │   ├── coach/templates/page.tsx
│   │   ├── coach/templates/new/page.tsx
│   │   └── coach/roster/page.tsx
│   ├── api/
│   │   ├── routines/route.ts
│   │   ├── routines/[id]/route.ts
│   │   ├── logs/pre/route.ts
│   │   ├── logs/post/route.ts
│   │   ├── games/route.ts
│   │   ├── dashboard/route.ts
│   │   ├── coach/templates/route.ts
│   │   ├── coach/roster/route.ts
│   │   └── notifications/subscribe/route.ts
│   ├── layout.tsx
│   └── middleware.ts             # Auth gate — protects all routes
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── onboarding/
│   ├── routine/
│   ├── logging/
│   ├── dashboard/
│   ├── coach/
│   └── shared/
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client (API routes)
│   │   └── middleware.ts         # Session refresh
│   ├── recommender.ts            # Rule-based routine recommender
│   ├── push-notifications.ts     # Web Push utility
│   └── utils.ts
├── supabase/
│   ├── migrations/               # SQL migration files
│   └── seed.sql                  # Techniques seed data
├── types/
│   └── database.ts               # Generated Supabase types
├── public/
├── .env.local
└── next.config.ts
```

### 6.4 Authentication Flow

```
User visits /home
      │
      ▼
middleware.ts checks Supabase session token
      │
   ┌──┴──┐
   │     │
Valid   Invalid
   │     │
   ▼     ▼
Proceed  Redirect to /login
   │
   ▼
Check role from profiles table
   │
   ├── athlete → render (athlete) layout
   └── coach   → render (coach) layout
```

**Signup flow:**
1. User fills email + password (or clicks Google OAuth)
2. Supabase creates auth user, returns session
3. `profiles` row auto-created via Postgres trigger on `auth.users` insert
4. User selects role on `/onboarding/role` screen (first-time only)
5. Role written to `profiles.role`; athlete routed to onboarding questionnaire, coach to coach home

### 6.5 Rule-Based Recommender Logic

Implemented as a pure TypeScript utility function in `lib/recommender.ts`. No external service, no AI dependency.

```typescript
// lib/recommender.ts

type AnxietySymptom =
  | "overthinking"
  | "physical_tension"
  | "loss_of_focus"
  | "self_doubt"
  | "rushing"
  | "negativity_after_errors";

type TimePreference = "2min" | "5min" | "10min";

const SYMPTOM_TECHNIQUE_MAP: Record<AnxietySymptom, string[]> = {
  overthinking:           ["box_breathing", "focus_word"],
  physical_tension:       ["body_scan", "deep_breathing"],
  loss_of_focus:          ["focus_word", "visualization"],
  self_doubt:             ["affirmations", "visualization"],
  rushing:                ["box_breathing", "deep_breathing"],
  negativity_after_errors:["affirmations", "focus_word"],
};

const TIME_LIMITS: Record<TimePreference, number> = {
  "2min": 2,
  "5min": 5,
  "10min": 10,
};

export function recommend(
  symptoms: AnxietySymptom[],
  timePreference: TimePreference,
  allTechniques: Technique[]
): Technique[] {
  const techMap = new Map(allTechniques.map(t => [t.slug, t]));
  const scored = new Map<string, number>();

  // Score techniques by symptom frequency match
  for (const symptom of symptoms) {
    for (const slug of SYMPTOM_TECHNIQUE_MAP[symptom] || []) {
      scored.set(slug, (scored.get(slug) || 0) + 1);
    }
  }

  // Sort by score descending
  const ranked = [...scored.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([slug]) => techMap.get(slug))
    .filter(Boolean) as Technique[];

  // Fill up to time limit
  const limit = TIME_LIMITS[timePreference];
  const result: Technique[] = [];
  let total = 0;

  for (const technique of ranked) {
    if (total + technique.duration_minutes <= limit) {
      result.push(technique);
      total += technique.duration_minutes;
    }
  }

  return result;
}
```

### 6.6 Privacy Implementation — Row Level Security

All privacy requirements (US-12) are enforced at the Postgres layer via RLS policies, not application code. This means even a bug in the API layer cannot leak data.

```sql
-- Enable RLS on all user-data tables
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_roster ENABLE ROW LEVEL SECURITY;

-- Athletes can only access their own rows
CREATE POLICY "athlete_own_routines"
  ON routines FOR ALL
  USING (auth.uid() = athlete_id);

CREATE POLICY "athlete_own_logs"
  ON game_logs FOR ALL
  USING (auth.uid() = athlete_id);

-- Coaches can only see roster activation status
CREATE POLICY "coach_roster_read"
  ON coach_roster FOR SELECT
  USING (auth.uid() = coach_id);

-- Coach cannot read athlete logs — no policy grants this, so it's denied by default
```

### 6.7 Push Notification Architecture

```
Athlete saves game schedule
        │
        ▼
POST /api/games → saves game + reminder_time to DB
        │
        ▼
Supabase Edge Function (cron: every 5 min)
        │
        ▼
Query: SELECT * FROM games
       WHERE reminder_time <= now()
       AND reminder_sent = false
        │
        ▼
For each game: send Web Push to athlete's
subscription endpoint via web-push library
        │
        ▼
Mark game.reminder_sent = true
```

Athlete grants notification permission on first login. Subscription object (endpoint + keys) stored in `push_subscriptions` table, linked to `athlete_id`.

---

## 7. Database Schema

### 7.1 Full Schema

```sql
-- ─────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('athlete', 'coach', 'admin')),
  display_name    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ─────────────────────────────────────────
-- ATHLETE PROFILES
-- ─────────────────────────────────────────
CREATE TABLE athlete_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sport               TEXT,
  competitive_level   TEXT CHECK (competitive_level IN ('recreational', 'college', 'semi_pro')),
  anxiety_symptoms    TEXT[],           -- e.g. ['overthinking', 'physical_tension']
  time_preference     TEXT CHECK (time_preference IN ('2min', '5min', '10min')),
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(athlete_id)
);

-- ─────────────────────────────────────────
-- TECHNIQUES (seeded, not user-generated)
-- ─────────────────────────────────────────
CREATE TABLE techniques (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT UNIQUE NOT NULL,  -- e.g. 'box_breathing'
  name                TEXT NOT NULL,
  category            TEXT NOT NULL CHECK (category IN (
                        'breathing', 'visualization',
                        'affirmations', 'focus', 'grounding')),
  instruction         TEXT NOT NULL,
  duration_minutes    INTEGER NOT NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- ROUTINES
-- ─────────────────────────────────────────
CREATE TABLE routines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  source          TEXT DEFAULT 'custom'
                    CHECK (source IN ('custom', 'recommended', 'coach_template')),
  coach_template_id UUID REFERENCES coach_templates(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- ROUTINE STEPS (ordered technique list)
-- ─────────────────────────────────────────
CREATE TABLE routine_steps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id      UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  technique_id    UUID NOT NULL REFERENCES techniques(id),
  step_order      INTEGER NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- GAMES (scheduled game events)
-- ─────────────────────────────────────────
CREATE TABLE games (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sport               TEXT NOT NULL,
  scheduled_at        TIMESTAMPTZ NOT NULL,
  reminder_offset_min INTEGER DEFAULT 45,  -- minutes before game
  reminder_time       TIMESTAMPTZ GENERATED ALWAYS AS
                        (scheduled_at - (reminder_offset_min * INTERVAL '1 minute')) STORED,
  reminder_sent       BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- GAME LOGS (pre + post combined per game day)
-- ─────────────────────────────────────────
CREATE TABLE game_logs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id               UUID REFERENCES games(id) ON DELETE SET NULL,
  log_date              DATE NOT NULL,
  sport                 TEXT NOT NULL,

  -- Pre-game fields
  routine_completed     TEXT CHECK (routine_completed IN ('yes', 'partial', 'no')),
  pre_anxiety_level     INTEGER CHECK (pre_anxiety_level BETWEEN 1 AND 5),
  pre_confidence_level  INTEGER CHECK (pre_confidence_level BETWEEN 1 AND 5),
  pre_notes             TEXT CHECK (char_length(pre_notes) <= 200),
  pre_logged_at         TIMESTAMPTZ,

  -- Post-game fields
  post_performance      INTEGER CHECK (post_performance BETWEEN 1 AND 5),
  post_mental_state     INTEGER CHECK (post_mental_state BETWEEN 1 AND 5),
  post_descriptor       TEXT,
  post_logged_at        TIMESTAMPTZ,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(athlete_id, log_date)  -- one log per athlete per day
);

-- ─────────────────────────────────────────
-- COACH TEMPLATES
-- ─────────────────────────────────────────
CREATE TABLE coach_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  time_tier       TEXT CHECK (time_tier IN ('quick', 'standard', 'extended')),
  coach_note      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE coach_template_steps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id     UUID NOT NULL REFERENCES coach_templates(id) ON DELETE CASCADE,
  technique_id    UUID NOT NULL REFERENCES techniques(id),
  step_order      INTEGER NOT NULL
);

-- ─────────────────────────────────────────
-- COACH ROSTER
-- ─────────────────────────────────────────
CREATE TABLE coach_roster (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  athlete_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coach_id, athlete_id)
);

-- ─────────────────────────────────────────
-- TEMPLATE NOTIFICATIONS (inbox for athletes)
-- ─────────────────────────────────────────
CREATE TABLE template_notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id     UUID NOT NULL REFERENCES coach_templates(id) ON DELETE CASCADE,
  status          TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending', 'saved', 'dismissed')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- PUSH SUBSCRIPTIONS
-- ─────────────────────────────────────────
CREATE TABLE push_subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint        TEXT NOT NULL,
  p256dh_key      TEXT NOT NULL,
  auth_key        TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(athlete_id, endpoint)
);
```

### 7.2 Entity Relationship Summary

```
profiles (1) ──────────── (1) athlete_profiles
profiles (1) ──────────── (N) routines
profiles (1) ──────────── (N) game_logs
profiles (1) ──────────── (N) games
profiles (1) ──────────── (N) coach_templates     [coach role]
profiles (N) ──────────── (N) coach_roster        [coach ↔ athlete]
routines (1) ──────────── (N) routine_steps
routine_steps (N) ──────── (1) techniques
coach_templates (1) ────── (N) coach_template_steps
coach_template_steps (N) ── (1) techniques
games (1) ─────────────── (1) game_logs           [optional link]
coach_templates (1) ────── (N) template_notifications
profiles (1) ──────────── (N) push_subscriptions
```

---

## 8. API Design

All API routes live under `/app/api/`. All routes require a valid Supabase session. Role checks performed server-side using the session's profile role.

### Athlete Routes

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/routines` | List athlete's routines | Athlete |
| POST | `/api/routines` | Create new routine with steps | Athlete |
| GET | `/api/routines/[id]` | Get single routine with steps | Athlete (owner) |
| PUT | `/api/routines/[id]` | Update routine name or steps | Athlete (owner) |
| DELETE | `/api/routines/[id]` | Delete routine | Athlete (owner) |
| GET | `/api/techniques` | List all techniques (seeded) | Any authenticated |
| POST | `/api/onboarding` | Save onboarding profile + get recommendation | Athlete |
| POST | `/api/logs/pre` | Save pre-game log entry | Athlete |
| POST | `/api/logs/post` | Save post-game reflection | Athlete |
| GET | `/api/logs` | List all game logs (with filters) | Athlete |
| GET | `/api/dashboard` | Get correlation stats | Athlete |
| POST | `/api/games` | Schedule a game + set reminder | Athlete |
| GET | `/api/notifications` | List pending template notifications | Athlete |
| POST | `/api/notifications/[id]/save` | Save coach template as personal routine | Athlete |
| POST | `/api/notifications/[id]/dismiss` | Dismiss template notification | Athlete |
| POST | `/api/notifications/subscribe` | Register Web Push subscription | Athlete |

### Coach Routes

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/coach/templates` | List coach's templates | Coach |
| POST | `/api/coach/templates` | Create new template | Coach |
| GET | `/api/coach/templates/[id]` | Get template with steps | Coach (owner) |
| DELETE | `/api/coach/templates/[id]` | Delete template | Coach (owner) |
| POST | `/api/coach/templates/[id]/share` | Share template with roster | Coach (owner) |
| GET | `/api/coach/roster` | List roster with activation status | Coach |
| POST | `/api/coach/roster/invite` | Invite athlete to roster | Coach |

### Response Format

All routes return consistent JSON:

```typescript
// Success
{ data: T, error: null }

// Error
{ data: null, error: { message: string, code: string } }
```

---

## 9. Sprint Plan

### Sprint 1 — Core Athlete Loop (Week 1)
**Goal:** An athlete can sign up, complete onboarding, build a personalized routine, execute it with guided steps, and log their pre-game mental state. All data is private by default.

#### Screens Added in Sprint 1

| Screen | Route | Description |
|---|---|---|
| Login | `/login` | Email/password + Google OAuth |
| Signup | `/signup` | Email/password + role selection |
| Onboarding Step 1 | `/onboarding?step=1` | Sport selection |
| Onboarding Step 2 | `/onboarding?step=2` | Competitive level |
| Onboarding Step 3 | `/onboarding?step=3` | Anxiety symptoms (multi-select) |
| Onboarding Step 4 | `/onboarding?step=4` | Time preference |
| Onboarding Result | `/onboarding/result` | Recommended starter routine |
| Athlete Home | `/home` | Dashboard entry point, quick-start routine |
| Routine Builder | `/routine/builder` | Add/reorder/remove technique steps |
| Guided Execution | `/routine/execute/[id]` | Step-by-step walkthrough |
| Routine Complete | `/routine/complete` | Completion confirmation screen |
| Pre-Game Log | `/log/pre` | Routine completed, anxiety, confidence, notes |
| Settings | `/settings` | Account info, delete account |

#### Data Flows in Sprint 1

```
Signup → profiles row created (trigger)
       → athlete_profiles row created (onboarding)
       → routines row + routine_steps rows (builder save)

Routine Execute → no DB write (session state only)

Routine Complete → redirect to /log/pre

Pre-Game Log → game_logs row created (pre fields only)
             → post fields NULL until Sprint 2
```

#### API Routes in Sprint 1

- `POST /api/onboarding` — saves athlete profile + returns recommended techniques
- `GET /api/techniques` — returns full technique library
- `POST /api/routines` — creates routine + steps
- `GET /api/routines` — lists athlete's routines
- `GET /api/routines/[id]` — returns routine with steps for execution
- `PUT /api/routines/[id]` — updates routine (edit flow)
- `DELETE /api/routines/[id]` — deletes routine
- `POST /api/logs/pre` — saves pre-game log

#### Supabase Setup in Sprint 1

- All migrations run: full schema deployed
- RLS policies enabled on all tables
- Techniques seed data inserted (`supabase/seed.sql`)
- Google OAuth configured in Supabase dashboard
- Schema types generated: `npx supabase gen types typescript`

#### What the User Can Do After Sprint 1

- Create an account as an athlete or coach (coach UI is role-gated, shows placeholder)
- Complete onboarding and receive a personalized routine suggestion
- Build their own routine from the technique library with drag-and-drop ordering
- Execute the routine with full step-by-step guidance
- Log their pre-game mental state (anxiety + confidence + notes)
- Trust that their data is completely private (RLS enforced)
- Delete their account and all associated data from settings

#### Sprint 1 At-Risk Items

If velocity drops, cut in this order:
1. Google OAuth (keep email/password only — add OAuth in Sprint 2)
2. Drag-and-drop reordering (replace with up/down arrow buttons)
3. Multiple routines (cap at 1 routine per athlete for MVP)

---

### Sprint 2 — Feedback Loop + Coach Portal (Week 2)
**Goal:** Athletes can log post-game reflections, view the correlation dashboard, browse history, and receive pre-game reminders. Coaches can create and share routine templates. Athletes can receive, customize, and save coach templates.

#### Screens Added in Sprint 2

| Screen | Route | Description |
|---|---|---|
| Post-Game Reflection | `/log/post` | Performance, mental state, descriptor |
| Correlation Dashboard | `/dashboard` | Adherence vs. performance chart, streak |
| History | `/history` | Filterable list of all game entries |
| History Detail | `/history/[id]` | Expanded pre + post log for one game |
| Game Scheduler | `/games/new` | Add game date/time + reminder preference |
| Notification Settings | `/settings/notifications` | Toggle reminders, manage push subscription |
| Template Inbox | `/notifications` | Pending coach templates (athlete view) |
| Template Customize | `/routine/builder?from=template&id=[id]` | Builder pre-loaded with coach template |
| Coach Home | `/coach/home` | Coach dashboard — roster overview |
| Coach Templates | `/coach/templates` | List of created templates |
| Coach Template Builder | `/coach/templates/new` | Create template with technique library |
| Coach Roster | `/coach/roster` | Athlete list with activation status |

#### Data Flows in Sprint 2

```
Post-Game Log → game_logs row updated (post fields added)
              → linked to pre-game entry by athlete_id + log_date

Game Schedule → games row created
              → reminder_time computed (generated column)

Push Subscription → push_subscriptions row created

Reminder Cron (Edge Function, every 5 min)
  → SELECT games WHERE reminder_time <= now() AND reminder_sent = false
  → Send Web Push to athlete
  → UPDATE games SET reminder_sent = true

Dashboard Query
  → SELECT log_date, routine_completed, post_performance
     FROM game_logs WHERE athlete_id = $1
  → Computed in API route: avg performance grouped by routine_completed

Coach Template Create → coach_templates + coach_template_steps rows

Coach Template Share
  → SELECT athlete_id FROM coach_roster WHERE coach_id = $1
  → INSERT template_notifications for each athlete

Athlete Saves Template
  → INSERT routines (source='coach_template', coach_template_id)
  → INSERT routine_steps (copied from coach_template_steps)
  → UPDATE template_notifications SET status='saved'

Athlete Dismisses Template
  → UPDATE template_notifications SET status='dismissed'
```

#### API Routes in Sprint 2

- `POST /api/logs/post` — saves post-game reflection
- `GET /api/logs` — list all logs with filters (date range, sport, completion)
- `GET /api/logs/[id]` — single log detail
- `GET /api/dashboard` — returns correlation stats for athlete
- `POST /api/games` — schedule game + set reminder offset
- `POST /api/notifications/subscribe` — register Web Push subscription
- `GET /api/notifications` — list pending template notifications for athlete
- `POST /api/notifications/[id]/save` — convert template to personal routine
- `POST /api/notifications/[id]/dismiss` — dismiss notification
- `GET /api/coach/templates` — list coach templates
- `POST /api/coach/templates` — create template + steps
- `GET /api/coach/templates/[id]` — get template detail
- `DELETE /api/coach/templates/[id]` — delete template
- `POST /api/coach/templates/[id]/share` — share with roster
- `GET /api/coach/roster` — list roster + activation status
- `POST /api/coach/roster/invite` — add athlete to roster by email

#### Dashboard Correlation Query

```sql
-- Called from GET /api/dashboard
SELECT
  routine_completed,
  ROUND(AVG(post_performance), 1)  AS avg_performance,
  ROUND(AVG(post_mental_state), 1) AS avg_mental_state,
  COUNT(*)                          AS game_count
FROM game_logs
WHERE athlete_id = $1
  AND post_performance IS NOT NULL
GROUP BY routine_completed;

-- Streak query
SELECT COUNT(*) AS streak
FROM (
  SELECT log_date,
         ROW_NUMBER() OVER (ORDER BY log_date DESC) AS rn,
         log_date - (ROW_NUMBER() OVER (ORDER BY log_date DESC) * INTERVAL '1 day')
           AS grp
  FROM game_logs
  WHERE athlete_id = $1
    AND routine_completed = 'yes'
  ORDER BY log_date DESC
) sub
GROUP BY grp
ORDER BY MIN(log_date) DESC
LIMIT 1;
```

#### What the User Can Do After Sprint 2

**Athlete:**
- Log post-game performance and mental state
- View the correlation dashboard (after 5+ entries) showing whether the routine is working
- Browse full history of game entries with filters
- Schedule upcoming games and receive push notification reminders 45 min before
- Receive a coach-shared template, customize it, and save it as their own
- Dismiss unwanted coach templates

**Coach:**
- Log in to a role-specific dashboard
- Create routine templates from the technique library
- Share templates with all athletes on their roster in one action
- View which athletes have an active routine (yes/no) — nothing more

#### Sprint 2 At-Risk Items

If velocity drops, cut in this order:
1. Push notifications (replace with in-app reminder banner — no cron needed)
2. Coach portal (defer to post-sprint; schema is already in place)
3. Dashboard streak counter (keep avg performance chart, drop streak)
4. History filters (ship unfiltered list first, add filters as follow-up)

---

## 10. Sprint Milestones

**Work split:**
- **Raj** — Auth, Onboarding, Routine Builder, Guided Execution (Sprint 1) → Dashboard, History, Post-Game Reflection (Sprint 2)
- **Vineela** — Pre-Game Log, Settings, RLS/Privacy, Supabase config, Vercel deployment (Sprint 1) → Push Notifications, Game Scheduler, Coach Portal (Sprint 2)

**Definition of Done (per milestone):**
A milestone is done when: the feature works end-to-end in a deployed Vercel preview URL, all acceptance criteria from the relevant user story pass, and no console errors or broken states exist on the happy path.

---

### Sprint 1 Milestones — Due March 4

> 7 days. Today is Feb 25. No slack days built in — if a milestone slips, cut from the at-risk list in the Sprint Plan before letting it cascade.

---

#### M1.0 — Project Scaffolding & Supabase Setup
**Due: Feb 25 (Day 1 — today)**
**Owner: Vineela (infra) + Raj (Next.js init) — parallel**

| Task | Owner | Done When |
|---|---|---|
| Init Next.js 14 app with App Router, Tailwind, shadcn/ui | Raj | `npm run dev` runs cleanly, shadcn Button renders |
| Create Supabase project, copy URL + anon key to `.env.local` | Vineela | Supabase dashboard accessible, env vars in repo |
| Run full schema migration (all tables from Section 7) | Vineela | All tables visible in Supabase Table Editor |
| Enable RLS on all tables, apply all RLS policies | Vineela | RLS toggle ON for all tables in Supabase dashboard |
| Seed `techniques` table with 6 techniques | Vineela | `SELECT * FROM techniques` returns 6 rows |
| Configure Google OAuth in Supabase Auth settings | Vineela | Google provider enabled in Supabase Auth dashboard |
| Deploy skeleton app to Vercel, connect to Supabase env vars | Vineela | Preview URL loads without errors |
| Install `@supabase/ssr`, create `lib/supabase/client.ts` and `server.ts` | Raj | Supabase client importable in a test component |
| Generate Supabase TypeScript types | Raj | `types/database.ts` generated and committed |

**Milestone 1.0 exit check:** Both devs can pull the repo, run `npm run dev`, and see the app skeleton. Supabase is live with schema + seed data. Vercel preview URL is live.

---

#### M1.1 — Authentication & Role Selection
**Due: Feb 26 (Day 2)**
**Owner: Raj**

| Task | Owner | Done When |
|---|---|---|
| Build `/login` page — email/password form + Google OAuth button | Raj | User can log in with email/password; Google OAuth redirects correctly |
| Build `/signup` page — email/password + role selector (Athlete/Coach) | Raj | New user created in Supabase Auth; role saved to `profiles` table |
| Implement `middleware.ts` — protect all routes, redirect unauthenticated users to `/login` | Raj | Visiting `/home` without a session redirects to `/login` |
| Implement `handle_new_user` Postgres trigger (auto-create `profiles` row) | Raj | Signing up creates a row in `profiles` automatically |
| Role-based redirect after login — athlete → `/onboarding`, coach → `/coach/home` (placeholder) | Raj | Athlete lands on onboarding; coach lands on stub page |
| Logout button in nav clears session and redirects to `/login` | Raj | Logout works; revisiting `/home` redirects to `/login` |

**Milestone 1.1 exit check:** Full auth round-trip works. Signup → role selection → correct redirect. Login → correct redirect. Logout → back to `/login`. Protected routes inaccessible without session.

---

#### M1.2 — Onboarding Flow + Rule-Based Recommender
**Due: Feb 27 (Day 3)**
**Owner: Raj**

| Task | Owner | Done When |
|---|---|---|
| Build Onboarding Step 1 `/onboarding?step=1` — sport selector (chip UI) | Raj | Sport selection persists to next step; skip option works |
| Build Onboarding Step 2 `/onboarding?step=2` — competitive level | Raj | Level selected, back navigation works |
| Build Onboarding Step 3 `/onboarding?step=3` — anxiety symptoms (multi-select chips) | Raj | Multiple symptoms selectable; continue disabled until ≥1 selected |
| Build Onboarding Step 4 `/onboarding?step=4` — time preference | Raj | Time preference selected, continue enabled |
| Implement `lib/recommender.ts` — pure TypeScript rule-based logic | Raj | Unit test: overthinking + 5min → returns box_breathing + focus_word + affirmations |
| Build Onboarding Result `/onboarding/result` — shows recommended routine with technique names, times, and match reasons | Raj | Recommended routine displayed; "Save & Continue" and "Build my own" both navigate to `/home` |
| `POST /api/onboarding` — saves `athlete_profiles` row, returns recommended technique IDs | Raj | Row saved in DB; response includes technique array |
| Progress bar (4 steps) renders correctly across all onboarding screens | Raj | Step indicator advances correctly at each step |

**Milestone 1.2 exit check:** New athlete can complete full onboarding in under 2 minutes. Recommended routine is surfaced on the result screen. Athlete profile saved to DB. Skip path goes directly to `/home`.

---

#### M1.3 — Supabase RLS Verification + Settings Page
**Due: Feb 27 (Day 3)**
**Owner: Vineela — parallel with Raj's M1.2**

| Task | Owner | Done When |
|---|---|---|
| Write RLS test script — attempt to SELECT another athlete's `game_logs` using their JWT; assert 0 rows returned | Vineela | Test passes: cross-athlete data access returns empty, not an error |
| Verify coach cannot SELECT athlete `game_logs` rows directly | Vineela | Coach JWT query on `game_logs` returns 0 rows |
| Build `/settings` page — display name, email (read-only), role badge | Vineela | Settings page renders with correct user data |
| Add "Delete Account" flow — confirmation dialog → cascade delete → redirect to `/login` | Vineela | Account deleted; all athlete rows removed; session cleared |
| Add "Delete Entry" flow stub (UI only, wired in Sprint 2 when logs exist) | Vineela | UI present, non-functional, no errors |

**Milestone 1.3 exit check:** RLS is verified to work — not just enabled. Settings page accessible. Delete account works end-to-end.

---

#### M1.4 — Routine Builder
**Due: Feb 28 (Day 4)**
**Owner: Raj**

| Task | Owner | Done When |
|---|---|---|
| Build `/routine/builder` — technique library list with Add button per technique | Raj | All 6 techniques visible; Add button adds to step list |
| Implement step reordering — drag-and-drop (use `@dnd-kit/core`) or up/down arrows if time-pressured | Raj | Steps reorder correctly; order persists on save |
| Running time estimate updates as steps are added/removed | Raj | Total time label updates in real time |
| Technique already-added state — "Added" label replaces Add button | Raj | Cannot add the same technique twice |
| Routine name input — required field, validated before save | Raj | Save disabled until name entered and ≥1 step added |
| `POST /api/routines` — saves `routines` + `routine_steps` rows | Raj | Routine appears in DB after save |
| `GET /api/routines` — lists athlete's routines on home screen | Raj | Saved routine visible on `/home` after save |
| `PUT /api/routines/[id]` — updates routine steps and name | Raj | Edit flow updates existing routine correctly |
| `DELETE /api/routines/[id]` — deletes routine and steps | Raj | Routine removed from DB and home screen |
| Cap at 5 routines — disable "New Routine" button when limit reached | Raj | 6th routine cannot be created; tooltip explains limit |

**Milestone 1.4 exit check:** Athlete can create, name, reorder, and save a routine with at least 1 step. Routine persists after page refresh. Edit and delete work. 5-routine cap enforced.

---

#### M1.5 — Guided Routine Execution
**Due: Mar 1 (Day 5)**
**Owner: Raj**

| Task | Owner | Done When |
|---|---|---|
| Build `/routine/execute/[id]` — full-screen step-by-step view | Raj | Each technique shows name, instruction, category, duration |
| Progress indicator — "Step X of Y" + time remaining | Raj | Updates correctly on each Next tap |
| "Next →" advances to next step; "Finish" on last step navigates to `/routine/complete` | Raj | Navigation works; no step skipped |
| Pause button — component state only, no DB write | Raj | Pause freezes UI; Resume continues from same step |
| `GET /api/routines/[id]` — fetches routine with technique steps for execution | Raj | Correct technique data rendered per routine |
| Build `/routine/complete` — completion confirmation screen | Raj | Checkmark screen renders; "Log Pre-Game Entry" and "Skip for now" buttons work |
| "Log Pre-Game Entry" navigates to `/log/pre` | Raj | Navigation works |
| "Skip for now" navigates to `/home` | Raj | Navigation works |

**Milestone 1.5 exit check:** Athlete can start a saved routine, step through all techniques with full instructions, pause and resume, and reach the completion screen. Completion triggers the pre-game log prompt.

---

#### M1.6 — Pre-Game Entry Log + Athlete Home Screen
**Due: Mar 2 (Day 6)**
**Owner: Vineela**

| Task | Owner | Done When |
|---|---|---|
| Build `/log/pre` — routine completion selector (yes/partial/no), anxiety 1–5, confidence 1–5, optional notes textarea | Vineela | All fields render; Save disabled until required fields filled |
| `POST /api/logs/pre` — saves `game_logs` row (pre fields only) with UTC timestamp | Vineela | Row created in DB; post fields are NULL |
| Validation: notes capped at 200 characters with counter | Vineela | Counter shows remaining chars; submit blocked above 200 |
| Build athlete `/home` screen — active routine card with "Start Routine" CTA, nav tiles (Builder, Pre-Log, Dashboard, History) | Vineela | Home screen renders; all nav tiles route correctly |
| "Pre-Game Entry" tile on home screen navigates to `/log/pre` directly (manual trigger) | Vineela | Manual log entry works without completing a routine first |
| Privacy footer on home screen: "🔒 All your data is private — only visible to you" | Vineela | Footer visible on home screen |
| Loading and empty states for home screen (no routine saved yet) | Vineela | New athlete without a routine sees prompt to build one |

**Milestone 1.6 exit check:** Athlete can log a pre-game entry both via the routine completion flow and manually from the home screen. Entry saved in DB. Home screen is navigable and shows correct state for new vs. returning athletes.

---

#### M1.7 — Sprint 1 Integration, QA & Deployment
**Due: Mar 4 (Day 8 — Sprint 1 due date)**
**Owner: Raj + Vineela — joint**

| Task | Owner | Done When |
|---|---|---|
| Full happy-path walkthrough: Signup → Onboarding → Build Routine → Execute → Complete → Log Pre-Game | Both | Zero errors, zero broken navigation states |
| Cross-athlete data isolation test: log in as two different athletes, confirm neither can see the other's data | Vineela | Confirmed in browser dev tools — no cross-user data in API responses |
| Coach role test: sign up as coach, confirm athlete screens are inaccessible, coach home placeholder visible | Raj | Role gate works; coach cannot access `/home` or `/routine/builder` |
| Fix all broken states found during walkthrough | Both | No console errors on happy path |
| Confirm all 6 techniques render correctly in builder and execution | Raj | Technique data complete and accurate |
| Production environment variables set on Vercel | Vineela | Production deploy works; no env var errors |
| Final production deploy to Vercel | Vineela | Production URL live and functional |
| Smoke test on production URL — not just preview | Both | Signup, onboarding, build routine, execute, log all work on production |

**Sprint 1 exit check (all must pass):**
- [ ] Athlete can complete the full loop: signup → onboarding → build routine → execute → log pre-game
- [ ] RLS verified: athlete A cannot read athlete B's data
- [ ] Coach role gate works: coach cannot access athlete screens
- [ ] Delete account works end-to-end
- [ ] Production URL is live on Vercel with no errors

---

### Sprint 2 Milestones — Due March 10

> 6 days (Mar 5–10). Sprint 2 assumes Sprint 1 production URL is live and tested. If Sprint 1 slips to Mar 5, compress Sprint 2 accordingly using the at-risk cut list.

---

#### M2.0 — Post-Game Reflection Entry
**Due: Mar 5 (Day 1)**
**Owner: Raj**

| Task | Owner | Done When |
|---|---|---|
| Build `/log/post` — self-rated performance 1–5, mental state 1–5, optional one-word descriptor | Raj | All fields render; Save disabled until required fields filled |
| `POST /api/logs/post` — updates existing `game_logs` row (post fields) matched by `athlete_id + log_date` | Raj | Post fields populated on existing row; no duplicate row created |
| Handle edge case: athlete logs post-game without a pre-game entry for that day — create a new `game_logs` row | Raj | Both scenarios save correctly |
| Dismiss button — no entry created, no repeated prompt for same date | Raj | Dismiss works; navigates to `/home` |
| "Add Post-Game Reflection" button on home screen navigates to `/log/post` | Raj | Manual trigger from home works |
| `GET /api/logs/[id]` — returns single log with both pre and post fields | Raj | API returns complete log object |

**Milestone 2.0 exit check:** Athlete can log a post-game reflection that links to the same day's pre-game entry. Both pre and post fields visible on a single `game_logs` row in DB.

---

#### M2.1 — Routine History & Entry Review
**Due: Mar 6 (Day 2)**
**Owner: Raj**

| Task | Owner | Done When |
|---|---|---|
| Build `/history` — reverse chronological list of game entries | Raj | All logged entries visible; date, sport, completion badge, anxiety, performance scores shown |
| Completion badge styling — green (yes), yellow (partial), red (no) | Raj | Badges render with correct colours |
| Build `/history/[id]` — expanded detail view showing full pre + post log + notes | Raj | Tapping an entry shows full detail |
| Filter UI — by completion status, date range, sport | Raj | Filters update list correctly; clear filter restores full list |
| `GET /api/logs` — returns all logs for athlete with optional query params (`?completed=yes&sport=Soccer`) | Raj | Filtered API responses return correct subsets |
| Empty state — athlete with no entries sees "No games logged yet" with CTA to start routine | Raj | Empty state renders correctly |
| Data persists across logout/login — verify with a test account | Raj | History intact after session ends and restarts |

**Milestone 2.1 exit check:** History page renders all entries with filters working. Detail view shows full pre + post log. Data is persistent.

---

#### M2.2 — Correlation Dashboard
**Due: Mar 6 (Day 2) — parallel with M2.1**
**Owner: Raj**

| Task | Owner | Done When |
|---|---|---|
| Build `/dashboard` — below-threshold state (< 5 entries): placeholder with entry count needed | Raj | Placeholder renders correctly; entry count accurate |
| Above-threshold state: bar chart (Recharts `BarChart`) comparing avg performance — routine done vs. not done | Raj | Chart renders with correct data; no empty chart on threshold exactly met |
| Streak counter — consecutive game days with `routine_completed = 'yes'` | Raj | Streak count accurate across test data |
| `GET /api/dashboard` — runs correlation query and streak query from Section 9 | Raj | API returns `{ withRoutine, withoutRoutine, streak, gameCount }` |
| Disclaimer text: "Results are self-reported and not scientifically validated" | Raj | Disclaimer visible below chart |
| "Add Post-Game Reflection" button on dashboard navigates to `/log/post` | Raj | Navigation works |
| Dashboard tile on home screen navigates to `/dashboard` | Raj | Home nav tile works |

**Milestone 2.2 exit check:** Dashboard renders correctly in both below and above threshold states. Chart data matches DB values. Streak accurate.

---

#### M2.3 — Game Scheduler + Push Notification Reminders
**Due: Mar 7 (Day 3)**
**Owner: Vineela**

| Task | Owner | Done When |
|---|---|---|
| Build `/games/new` — sport name, date picker, start time, reminder offset (30/45/60 min) | Vineela | Form submits; game saved to DB |
| `POST /api/games` — saves `games` row; `reminder_time` generated column computed automatically | Vineela | `reminder_time` correct in DB (e.g. game at 14:00, offset 45 → reminder at 13:15) |
| Build `/settings/notifications` — toggle push notifications on/off | Vineela | Toggle saves preference; disabling removes subscription from DB |
| `POST /api/notifications/subscribe` — saves Web Push subscription to `push_subscriptions` table | Vineela | Subscription object saved; endpoint + keys present |
| Request browser notification permission on first game schedule | Vineela | Permission dialog appears; granted/denied handled gracefully |
| Supabase Edge Function `send-reminders` — cron every 5 min, queries `games` for due reminders, sends Web Push, marks `reminder_sent = true` | Vineela | Edge Function deployed; test game reminder fires within 5 min of `reminder_time` |
| iOS Safari fallback: if Push API unsupported, show in-app banner at `reminder_time` via polling | Vineela | In-app banner appears on iOS Safari at correct time |
| `GET /api/games` — lists upcoming games for athlete | Vineela | Upcoming games listed on home screen |

**Milestone 2.3 exit check:** Athlete can schedule a game, receive a push notification at the correct time (or in-app banner on iOS), and tap it to open the routine directly.

---

#### M2.4 — Coach Portal
**Due: Mar 8 (Day 4)**
**Owner: Vineela**

| Task | Owner | Done When |
|---|---|---|
| Build `/coach/home` — coach dashboard landing page with roster summary and template count | Vineela | Coach home renders after login with coach role |
| Build `/coach/templates` — list of created templates with name, time tier, step count | Vineela | Template list renders; empty state shows "No templates yet" |
| Build `/coach/templates/new` — technique library + step builder + time tier selector + team note field | Vineela | Coach can add/remove/reorder techniques; Save creates template in DB |
| `POST /api/coach/templates` — saves `coach_templates` + `coach_template_steps` | Vineela | Template and steps saved in DB |
| Build `/coach/roster` — athlete list showing display name + "Routine active: Yes/No" | Vineela | Roster visible; no anxiety/performance data exposed |
| `GET /api/coach/roster` — returns roster with `has_active_routine` boolean per athlete | Vineela | API response contains only allowed fields; confirmed by inspecting response |
| `POST /api/coach/templates/[id]/share` — inserts `template_notifications` row per roster athlete | Vineela | All roster athletes receive notification in DB |
| `POST /api/coach/roster/invite` — coach enters athlete email; athlete added to `coach_roster` | Vineela | Roster updates after invite |
| Coach cannot access `/home`, `/routine/builder`, or any athlete screen — role gate confirmed | Vineela | Role guard redirects coach away from athlete routes |

**Milestone 2.4 exit check:** Coach can log in, create a template, share it with roster athletes, and view roster activation status. Coach cannot see athlete logs at any point.

---

#### M2.5 — Athlete Template Inbox & Customization Flow
**Due: Mar 9 (Day 5)**
**Owner: Raj**

| Task | Owner | Done When |
|---|---|---|
| Build `/notifications` — template inbox showing pending coach templates with name, coach note, step preview | Raj | Pending templates visible; empty state if none |
| "Customize & Save" — pre-loads routine builder with template steps | Raj | Builder opens with coach steps pre-populated; athlete can add/remove/reorder |
| Saving customized template creates new `routines` row (`source = 'coach_template'`) + copies steps | Raj | Personal copy saved; original coach template unchanged in DB |
| `POST /api/notifications/[id]/save` — creates personal routine, marks notification `status = 'saved'` | Raj | Notification no longer shows as pending |
| "Dismiss" — marks notification `status = 'dismissed'`; template disappears from inbox | Raj | Dismissed template does not reappear |
| `GET /api/notifications` — returns only `pending` notifications | Raj | Dismissed/saved notifications excluded from list |
| Notification badge on home screen nav when pending templates exist | Raj | Badge count visible on home screen nav tile |

**Milestone 2.5 exit check:** Full coach → athlete template flow works end-to-end. Coach shares template → athlete receives it in inbox → athlete customizes it → saves personal copy → coach's original unchanged.

---

#### M2.6 — Sprint 2 Integration, QA & Final Deployment
**Due: Mar 10 (Sprint 2 due date)**
**Owner: Raj + Vineela — joint**

| Task | Owner | Done When |
|---|---|---|
| Full athlete happy-path walkthrough: Login → Home → Schedule Game → Execute Routine → Pre-Log → (next day) Post-Log → Dashboard → History | Both | Zero errors end-to-end |
| Full coach happy-path walkthrough: Login → Create Template → Share with Roster → View Roster | Vineela | Coach flow works; athlete receives notification |
| Full cross-persona walkthrough: Coach shares template → Athlete customizes → Athlete saves → Athlete runs routine | Both | Complete flow works with two real accounts |
| Privacy audit: coach account attempts to access `/history`, `/dashboard`, `/log/pre` — all must redirect | Raj | Role gate confirmed on all athlete routes |
| Privacy audit: athlete account cannot see other athletes' game_logs via direct API call | Vineela | Confirmed via Supabase RLS test — 0 rows returned on cross-user query |
| Test dashboard with exactly 5 entries — confirm threshold switch from placeholder to chart | Raj | Threshold behaviour correct at exactly 5 entries |
| Test push notification end-to-end on Chrome desktop | Vineela | Notification fires within 5 min of reminder_time |
| Test iOS Safari in-app banner fallback | Vineela | Banner appears at correct time on iOS Safari |
| Fix all issues found during QA | Both | No P0 bugs open at deploy time |
| Final production deploy | Vineela | Production URL live; all features accessible |
| Smoke test production URL across Chrome, Firefox, Safari | Both | All screens load; no console errors |

**Sprint 2 exit check (all must pass):**
- [ ] Full athlete loop works end-to-end including post-game log and dashboard
- [ ] Dashboard shows correct correlation data after 5+ entries
- [ ] Push notification fires at correct time (Chrome desktop)
- [ ] iOS Safari in-app banner fallback works
- [ ] Coach can create, share, and view roster
- [ ] Athlete can receive, customize, and save a coach template
- [ ] Coach cannot access any athlete data beyond activation status
- [ ] Production URL live and smoke-tested across browsers

---

### Milestone Summary Table

| Milestone | Description | Owner | Due Date | Sprint |
|---|---|---|---|---|
| M1.0 | Project scaffolding, Supabase setup, schema, seed | Both | Feb 25 | 1 |
| M1.1 | Authentication & role selection | Raj | Feb 26 | 1 |
| M1.2 | Onboarding flow + recommender | Raj | Feb 27 | 1 |
| M1.3 | RLS verification + settings page | Vineela | Feb 27 | 1 |
| M1.4 | Routine builder | Raj | Feb 28 | 1 |
| M1.5 | Guided routine execution | Raj | Mar 1 | 1 |
| M1.6 | Pre-game log + home screen | Vineela | Mar 2 | 1 |
| M1.7 | Sprint 1 integration, QA, deploy | Both | Mar 4 | 1 |
| M2.0 | Post-game reflection entry | Raj | Mar 5 | 2 |
| M2.1 | Routine history & entry review | Raj | Mar 6 | 2 |
| M2.2 | Correlation dashboard | Raj | Mar 6 | 2 |
| M2.3 | Game scheduler + push notifications | Vineela | Mar 7 | 2 |
| M2.4 | Coach portal | Vineela | Mar 8 | 2 |
| M2.5 | Athlete template inbox & customization | Raj | Mar 9 | 2 |
| M2.6 | Sprint 2 integration, QA, final deploy | Both | Mar 10 | 2 |

---

### Cut Priority (if behind schedule)

Apply in this order — do not skip steps or negotiate scope mid-sprint without updating this table.

| Cut Order | What to Cut | Impact | When to Cut |
|---|---|---|---|
| 1 | Drag-and-drop reordering → replace with up/down buttons | Low — UX degraded but functional | If M1.4 runs over by >4 hours |
| 2 | Google OAuth → email/password only | Low — one fewer login method | If M1.1 runs over |
| 3 | History filters → ship unfiltered list | Low — browseable but not filterable | If M2.1 runs over |
| 4 | Dashboard streak counter → keep chart only | Low — one metric removed | If M2.2 runs over |
| 5 | Push notifications → in-app banner only | Medium — no OS-level alerts | If M2.3 runs over by >4 hours |
| 6 | Coach portal (M2.4 + M2.5) → defer entirely | Medium — schema still in place | If Sprint 2 Day 4 arrives and athlete loop not solid |

---

## 11. Non-Functional Requirements

### Performance
- Initial page load (LCP): < 2.5 seconds on a standard broadband connection
- API route response time: < 500ms for all non-dashboard queries
- Dashboard query: < 1 second (indexed on `athlete_id` + `log_date`)

### Database Indexes

```sql
-- Added alongside migrations
CREATE INDEX idx_game_logs_athlete_date ON game_logs(athlete_id, log_date DESC);
CREATE INDEX idx_routines_athlete ON routines(athlete_id);
CREATE INDEX idx_games_reminder ON games(reminder_time) WHERE reminder_sent = false;
CREATE INDEX idx_template_notifications_athlete ON template_notifications(athlete_id, status);
```

### Security
- All API routes validate session server-side — no client-side auth checks trusted alone
- RLS enforced on all tables — application bugs cannot bypass data isolation
- Environment variables: `SUPABASE_SERVICE_ROLE_KEY` never exposed to client
- HTTPS enforced by Vercel on all routes

### Accessibility
- shadcn/ui components are WCAG 2.1 AA compliant (built on Radix UI)
- All interactive elements keyboard-navigable
- Color contrast ratios meet AA standard (gray-900 on gray-50 background from wireframe passes)

### Browser Support
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Web Push API not supported on iOS Safari (known limitation — show in-app banner fallback)

---

## 12. Open Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Push notifications not supported on iOS Safari | High | Medium | Fallback: in-app reminder banner at scheduled time |
| No commitment signals from athletes yet | Medium | High | Ship Sprint 1, find 2 real users to test with before Sprint 2 |
| Drag-and-drop (routine builder) complex to implement in 1 week | Medium | Low | Cut to up/down arrow buttons if time-pressured (see Sprint 1 at-risk) |
| Supabase Edge Function cron latency for reminders | Low | Low | 5-min polling window acceptable; exact-time delivery not required |
| Coach portal scope creep in Sprint 2 | Medium | Medium | Strictly limit coach UI to: template create, share, roster view — nothing else |
| Athletes self-report performance inaccurately | High | Low | Dashboard disclaimer already specced; this is a known product limitation, not a bug |

---

*PRD prepared for MindGame by Raj Laskar and Vineela Goli. All functional requirements are traceable to MindGame_User_Stories.md. All prioritization decisions are traceable to MindGame_MoSCoW.md.*
