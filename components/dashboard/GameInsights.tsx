"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Brain, HeartPulse, Trophy, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { useMemo } from "react";

interface GameLog {
    id: string;
    game_id?: string | null;
    log_date: string;
    sport: string;
    pre_confidence_level: number | null;
    pre_anxiety_level: number | null;
    routine_completed: string | null;
    post_performance: number | null;
}

interface Game {
    id: string;
    game_date: string;
    sport: string;
}

export interface GameInsightsProps {
    game: Game;
    gameLogs: GameLog[];
}

export default function GameInsights({ game, gameLogs }: GameInsightsProps) {
    // Find the log specifically for this game
    // Prefer exact game_id matching if available, else date/sport fallback 
    const gameLog = useMemo(() => {
        const exactMatch = gameLogs.find(l => l.game_id === game.id);
        if (exactMatch) return exactMatch;
        return gameLogs.find(l => l.log_date === game.game_date && l.sport === game.sport);
    }, [gameLogs, game]);

    // Format adherence
    const renderAdherence = () => {
        if (!gameLog || !gameLog.routine_completed) return { text: "Pending", color: "text-slate-400", icon: <Activity className="h-5 w-5 text-slate-400" /> };
        switch(gameLog.routine_completed) {
            case "yes": return { text: "Full", color: "text-emerald-400", icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" /> };
            case "partial": return { text: "Partial", color: "text-amber-400", icon: <CheckCircle2 className="h-5 w-5 text-amber-400" /> };
            case "no": return { text: "Skipped", color: "text-red-400", icon: <AlertCircle className="h-5 w-5 text-red-400" /> };
            default: return { text: "Unknown", color: "text-slate-400", icon: <Activity className="h-5 w-5 text-slate-400" /> };
        }
    };
    
    const adherence = renderAdherence();

    if (!gameLog || gameLog.post_performance == null) {
        return null; // Entirely hidden if incomplete
    }

    return (
        <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Game Insights</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="border-slate-800 bg-slate-900">
                    <CardContent className="p-4 text-center">
                        <div className="flex justify-center mb-1">{adherence.icon}</div>
                        <p className={`text-lg font-bold ${adherence.color}`}>{adherence.text}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Routine Adherence</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900">
                    <CardContent className="p-4 text-center">
                        <div className="flex justify-center mb-1"><Brain className="h-5 w-5 text-indigo-400" /></div>
                        <p className="text-lg font-bold text-white">
                            {gameLog?.pre_confidence_level != null ? `${gameLog.pre_confidence_level}/5` : "—"}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Pre Confidence</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900">
                    <CardContent className="p-4 text-center">
                        <div className="flex justify-center mb-1"><HeartPulse className="h-5 w-5 text-rose-400" /></div>
                        <p className="text-lg font-bold text-white">
                            {gameLog?.pre_anxiety_level != null ? `${gameLog.pre_anxiety_level}/5` : "—"}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Pre Anxiety</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900">
                    <CardContent className="p-4 text-center">
                        <div className="flex justify-center mb-1"><Trophy className="h-5 w-5 text-amber-400" /></div>
                        <p className="text-lg font-bold text-white">
                            {gameLog?.post_performance != null ? `${gameLog.post_performance}/5` : "—"}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Post Performance</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
