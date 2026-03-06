import { GameScheduler } from "@/components/shared/GameScheduler";

export const metadata = {
  title: "Schedule Game | MindGame",
  description: "Schedule your next game and set mental routine reminders.",
};

export default function NewGamePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Pre-Game Timing
          </h1>
          <p className="text-lg text-slate-400">
            Tell us when you play so we can prompt your routine.
          </p>
        </div>
        <GameScheduler />
      </div>
    </div>
  );
}
