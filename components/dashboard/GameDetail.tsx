"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Play,
    Brain,
    Lock,
    CheckCircle2,
    AlertTriangle,
    Trophy,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import InlineRoutineExecution from "./InlineRoutineExecution";
import GameInsights from "./GameInsights";
import PostGameForm from "@/components/post-game/PostGameForm";

// ── Types ──

interface UpcomingGame {
    id: string;
    sport: string;
    game_name: string;
    game_date: string;
    game_time: string;
    reminder_offset_mins: number;
    created_at?: string;
}

interface RoutineStep {
    id: string;
    step_order: number;
    techniques: {
        id: string;
        name: string;
        category: string;
        duration_minutes: number;
        instruction?: string | null;
    };
}

interface Routine {
    id: string;
    name: string;
    source: string;
    is_active: boolean;
    sport: string;
    routine_steps: RoutineStep[];
}

interface GameLog {
    id: string;
    log_date: string;
    sport: string;
    pre_confidence_level: number | null;
    pre_anxiety_level: number | null;
    routine_completed: string | null;
    post_performance: number | null;
}

export interface GameDetailProps {
    gameId: string;
    sport: string;
    upcomingGames: UpcomingGame[];
    pastGames: UpcomingGame[];
    routines: Routine[];
    gameLogs: GameLog[];
    onBack: () => void;
}

const getTheme = (sport: string) => {
    const themes: Record<string, { from: string; to: string; text: string; light: string; border: string }> = {
        soccer: { from: 'from-emerald-600', to: 'to-emerald-500', text: 'text-emerald-400', light: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        basketball: { from: 'from-orange-600', to: 'to-orange-500', text: 'text-orange-400', light: 'bg-orange-500/10', border: 'border-orange-500/20' },
        tennis: { from: 'from-yellow-600', to: 'to-yellow-500', text: 'text-yellow-400', light: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
        baseball: { from: 'from-red-600', to: 'to-red-500', text: 'text-red-400', light: 'bg-red-500/10', border: 'border-red-500/20' },
        football: { from: 'from-amber-700', to: 'to-amber-600', text: 'text-amber-400', light: 'bg-amber-500/10', border: 'border-amber-500/20' },
        track: { from: 'from-sky-600', to: 'to-sky-500', text: 'text-sky-400', light: 'bg-sky-500/10', border: 'border-sky-500/20' },
    };
    return themes[sport?.toLowerCase()] || { from: 'from-indigo-600', to: 'to-indigo-500', text: 'text-indigo-400', light: 'bg-indigo-500/10', border: 'border-indigo-500/20' };
};

export default function GameDetail({ gameId, sport, upcomingGames, pastGames, routines, gameLogs, onBack }: GameDetailProps) {
    const router = useRouter();
    const theme = getTheme(sport);

    // Find the game from both lists
    const game = useMemo(() => {
        return [...upcomingGames, ...pastGames].find(g => g.id === gameId);
    }, [gameId, upcomingGames, pastGames]);

    // Find active routine for this sport
    const activeRoutine = useMemo(() => {
        return routines.find(r => r.sport === sport && r.is_active);
    }, [routines, sport]);

    // Transform routine to InlineRoutineExecution format (routine_steps -> steps with technique)
    const inlineRoutine = useMemo(() => {
        if (!activeRoutine) return null;
        return {
            id: activeRoutine.id,
            name: activeRoutine.name,
            steps: activeRoutine.routine_steps.map(rs => ({
                id: rs.id,
                step_order: rs.step_order,
                technique: {
                    id: rs.techniques.id,
                    name: rs.techniques.name,
                    category: rs.techniques.category,
                    duration_minutes: rs.techniques.duration_minutes,
                    instruction: rs.techniques.instruction ?? null,
                },
            })),
        };
    }, [activeRoutine]);

    // Determine if post-game is unlocked (game time has passed)
    const [isPostGameUnlocked, setIsPostGameUnlocked] = useState(false);
    const [timeLeftLabel, setTimeLeftLabel] = useState<string | null>(null);
    const [routineCompleted, setRoutineCompleted] = useState(false);
    const [pendingPostLogId, setPendingPostLogId] = useState<string | null>(null);

    // Check for pending post-game log
    useEffect(() => {
        const checkPendingPosts = async () => {
            try {
                const res = await fetch(`/api/logs/pending-post?sport=${encodeURIComponent(sport)}`);
                if (res.ok) {
                    const data = await res.json();
                    setPendingPostLogId(data.pendingLog?.id || null);
                }
            } catch (err) {
                console.error("Failed to check pending posts:", err);
            }
        };
        checkPendingPosts();
    }, [sport, routineCompleted]);

    useEffect(() => {
        if (!game) return;

        const check = () => {
            const gameDateTime = new Date(`${game.game_date}T${game.game_time}`);
            const now = new Date();
            const diff = gameDateTime.getTime() - now.getTime();

            if (diff <= 0) {
                setIsPostGameUnlocked(true);
                setTimeLeftLabel(null);
            } else {
                setIsPostGameUnlocked(false);
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeftLabel(hours > 0 ? `${hours}h ${mins}m until game time` : `${mins}m until game time`);
            }
        };

        check();
        const interval = setInterval(check, 60000);
        return () => clearInterval(interval);
    }, [game]);

    if (!game) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertTriangle className="h-10 w-10 text-slate-600 mb-4" />
                <p className="text-slate-400 text-sm mb-4">Game not found</p>
                <Button variant="ghost" className="text-indigo-400" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Overview
                </Button>
            </div>
        );
    }

    // Format date label — use local date (not UTC) to match stored game_date
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const tmrw = new Date(now);
    tmrw.setDate(tmrw.getDate() + 1);
    const tmrwStr = `${tmrw.getFullYear()}-${String(tmrw.getMonth() + 1).padStart(2, '0')}-${String(tmrw.getDate()).padStart(2, '0')}`;

    let dateLabel = '';
    if (game.game_date === todayStr) dateLabel = 'Today';
    else if (game.game_date === tmrwStr) dateLabel = 'Tomorrow';
    else {
        const d = new Date(game.game_date + 'T00:00:00');
        dateLabel = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }

    const isGameDay = game.game_date === todayStr;

    return (
        <div className="space-y-6">
            {/* Back button + Header */}
            <div>
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Overview
                </button>

                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                    <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${theme.from} ${theme.to} opacity-10 blur-3xl rounded-full -mr-16 -mt-16`}></div>
                    <div className="p-6 relative z-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    {isGameDay && !isPostGameUnlocked && (
                                        <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30 animate-pulse">
                                            Game Day
                                        </span>
                                    )}
                                    {isPostGameUnlocked && (
                                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                                            Completed
                                        </span>
                                    )}
                                    {routineCompleted && (
                                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30">
                                            Routine Done
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-xl font-bold text-white">{game.game_name}</h1>
                                <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <Trophy className="h-4 w-4 text-indigo-400" />
                                        {sport}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        {dateLabel}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" />
                                        {game.game_time.substring(0, 5)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {timeLeftLabel && (
                            <div className="mt-4 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 inline-flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-indigo-400" />
                                <span className="text-slate-300">{timeLeftLabel}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Pre-Game Routine Section (Inline Execution) ── */}
            <div className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Pre-Game Routine</h2>
                {inlineRoutine ? (
                    <InlineRoutineExecution
                        routine={inlineRoutine}
                        onComplete={() => setRoutineCompleted(true)}
                    />
                ) : (
                    <Card className="border-slate-800 bg-slate-900">
                        <CardContent className="p-5 text-center">
                            <p className="text-sm text-slate-400 mb-3">No active routine for {sport}.</p>
                            <Button
                                className={`bg-gradient-to-r ${theme.from} ${theme.to} text-white font-bold`}
                                onClick={() => router.push(`/routine/builder?sport=${encodeURIComponent(sport)}`)}
                            >
                                <Play className="h-4 w-4 mr-2" /> Create Routine
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* ── Pre-Game Log Section ── */}
            <div className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Pre-Game Log</h2>
                <Card className="border-slate-800 bg-slate-900">
                    <CardContent className="p-5">
                        <p className="text-sm text-slate-400 mb-4">Record your mental state before the game — confidence, anxiety, and focus levels.</p>
                        <Button
                            variant="outline"
                            className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white h-11"
                            onClick={() => router.push(`/log/pre?sport=${encodeURIComponent(sport)}&gameId=${game.id}`)}
                            disabled={isPostGameUnlocked}
                        >
                            <Brain className="h-5 w-5 mr-2" />
                            {isPostGameUnlocked ? "Pre-Game Log Locked" : "Fill Pre-Game Log"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* ── Post-Game Reflection Section (Time-gated) ── */}
            <div className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    Post-Game Reflection
                    {!isPostGameUnlocked && <Lock className="h-3.5 w-3.5 text-slate-600" />}
                </h2>
                {isPostGameUnlocked ? (
                    pendingPostLogId ? (
                        <Card className="border-emerald-500/30 bg-emerald-500/5">
                            <CardContent className="p-5">
                                <div className="flex items-start gap-3 mb-4">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-white font-medium">Game time has passed — reflect now</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Rate your performance and mental state during the game.</p>
                                    </div>
                                </div>
                                <PostGameForm logId={pendingPostLogId} />
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-red-500/30 bg-red-500/5">
                            <CardContent className="p-5">
                                <div className="flex items-start gap-3 mb-4">
                                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-red-400 font-medium">Missed Pre-Game Log</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Since the game time has passed and you missed the pre-game log, you cannot fill out a post-game reflection.</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    disabled
                                    className="w-full border-slate-700 text-slate-500 bg-slate-800/50 h-11"
                                >
                                    <Lock className="h-4 w-4 mr-2" />
                                    Post-Game Reflection Locked
                                </Button>
                            </CardContent>
                        </Card>
                    )
                ) : (
                    <Card className="border-slate-800 bg-slate-900/50 opacity-60">
                        <CardContent className="p-5 flex items-center gap-3">
                            <Lock className="h-5 w-5 text-slate-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-slate-400">Post-game reflection unlocks after the game starts.</p>
                                {timeLeftLabel && (
                                    <p className="text-xs text-slate-500 mt-1">{timeLeftLabel}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* ── Game Insights Section ── */}
            <GameInsights game={game} gameLogs={gameLogs} />
        </div>
    );
}
