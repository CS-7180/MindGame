"use client";

import { Flame } from "lucide-react";

interface StreakCardProps {
    streak: number;
}

export function StreakCard({ streak }: StreakCardProps) {
    return (
        <div className="border border-slate-800 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-full">
                    <Flame className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">
                        {streak} {streak === 1 ? "Game" : "Games"}
                    </h3>
                    <p className="text-sm text-slate-400">
                        Current Routine Streak
                    </p>
                </div>
            </div>

            <div className="text-sm text-slate-500 text-center sm:text-right max-w-sm">
                <p className="italic">
                    "These results are based on your self-reported ratings and are not scientifically validated."
                </p>
            </div>
        </div>
    );
}
