# MindGame

**MindGame** is a full-stack web application designed to help athletes build and execute personalized pre-game mental routines. By leveraging techniques like visualization, guided breathing, and affirmations, MindGame empowers athletes to close the practice-to-match performance gap and achieve peak mental states on game day.

## 🚀 Key Features

- **Personalized Onboarding**: A rule-based recommender engine that maps your sport and anxiety symptoms to a tailored starter routine.
- **Guided Routine Execution**: A step-by-step walkthrough of your mental routine, ensuring focus and consistency.
- **Correlation Dashboard**: Track your adherence and visualize how mental preparation correlates with your self-reported game performance.
- **Coach-Athlete Feedback Loop**: Coaches can share routine templates with their teams while maintaining athlete privacy and ownership.
- **Privacy by Default**: All sensitive data is protected via Supabase Row Level Security (RLS), ensuring only you can access your personal reflections and scores.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Frontend**: [React 18](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + RLS + Auth)
- **Charts**: [Recharts](https://recharts.org/)
- **Notifications**: Web Push API (`web-push`)
- **Testing**: [Vitest](https://vitest.dev/) (Unit/Integration), [Playwright](https://playwright.dev/) (E2E)

## 🏗️ Getting Started

### Prerequisites

- Node.js (v18 or later)
- A Supabase Project

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

3.  **Environment Variables**:
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## 🧪 Testing

We follow a TDD approach with a minimum coverage requirement of 70%.

- **Unit/Integration Tests**: `npm run test` (Vitest)
- **E2E Tests**: `npx playwright test`

## 📂 Project Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: Domain-specific and shared UI components.
- `lib/`: Core logic, including the routine recommender and Supabase clients.
- `supabase/`: Database migrations and seed scripts.
- `types/`: Auto-generated database types.

## 📄 License & Credits

Built for CS7180 Project 2. Designed and developed by Raj Laskar and Vineela Goli.
