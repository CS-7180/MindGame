# MindGame Project Rules & Instructions

## 1. Project Context

### Tech Stack and Versions
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS v3
- **Components:** shadcn/ui (Radix UI + Tailwind)
- **Charts:** Recharts
- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **Notifications:** Web Push API (`web-push` npm)
- **Deployment:** Vercel

### Architecture Overview
- **Routing & Rendering:** Next.js App Router with React Server Components (RSC) and API routes (`/api/*`) for backend logic.
- **Middleware:** Next.js middleware acts as a centralized auth gate for protected routes.
- **Database Privacy:** Strictly enforced at the database level via Supabase Row Level Security (RLS) policies. No privacy enforcement should happen exclusively at the application layer.
- **Folder Structure:**
  - `app/`: Next.js App Router (split into `(auth)`, `(athlete)`, `(coach)` and `api/`).
  - `components/`: UI components organized by domain (`ui`, `onboarding`, `routine`, `dashboard`, `logging`, `shared`).
  - `lib/`: Utilities, Supabase clients (`client.ts`, `server.ts`, `middleware.ts`), recommender logic, and push notification functions.
  - `supabase/`: SQL migrations and seed scripts.
  - `types/`: Auto-generated database types.

### Naming Conventions & Coding Standards
- **File Names:** Use `kebab-case` for standard files (e.g., `push-notifications.ts`). Next.js specific files must use their reserved names (`page.tsx`, `layout.tsx`, `route.ts`).
- **Component Names:** Use `PascalCase` for React components. Corresponding files in `components/` should either follow `PascalCase.tsx` for your own components, or stick to shadcn's default `kebab-case` specifically for UI primitives in `components/ui`.
- **Variables & Functions:** Use `camelCase`. Function names should explicitly reflect the action taken (e.g., `generateRoutine`, `calculateAnxietyScore`).
- **Types & Interfaces:** Use `PascalCase` and avoid prefixing with `I` (e.g., `AthleteProfile`, not `IAthleteProfile`).
- **TypeScript:** Strict mode enabled. Utilize explicit typing for all variables, function arguments, and return types. Rely on Supabase's generated types where applicable.

### Testing Strategy
- **Core Approach:** Test-Driven Development (TDD) — write failing tests before implementing the logic.
- **Frameworks:**
  - **Playwright:** Primary for End-to-End (E2E) UI testing and comprehensive user flows (e.g., onboarding, routine execution).
  - **Vitest:** Primary for unit tests and integration tests covering pure functions, utility logic (e.g., `lib/recommender.ts`), and API route business logic.
- **Coverage Goal:** Maintain a minimum **70% test coverage** for all new features.
- **Testing Best Practices:**
  - Use **Playwright** for resilient UI-based assertions using `data-testid` rather than CSS selectors.
  - Use **Vitest** for fast-executing logic validation where a browser environment is not required.
  - Run Playwright in `--ui` mode during active development for visual feedback.

---

## 2. PRD & Design References
- **Single Source of Truth:** The primary reference document is `Project Memory/MindGame_PRD.md`. Any feature definition should be cross-verified against this document.
- **Scope Discipline:** Adhere strictly to the MoSCoW priorities and Sprint breakdowns outlined in the PRD.
- **Out of Scope:** Features explicitly marked as "Won't Have" (e.g., Mid-Game Recovery, Social Features, Leaderboards) must be omitted.

---

## 3. Scrum & Workflow Instructions

### Branch Naming Convention
A new branch must be created for every single issue or feature. Format:
`[type]/[issue-number]-[brief-description]`
- **Types:** `feature`, `bugfix`, `hotfix`, `chore`, `docs`
- **Example:** `feature/42-routine-builder-drag-drop`
- **Example:** `bugfix/15-fix-onboarding-redirect`

### Commit Message Format
Use meaningful, descriptive commit messages following the Conventional Commits format:
`[type]([optional scope]): [description]`
- **Example:** `feat(routine): implement drag-and-drop for routine steps`
- **Example:** `fix(auth): handle expired session token edge case`
- **Guidance:** If the commit is complex, include a blank line after the description followed by a detailed explanation.

### How to Reference GitHub Issues
- **In Commits:** When a commit resolves an issue, include `Closes #[issue-number]` or `Fixes #[issue-number]` in the message body to trigger automatic closure upon merging.
- **In Commits (Relational):** If it relates to an issue but doesn't close it, use `Relates to #[issue-number]`.
- **In Code Additions:** Use standard syntax like `// TODO(#42): Refactor when endpoint is available` to reference related work remaining.

### PR Workflow
- **Link PRs:** Every Pull Request must be linked to its corresponding GitHub Issue.
- **Required Reviews:** At least 1 approved code review is required before merging.
- **Check Passing:** All automated CI checks (linting, type checks, and Playwright tests) must pass green.
- **Merge Strategy:** "Squash and Merge" is the preferred method to maintain a clean history on the `main` branch.

### Agile & Sprints
- **Milestones:** Every time you create an issue, you must explicitly associate it with the corresponding Sprint Milestone (e.g., "Sprint 1", "Sprint 2").
- **MVP Iterations:** At the end of each sprint cycle, the team MUST deliver a functional, testable MVP satisfying that sprint's designated success criteria.
- **Issue Granularity:** Each GitHub Issue must map to exactly one row in the milestone task tables from the PRD (e.g., "Build `/login` page" is one issue; "M1.1 Authentication" is not). One issue = one PR = one squash commit on main.

---

## 4. Do's and Don'ts

### Patterns to Follow
- **DO** rely entirely on Supabase Row Level Security (RLS) for data privacy. Assume API route checks could fail or be bypassed; RLS is the ultimate safety net.
- **DO** embrace React Server Components (RSC) to minimize client bundle size and hide sensitive logic entirely on the server tier.
- **DO** encapsulate core business logic—specifically the rule-based recommender—into pure, deeply testable utility functions (e.g., `lib/recommender.ts`).
- **DO** utilize `shadcn/ui` for rapid, accessible UI components.

### Patterns to Avoid
- **DON'T** implement Machine Learning or over-engineered logic for the recommender. The PRD explicitly calls for a rule-based setup.
- **DON'T** leak sensitive data between roles. Ensure Coaches can never fetch their athletes' anxiety levels or pre-game notes.
- **DON'T** fetch excessive data on the client. Colocate data fetching in your Server Components and pass only exactly what the Client Component needs via props.

### Dependencies and Libraries
- **Prefer:** 
  - `date-fns` for lightweight date manipulation (over larger libraries like `moment.js`).
  - `lucide-react` for iconography.
  - `react-hook-form` paired with `zod` for robust form handling and strict schema validation.
- **Avoid:** Heavy global client-side state managers (like Redux or Zustand) unless absolutely required by a complex client-side interaction. Typically, URL state, React Context, and Server Component data-fetching are sufficient.

### Security and Accessibility Requirements
- **Security:**
  - Never expose the `SUPABASE_SERVICE_ROLE_KEY` to the client. Only the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe for the browser environment.
  - Implement comprehensive data validation (e.g. via Zod) on the server before interacting with the database.
- **Accessibility (a11y):**
  - Applications must be usable entirely via keyboard navigation.
  - All form controls must have clearly associated, readable labels.
  - Retain the built-in accessibility properties (like ARIA attributes and focus management) provided by the Radix UI primitives underlying shadcn components.

---

## 5. CI/CD Pipeline

### GitHub Actions Workflow — Required File
A `.github/workflows/ci.yml` file MUST exist in the repository. 
This file must be created as part of M1.0 (Project Scaffolding) 
before any other milestone begins.

### Required CI Jobs
The workflow must run the following jobs on every push to any branch 
and on every pull request targeting `main`:

1. **Lint** — `next lint`
2. **Type Check** — `tsc --noEmit`
3. **Unit & Integration Tests** — `vitest run`
4. **E2E Tests** — `playwright test`

All 4 jobs must pass green before a PR is eligible for merge.

### Workflow Trigger Rules
- Trigger on: `push` to any branch, `pull_request` targeting `main`
- E2E tests should run against a local Next.js dev server started 
  within the workflow (use Playwright's `webServer` config)
- Use Supabase CLI to spin up a local Supabase instance for tests
  (`supabase start` in the workflow before running tests)

### Environment Variables in CI
- Store `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and 
  `SUPABASE_SERVICE_ROLE_KEY` as GitHub Actions secrets
- Never hardcode credentials in the workflow file
- Use a separate test-only Supabase project for CI 
  (not the production project)

### Agent Instruction
When scaffolding the project (M1.0), the agent MUST:
1. Create `.github/workflows/ci.yml` with the jobs listed above
2. Verify the workflow file is syntactically valid YAML before committing
3. Commit it under: `chore(ci): add GitHub Actions CI workflow`
4. Confirm the workflow appears and runs in the GitHub Actions tab 
   before marking M1.0 complete

---

## 6. Database Migration Workflow
- Every schema change MUST be captured as a versioned migration file 
  in `supabase/migrations/` using the Supabase CLI:
  `supabase migration new [description]`
- Migration files must be committed in the same PR as the code that 
  depends on the schema change — never separately.
- To apply locally: `supabase db reset` (runs all migrations + seed)
- Migration files are never edited after being committed. 
  If a fix is needed, create a new migration.

