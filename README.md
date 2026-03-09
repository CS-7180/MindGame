# MindGame

**Live Application:** [https://mind-game-app.vercel.app/](https://mind-game-app.vercel.app/)

**MindGame** is a full-stack web application designed to help athletes build and execute personalized pre-game mental routines. By leveraging techniques like visualization, guided breathing, and affirmations, MindGame empowers athletes to close the practice-to-match performance gap and achieve peak mental states on game day.

## 🚀 Key Features

### Sprint 1: Athlete Core Loop
- **Personalized Onboarding**: Complete a quick questionnaire to map your sport and anxiety symptoms to a tailored starter routine. Powered by a server-side, rule-based recommender engine.
- **Custom Routine Builder**: Select techniques from a library (like Box Breathing, Affirmations, Body Scan), drag-and-drop steps into order, and save up to 5 personalized routines per athlete.
- **Guided Routine Execution**: Step-by-step walkthroughs of your mental routine, ensuring low cognitive load, focus, and adherence under time constraints (e.g., Quick ≤2 min, Standard 3-5 min).
- **Pre-Game Entry Logging**: After completing a routine, log your pre-game anxiety and confidence levels, along with optional notes, to keep a record of your mental state prior to matches.
- **Privacy by Default**: All sensitive data is strictly protected via **Supabase Row Level Security (RLS)** at the database layer. No public profiles, no social features, and no data leaks.

### Sprint 2: Feedback Loop & Coach Tools
- **Correlation Dashboard**: Track your routine adherence and visualize how mental preparation correlates with your self-reported game performance over time (unlocked after 5 game entries).
- **Pre-Arrival Routine Reminders**: Schedule game dates/times and receive Web Push notifications (30, 45, or 60 minutes before) to complete your routine prior to arrival at the venue.
- **Post-Game Reflections**: Receive timely reminders to record your game performance and mental state, completing the feedback loop.
- **Coach Templates (Team Sharing)**: Coaches can create standard routine templates and share them with their roster. Athletes must "Customize & Save" templates into their personal builder to establish ownership.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router + React Server Components)
- **Frontend**: [React 18](https://react.dev/), [Tailwind CSS v3](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI) + `lucide-react` for icons + `react-hook-form` / `zod` for forms
- **Charts**: [Recharts](https://recharts.org/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + RLS + Authentication + Realtime)
- **Notifications**: Web Push API (`web-push` npm package) + Supabase Edge Functions (cron)
- **Deployment**: [Vercel](https://vercel.com)

## 🏗️ Getting Started

### Prerequisites

- Node.js (v18 or later)
- Supabase CLI (`npm install -g supabase`)

### Local Development

1.  **Clone the repository**:
    ```bash
    git clone <your-repo-url>
    cd MindGame
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start Local Supabase & Migrate**:
    Ensure Docker is running, then spin up the local database with all migrations and seeded data:
    ```bash
    npx supabase start
    ```
    If you ever need to reset the database and re-apply seeding:
    ```bash
    npx supabase db reset
    ```

4.  **Environment Variables**:
    Create a `.env.local` file in the root directory and add the keys provided by your local `supabase start` or production dashboard:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    ```
    *(Note: `SUPABASE_SERVICE_ROLE_KEY` should never be exposed to the browser.)*

5.  **Run the development server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## 🧪 Testing

We adhere strictly to a **TDD approach** with a minimum coverage requirement of 70% for all new features.

- **Unit/Integration Tests**: 
  ```bash
  npm run test 
  # or
  npx vitest run
  ```
- **E2E Tests (Playwright)**: 
  Before running E2E tests, ensure your local Supabase instance is running and seeded.
  ```bash
  npx playwright test
  ```
  During active development, it is highly recommended to use the UI mode:
  ```bash
  npx playwright test --ui
  ```

## 🔄 Development Workflow

- **Branch Naming**: `[type]/[issue-number]-[brief-description]` (e.g., `feature/42-routine-builder-drag-drop`)
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/). Example: `feat(routine): implement drag-and-drop for routine steps`
- **PRs**: Link your PR to the corresponding GitHub Issue (`Resolves #N`). All CI checks (Lint, Type Check, Unit, E2E) must pass. Require 1 code review approval. Use **Squash and Merge**.

## 📂 Project Structure

- `app/`: Next.js App Router pages (divided into `(auth)`, `(athlete)`, `(coach)`) and API routes (`api/`).
- `components/`: Domain-specific components (`onboarding`, `routine`, `dashboard`, `logging`, `coach`) and shared `ui/` primitives (shadcn).
- `lib/`: Core utilities, including the pure-function recommender (`recommender.ts`), push notifications, and Supabase clients (`client.ts`, `server.ts`, `middleware.ts`).
- `supabase/`: Database migrations (`supabase/migrations/`) and seed scripts.
- `types/`: Auto-generated database types.

## 📄 License & Credits

Built for CS7180 Project 2. Designed and developed by Raj Laskar and Vineela Goli.
