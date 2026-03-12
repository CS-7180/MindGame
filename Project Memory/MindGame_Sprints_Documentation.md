# MindGame — Sprints Review & Retrospective

## Sprint 1: Core Athlete Loop
**Goal:** Enable athletes to sign up, complete onboarding, build a personalized routine, execute it, and log pre-game mental states.

### Sprint 1 Review
- **Accomplishments:**
    - [x] Next.js 14 infrastructure & Supabase integration.
    - [x] Robust authentication with role-based routing (Athlete/Coach).
    - [x] Guided 4-step onboarding questionnaire with rule-based technique recommendation.
    - [x] Interactive Routine Builder with drag-and-drop support (verified in E2E tests).
    - [x] Step-by-step Guided Routine Execution with progress tracking.
    - [x] Pre-Game Log system for tracking anxiety and confidence.
    - [x] Data privacy enforced via Supabase Row Level Security (RLS).
- **Status:** **Completed** on schedule. All core happy-path flows verified.

### Sprint 1 Retrospective
- **What went well:**
    - The rule-based recommender provides immediate value without the complexity of ML.
    - shadcn/ui enabled rapid development of a premium-feeling interface.
    - TDD approach with Playwright caught several routing and state edge cases early.
- **What could be improved:**
    - Initial Supabase RLS setup was time-consuming; better boilerplates could speed this up in the future.
    - Drag-and-drop implementation was trickier than expected for mobile touch targets.
- **Action Items:**
    - Refine mobile touch areas for the routine builder.
    - Document the RLS patterns for faster follow-up features.

---

## Sprint 2: Feedback Loop & Coach Portal
**Goal:** Add post-game reflections, correlation dashboard, history, pre-game reminders, and coach template sharing.

### Sprint 2 Review
- **Accomplishments:**
    - [x] Post-Game Reflection entry with performance and mental state tracking.
    - [x] Correlation Dashboard using Recharts to visualize adherence impact.
    - [x] Comprehensive History view with filtering and entry detail.
    - [x] Game Scheduler with automated reminder logic.
    - [x] **Coach Portal:** Template creation and roster management.
    - [x] **Template Sharing:** Athletes can receive and customize coach-shared routines.
    - [x] Enhanced E2E test coverage for the entire coach-athlete feedback loop.
- **Status:** **Completed**. The "Feedback Loop" is fully closed, and coach features are operational.

### Sprint 2 Retrospective
- **What went well:**
    - The dual-role flow (Coach sharing → Athlete customizing) works seamlessly thanks to the shared routine builder logic.
    - Correlation dashboard placeholder logic ensures a clean UX even with low data.
    - Web Push API integration provides high-engagement reminders.
- **What could be improved:**
    - E2E tests for the coach flow were initially flaky due to toast notifications; adding `data-testid` and better visibility waits resolved this.
    - Complexity of the "Customize & Save" flow required more state management than anticipated.
- **Action Items:**
    - Standardize `data-testid` usage across all new UI components.
    - Simplify the notification clearing logic to prevent stale alerts.

---

## Final Project Status Summary
MindGame has successfully transitioned from concept to a production-ready MVP. The core insight—that routines must be "owned" by athletes to be effective—is manifested in the customization-centric template sharing flow. Technical debt is low, and CI/CD coverage (linting, types, unit, E2E) ensures stability for future iterations.
