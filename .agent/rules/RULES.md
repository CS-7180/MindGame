# MindGame Project Rules & Instructions

## 0. Agent Response Rule 1
Every AI agent reply MUST begin with ⭐


## 1. Project Context

### Tech Stack
- Framework = Next.js 14 (App Router)  
- UI = React 18 + Tailwind CSS v3 + shadcn/ui  
- Charts = Recharts  
- Database & Auth = Supabase (PostgreSQL + Auth + RLS)  
- Notifications = Web Push API (`web-push`)  
- Deployment = Vercel  

### Architecture Overview
- **Routing:** App Router + React Server Components (RSC). API logic lives in `/api/*` routes.
- **Auth Gate:** Next.js middleware protects all routes centrally.
- **Privacy:** Enforced exclusively at DB level via Supabase RLS — never application-layer only.
- **Folder Structure:**
  - `app/` — split into `(auth)`, `(athlete)`, `(coach)`, `api/`
  - `components/` — by domain: `ui`, `onboarding`, `routine`, `dashboard`, `logging`, `shared`
  - `lib/` — Supabase clients (`client.ts`, `server.ts`, `middleware.ts`), recommender, push utils
  - `supabase/` — migrations + seed scripts
  - `types/` — auto-generated Supabase types

### Naming Conventions
- **Files:** `kebab-case` (e.g. `push-notifications.ts`); Next.js reserved names unchanged (`page.tsx`, `route.ts`)
- **Components:** `PascalCase`; shadcn UI primitives in `components/ui` use `kebab-case`
- **Variables/Functions:** `camelCase`; names must describe the action (e.g. `generateRoutine`)
- **Types/Interfaces:** `PascalCase`, no `I` prefix (e.g. `AthleteProfile`)
- **TypeScript:** Strict mode. Explicit types everywhere. Use Supabase generated types.

### Testing Strategy
- **Approach:** TDD — write failing tests first.
- **Playwright:** E2E flows (onboarding, execution). Use `data-testid`, run in `--ui` mode during dev.
- **Vitest:** Unit/integration tests for pure functions and API logic.
- **Coverage:** Minimum 70% for all new features.


## 2. PRD & Design References
- **Source of Truth:** 
  - PRD lives at: `Project Memory/MindGame_PRD.md`
  - Before implementing any feature, read the relevant section of the PRD first
  - Cross-check acceptance criteria in `MindGame_User_Stories.md` before writing code
- **Scope:** Follow MoSCoW priorities and sprint breakdowns strictly.
- **Won't Have:** Mid-Game Recovery, Social Features, Leaderboards — do not build.

## 3. Scrum & Workflow Instructions

### Branch Naming
`[type]/[issue-number]-[brief-description]`
Types: `feature`, `bugfix`, `hotfix`, `chore`, `docs`
Example: `feature/42-routine-builder-drag-drop`

### Commit Format
`[type]([scope]): [description]` — follow Conventional Commits.
Example: `feat(routine): implement drag-and-drop for routine steps`
For complex commits add a blank line + detailed explanation body.

### GitHub Issue References
- Resolves: `Closes #[n]` or `Fixes #[n]` in commit body
- Related: `Relates to #[n]`
- In code: `// TODO(#42): Refactor when endpoint is available`

### PR Workflow
- Every PR must link to its GitHub Issue.
- Requires 1 approved code review.
- All CI checks must pass green before merge.
- Merge strategy: **Squash and Merge**.

### Agile & Sprints
- Every issue must be associated with a Sprint Milestone (Sprint 1 / Sprint 2).
- Each sprint must end with a functional, testable MVP meeting sprint success criteria.
- **Issue granularity:** 1 issue = 1 task row in the PRD milestone table = 1 PR = 1 squash commit on `main`.


## 4. Do's and Don'ts

### Do
- Use Supabase RLS as the sole privacy enforcement layer — treat API checks as fallible.
- Use RSC to minimise client bundle size and keep sensitive logic server-side.
- Encapsulate the recommender in a pure, testable utility (`lib/recommender.ts`).
- Use `shadcn/ui` for all UI components.

### Don't
- No ML or over-engineered logic for the recommender — rule-based only.
- No cross-role data leaks — coaches must never access athlete anxiety or performance data.
- No excessive client-side data fetching — fetch in Server Components, pass minimal props down.

### Preferred Libraries
- `date-fns` over `moment.js`
- `lucide-react` for icons
- `react-hook-form` + `zod` for forms and validation
- Avoid Redux/Zustand — prefer URL state, React Context, and Server Component fetching.

### Security & Accessibility
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. Only `NEXT_PUBLIC_*` vars are browser-safe.
- Validate all inputs server-side with Zod before any DB interaction.
- All UI must be keyboard-navigable with labelled form controls.
- Preserve Radix UI ARIA attributes and focus management from shadcn primitives.


## 5. CI/CD Pipeline

### GitHub Actions — Required
`.github/workflows/ci.yml` MUST be created in M1.0 before any other milestone begins.

### Required CI Jobs (all must pass green to merge)
1. **Lint** — `next lint`
2. **Type Check** — `tsc --noEmit`
3. **Unit & Integration** — `vitest run`
4. **E2E** — `playwright test`

### Triggers & Environment
- Trigger on: `push` to any branch + `pull_request` targeting `main`
- E2E runs against a local dev server (Playwright `webServer` config)
- Spin up local Supabase via `supabase start` before tests
- Store `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` as GitHub secrets — never hardcode
- Use a dedicated test-only Supabase project (not production)

### Agent Instruction (M1.0)
1. Create `.github/workflows/ci.yml` with the jobs above
2. Validate YAML syntax before committing
3. Commit as: `chore(ci): add GitHub Actions CI workflow`
4. Confirm workflow runs in GitHub Actions tab before marking M1.0 complete


## 6. Database Migration Workflow
- Every schema change requires a versioned migration file: `supabase migration new [description]`
- Migration files must be committed in the same PR as the dependent code — never separately.
- Apply locally with: `supabase db reset` (runs all migrations + seed)
- Never edit a committed migration file — create a new one for fixes.

## 7. Agent Response Rule 2
Every AI agent reply MUST end with ✅