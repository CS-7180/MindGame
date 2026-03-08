"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Brain,
    Play,
    Plus,
    Trash2,
    Activity,
    Calendar,
    CalendarPlus,
    ChevronRight,
    Target,
    TrendingUp,
    Info,
    X,
    Clock,
    Edit3,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoutineLibrary } from "@/components/routine/RoutineLibrary";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// ── Shared types ──

interface RoutineStep {
    id: string;
    step_order: number;
    techniques: {
        id: string;
        name: string;
        category: string;
        duration_minutes: number;
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

interface UpcomingGame {
    id: string;
    sport: string;
    game_date: string;
    game_time: string;
    reminder_offset_mins: number;
    created_at?: string;
}

export interface SportOverviewProps {
    displayName: string;
    selectedSport: string;
    routines: Routine[];
    gameLogs: GameLog[];
    upcomingGames: UpcomingGame[];
}

// ── Theme helpers ──

const SPORT_EMOJIS: Record<string, string> = {
    soccer: "⚽", basketball: "🏀", tennis: "🎾", baseball: "⚾",
    football: "🏈", track: "🏃", swimming: "🏊", volleyball: "🏐",
    golf: "⛳", hockey: "🏒", cricket: "🏏", rugby: "🏉",
};

const getTheme = (sport: string) => {
    const themes: Record<string, { from: string; to: string; text: string; light: string; border: string; bg: string; ring: string }> = {
        soccer: { from: 'from-emerald-600', to: 'to-emerald-500', text: 'text-emerald-400', light: 'bg-emerald-500/10', border: 'border-emerald-500/20', bg: 'bg-emerald-500', ring: 'ring-emerald-500/40' },
        basketball: { from: 'from-orange-600', to: 'to-orange-500', text: 'text-orange-400', light: 'bg-orange-500/10', border: 'border-orange-500/20', bg: 'bg-orange-500', ring: 'ring-orange-500/40' },
        tennis: { from: 'from-yellow-600', to: 'to-yellow-500', text: 'text-yellow-400', light: 'bg-yellow-500/10', border: 'border-yellow-500/20', bg: 'bg-yellow-500', ring: 'ring-yellow-500/40' },
        baseball: { from: 'from-red-600', to: 'to-red-500', text: 'text-red-400', light: 'bg-red-500/10', border: 'border-red-500/20', bg: 'bg-red-500', ring: 'ring-red-500/40' },
        football: { from: 'from-amber-700', to: 'to-amber-600', text: 'text-amber-400', light: 'bg-amber-500/10', border: 'border-amber-500/20', bg: 'bg-red-500', ring: 'ring-red-500/40' },
        track: { from: 'from-sky-600', to: 'to-sky-500', text: 'text-sky-400', light: 'bg-sky-500/10', border: 'border-sky-500/20', bg: 'bg-cyan-500', ring: 'ring-cyan-500/40' },
    };
    return themes[sport?.toLowerCase()] || { from: 'from-indigo-600', to: 'to-indigo-500', text: 'text-indigo-400', light: 'bg-indigo-500/10', border: 'border-indigo-500/20', bg: 'bg-indigo-500', ring: 'ring-indigo-500/40' };
};

// ── Component ──

export default function SportOverview({ displayName, selectedSport, routines, gameLogs, upcomingGames }: SportOverviewProps) {
    const router = useRouter();

    // Local UI state
    const [deletingRoutineId, setDeletingRoutineId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [settingActiveId, setSettingActiveId] = useState<string | null>(null);
    const [pendingPostLogId, setPendingPostLogId] = useState<string | null>(null);
    const [guidanceDismissed, setGuidanceDismissed] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    // ── Derived data ──
    const filteredRoutines = routines.filter(r => r.sport === selectedSport);
    const sportLogs = gameLogs.filter(l => l.sport === selectedSport).sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
    const lastGame = sportLogs[0] || null;
    const completedCount = sportLogs.filter(l => l.routine_completed === 'fully' || l.routine_completed === 'partially').length;
    const completionRate = sportLogs.length > 0 ? Math.round((completedCount / sportLogs.length) * 100) : 0;
    const theme = getTheme(selectedSport);
    const activeRoutine = filteredRoutines.find((r) => r.is_active);

    const sportGames = upcomingGames.filter(g => g.sport === selectedSport);
    const nextGame = sportGames[0] || null;

    const totalTime = activeRoutine
        ? activeRoutine.routine_steps.reduce((sum, s) => sum + (s.techniques?.duration_minutes || 0), 0)
        : 0;

    // ── Game context for hero card ──
    const getGameContext = () => {
        if (!nextGame) return { isGameDay: false, hoursUntil: null, gameLabel: null };
        const now = new Date();
        const gameDateTime = new Date(`${nextGame.game_date}T${nextGame.game_time}`);
        const diffMs = gameDateTime.getTime() - now.getTime();
        const hoursUntil = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
        const isToday = nextGame.game_date === now.toISOString().split('T')[0];
        const isTomorrow = (() => {
            const tmrw = new Date(now);
            tmrw.setDate(tmrw.getDate() + 1);
            return nextGame.game_date === tmrw.toISOString().split('T')[0];
        })();
        const daysUntil = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        const gameLabel = isToday ? `Today at ${nextGame.game_time}` : isTomorrow ? `Tomorrow at ${nextGame.game_time}` : `in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
        return { isGameDay: isToday && diffMs > 0, hoursUntil, gameLabel, daysUntil };
    };

    const gameContext = getGameContext();

    // ── Guidance banner ──
    const getGuidanceMessage = () => {
        if (pendingPostLogId) return {
            icon: '⚠️',
            text: 'You have a pending post-game reflection.',
            actionLabel: 'Log Post-Game Entry',
            actionPath: `/post-game/${pendingPostLogId}`
        };
        if (gameContext.isGameDay && activeRoutine) return {
            icon: '🎯',
            text: 'You have a game today.',
            actionLabel: 'Execute Routine',
            actionPath: `/routine/execute/${activeRoutine.id}`
        };
        if (gameContext.isGameDay && !activeRoutine) return {
            icon: '🎯',
            text: 'Game day!',
            actionLabel: 'Create Routine',
            actionPath: `/routine/builder?sport=${encodeURIComponent(selectedSport)}`
        };
        if (!activeRoutine && filteredRoutines.length === 0) return {
            icon: '🏗️',
            text: 'Get started by building your first mental routine.',
            actionLabel: 'Create Routine',
            actionPath: `/routine/builder?sport=${encodeURIComponent(selectedSport)}`
        };
        if (!activeRoutine && filteredRoutines.length > 0) return {
            icon: '⚡',
            text: 'You have routines for this sport, but none are active.',
            actionLabel: 'Set Active Routine',
            actionPath: '#set_tab_routines'
        };
        if (nextGame) return {
            icon: '📅',
            text: `Next game ${gameContext.gameLabel}.`,
            actionLabel: 'Review Your Routine',
            actionPath: '#set_tab_routines'
        };
        return {
            icon: '💡',
            text: 'No games scheduled to track.',
            actionLabel: 'Schedule Game',
            actionPath: `/games/new?sport=${encodeURIComponent(selectedSport)}`
        };
    };

    const guidance = getGuidanceMessage();

    // ── Effects ──
    useEffect(() => {
        setGuidanceDismissed(false);
    }, [selectedSport]);

    useEffect(() => {
        if (!selectedSport) return;
        const checkPendingPosts = async () => {
            try {
                const res = await fetch(`/api/logs/pending-post?sport=${encodeURIComponent(selectedSport)}`);
                if (res.ok) {
                    const data = await res.json();
                    setPendingPostLogId(data.pendingLog?.id || null);
                }
            } catch (err) {
                console.error("Failed to check pending posts:", err);
            }
        };
        checkPendingPosts();
    }, [selectedSport]);

    // ── Handlers ──
    const handleDeleteRoutine = async () => {
        if (!deletingRoutineId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/routines/${deletingRoutineId}`, { method: 'DELETE' });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error?.message || "Failed to delete routine");
            toast.success("Routine deleted successfully!");
            router.refresh();
        } catch (err: unknown) {
            toast.error("Failed to delete", { description: err instanceof Error ? err.message : "Unknown error" });
        } finally {
            setIsDeleting(false);
            setDeletingRoutineId(null);
        }
    };

    const handleSetActive = async (routineId: string) => {
        setSettingActiveId(routineId);
        try {
            const res = await fetch(`/api/routines/${routineId}/active`, { method: 'PATCH' });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error?.message || "Failed to set active routine");
            toast.success("Routine set to active!");
            router.refresh();
        } catch (err: unknown) {
            toast.error("Failed to update status", { description: err instanceof Error ? err.message : "Unknown error" });
        } finally {
            setSettingActiveId(null);
        }
    };

    // ── Render ──
    return (
        <div className="space-y-5">
            {/* Welcome */}
            <div>
                <p className="text-sm text-slate-400">Welcome back,</p>
                <h1 className="text-2xl font-bold text-white tracking-tight">{displayName} 👋</h1>
            </div>

            {/* ── Hero Card ── */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${theme.from} ${theme.to} opacity-10 blur-3xl rounded-full -mr-20 -mt-20`}></div>
                <div className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">{selectedSport} Overview</h2>
                            <p className="text-3xl font-bold text-white">{completionRate}%</p>
                            <p className="text-xs text-slate-500 mt-1">Routine adherence</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {lastGame && (
                                <div className={`px-3 py-1.5 rounded-lg ${theme.light} border ${theme.border} text-center`}>
                                    <p className={`text-xs ${theme.text} font-semibold uppercase tracking-wider`}>Last Game</p>
                                    <p className="text-sm font-bold text-white mt-0.5">Confidence: {lastGame.pre_confidence_level ?? '-'}/10</p>
                                </div>
                            )}
                            {nextGame && (
                                <div className={`px-3 py-1.5 rounded-lg ${gameContext.isGameDay ? 'bg-amber-500/15 border-amber-500/30' : theme.light + ' border ' + theme.border} text-center`}>
                                    <p className={`text-xs ${gameContext.isGameDay ? 'text-amber-400' : theme.text} font-semibold uppercase tracking-wider flex items-center gap-1`}>
                                        <Clock className="h-3 w-3" />
                                        {gameContext.isGameDay ? 'Game Day' : 'Next Game'}
                                    </p>
                                    <p className="text-sm font-bold text-white mt-0.5">{gameContext.gameLabel}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {activeRoutine ? (
                        <Button
                            className={`w-full bg-gradient-to-r ${gameContext.isGameDay ? 'from-amber-600 to-orange-500' : theme.from + ' ' + theme.to} text-white font-bold h-12 shadow-lg hover:opacity-90 transition-opacity`}
                            data-testid="start-routine"
                            onClick={() => router.push(`/routine/execute/${activeRoutine.id}`)}
                        >
                            <Play className="h-5 w-5 mr-2 fill-current" />
                            {gameContext.isGameDay ? 'Start Pre-Game Routine' : 'Start Routine'}
                        </Button>
                    ) : (
                        <Button
                            className={`w-full bg-gradient-to-r ${theme.from} ${theme.to} text-white font-bold h-12 shadow-lg hover:opacity-90 transition-opacity`}
                            data-testid="build-routine"
                            onClick={() => router.push(`/routine/builder?sport=${encodeURIComponent(selectedSport)}`)}
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Build First Routine
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Pending Post-Game Reflection ── */}
            {pendingPostLogId && (
                <Card className="border-amber-500/50 bg-amber-500/10 backdrop-blur-sm shadow-xl animate-in slide-in-from-top-2 duration-300">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-amber-500/20">
                                <Brain className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Post-Game Reflection Pending</h3>
                                <p className="text-sm text-amber-200/80">How did your game go? Take a minute to reflect.</p>
                            </div>
                        </div>
                        <Button
                            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/25 whitespace-nowrap"
                            onClick={() => router.push(`/post-game/${pendingPostLogId}`)}
                        >
                            Complete Now
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* ── Inner Tabs ── */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" id="home-tabs">
                <TabsList className="grid w-full grid-cols-3 bg-slate-900 border border-slate-800 p-1">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=inactive]:text-slate-400 transition-all text-sm">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="routines" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=inactive]:text-slate-400 transition-all text-sm">
                        Routines
                    </TabsTrigger>
                    <TabsTrigger value="gamelog" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=inactive]:text-slate-400 transition-all text-sm">
                        Game Log
                    </TabsTrigger>
                </TabsList>

                {/* ── OVERVIEW TAB ── */}
                <TabsContent value="overview" className="space-y-6 mt-5 focus-visible:outline-none focus-visible:ring-0">
                    {/* Contextual Guidance Banner */}
                    {guidance && !guidanceDismissed && (
                        <div className="relative rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <button
                                onClick={() => setGuidanceDismissed(true)}
                                className="absolute top-2 right-2 p-1 rounded-full hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors shrink-0"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                            <div className="flex items-start gap-3 pr-4">
                                <span className="text-lg mt-0.5 block shrink-0">{guidance.icon}</span>
                                <div className="pt-0.5 flex-1 min-w-0">
                                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-0.5">Suggested Next Step</p>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-1">
                                        <p className="text-sm text-slate-200 leading-snug">{guidance.text}</p>
                                        {guidance.actionLabel && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="bg-indigo-500 hover:bg-indigo-600 text-white border-0 self-start sm:self-auto shadow-md h-8 text-xs font-semibold px-3 shrink-0"
                                                onClick={() => {
                                                    if (guidance.actionPath === '#set_tab_routines') {
                                                        setActiveTab("routines");
                                                        const el = document.getElementById('home-tabs');
                                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                    } else if (guidance.actionPath) {
                                                        router.push(guidance.actionPath);
                                                    }
                                                }}
                                            >
                                                {guidance.actionLabel}
                                                <ChevronRight className="h-3 w-3 ml-1" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white tracking-tight">Quick Actions</h3>
                            <div className="group relative z-20">
                                <Info className="h-4 w-4 text-slate-500 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs leading-relaxed text-slate-300 w-64 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-xl shadow-black/50">
                                    <p className="font-semibold text-slate-200 mb-1 text-sm">Quick Actions</p>
                                    <p>These actions are always available, but for the optimal mental prep flow, we recommend focusing on the <span className="text-indigo-400 font-medium">Suggested Next Step</span> shown above.</p>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-8 border-transparent border-t-slate-800"></div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Card className="border-slate-800 bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer group" onClick={() => router.push(`/routine/builder?sport=${encodeURIComponent(selectedSport)}`)}>
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center mb-2 transition-colors">
                                        <Target className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-200">Routine Builder</p>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-800 bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer group" onClick={() => router.push(`/log/pre?sport=${encodeURIComponent(selectedSport)}`)}>
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center mb-2 transition-colors">
                                        <Brain className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-200">Pre-Game Log</p>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-800 bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer group" onClick={() => router.push(`/history?sport=${encodeURIComponent(selectedSport)}`)}>
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center mb-2 transition-colors">
                                        <Calendar className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-200">History Tracker</p>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-800 bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer group" onClick={() => router.push("/correlation")}>
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center mb-2 transition-colors">
                                        <Activity className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-200">Insights</p>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-800 bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer group" onClick={() => router.push(`/games/new?sport=${encodeURIComponent(selectedSport)}`)}>
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center mb-2 transition-colors">
                                        <CalendarPlus className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-200">Schedule Game</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Insights Preview */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-white tracking-tight">Insights Preview</h3>
                        <Card className="border-slate-800 bg-slate-900 overflow-hidden cursor-pointer group" onClick={() => router.push("/correlation")}>
                            <CardContent className="p-4 flex items-center justify-between group-hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${theme.light}`}>
                                        <TrendingUp className={`h-5 w-5 ${theme.text}`} />
                                    </div>
                                    <div>
                                        {sportLogs.length >= 5 ? (
                                            <>
                                                <p className="font-medium text-white text-sm">Full data unlocked!</p>
                                                <p className="text-xs text-slate-400">See what habits drive your performance.</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-medium text-white text-sm">Unlock Insights</p>
                                                <p className="text-xs text-slate-400">{5 - sportLogs.length} more logs needed.</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-white transition-colors" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Upcoming Matches */}
                    <div className="space-y-3 pb-4">
                        <h3 className="font-semibold text-white tracking-tight flex items-center justify-between">
                            Upcoming Matches
                            <span className="text-xs font-normal text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                                {sportGames.length} scheduled
                            </span>
                        </h3>
                        {sportGames.length > 0 ? (
                            <div className="space-y-2">
                                {sportGames.slice(0, 3).map((game) => {
                                    const now = new Date();
                                    const todayStr = now.toISOString().split('T')[0];
                                    const tmrw = new Date(now);
                                    tmrw.setDate(tmrw.getDate() + 1);
                                    const tmrwStr = tmrw.toISOString().split('T')[0];

                                    let dateLabel = '';
                                    if (game.game_date === todayStr) dateLabel = 'Today';
                                    else if (game.game_date === tmrwStr) dateLabel = 'Tomorrow';
                                    else {
                                        const d = new Date(game.game_date + 'T00:00:00');
                                        dateLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' });
                                    }

                                    const isGameToday = dateLabel === 'Today';

                                    return (
                                        <Card key={game.id} className={`border-slate-800 bg-slate-900/50 hover:bg-slate-800/70 transition-colors`}>
                                            <CardContent className="p-3.5 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2.5 rounded-lg ${isGameToday ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                                                        <Calendar className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-semibold ${isGameToday ? 'text-amber-400' : 'text-slate-200'}`}>
                                                            {dateLabel} <span className="text-xs font-normal text-slate-400 ml-1 mt-0.5 inline-block">— {game.game_time.substring(0, 5)}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                                {sportGames.length > 3 && (
                                    <p className="text-xs text-center text-slate-500 pt-2 font-medium">
                                        +{sportGames.length - 3} more games scheduled
                                    </p>
                                )}
                            </div>
                        ) : (
                            <Card className="border-slate-800 bg-slate-900/30 border-dashed">
                                <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                                    <p className="text-sm text-slate-400 mb-2">No upcoming matches.</p>
                                    <Button variant="link" className="text-indigo-400 h-auto p-0 font-medium" onClick={() => router.push(`/games/new?sport=${encodeURIComponent(selectedSport)}`)}>
                                        Schedule one now
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* ── ROUTINES TAB ── */}
                <TabsContent value="routines" className="space-y-6 mt-5 focus-visible:outline-none focus-visible:ring-0">
                    {/* Active Routine Preview */}
                    {activeRoutine ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-white tracking-tight">Current Routine</h3>
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white h-7 px-2" onClick={() => router.push(`/routine/builder?sport=${encodeURIComponent(selectedSport)}`)}>
                                    <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                                </Button>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <h4 className="font-medium text-white">{activeRoutine.name}</h4>
                                    <span className="text-slate-500 text-sm">• {totalTime} min</span>
                                </div>
                                <div className="space-y-2">
                                    {activeRoutine.routine_steps.map((step, idx) => (
                                        <div key={step.id} className="flex items-center gap-3 text-sm">
                                            <div className={`w-6 h-6 rounded-full ${theme.light} ${theme.text} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                                                {idx + 1}
                                            </div>
                                            <span className="text-slate-300 flex-1">{step.techniques?.name}</span>
                                            <span className="text-slate-500">{step.techniques?.duration_minutes}m</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center bg-slate-900/40">
                            <p className="text-slate-400 text-sm mb-3">No active routine for <span className="text-white font-medium">{selectedSport}</span></p>
                            <Button size="sm" className={`bg-gradient-to-r ${theme.from} ${theme.to} text-white`} onClick={() => router.push(`/routine/builder?sport=${encodeURIComponent(selectedSport)}`)}>
                                <Plus className="h-4 w-4 mr-1" /> Build Routine
                            </Button>
                        </div>
                    )}

                    {/* Routines List */}
                    {filteredRoutines.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-white tracking-tight">Your {selectedSport} Routines</h3>
                                <span className="text-xs text-slate-500">{filteredRoutines.length}/5</span>
                            </div>
                            <div className="space-y-2">
                                {filteredRoutines.map((routine) => (
                                    <Card
                                        key={routine.id}
                                        className="border-slate-800/60 bg-slate-900/50 hover:bg-slate-800/60 transition-all cursor-pointer group"
                                        onClick={() => router.push(`/routine/execute/${routine.id}`)}
                                    >
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-slate-200">{routine.name}</p>
                                                    {routine.is_active && (
                                                        <span className={`px-2 py-0.5 rounded-full ${theme.light} border ${theme.border} text-[10px] font-bold ${theme.text} uppercase tracking-wider`}>
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {routine.routine_steps?.length || 0} steps • {routine.source === "recommended" ? "Personalized" : "Custom"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!routine.is_active && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`${theme.text} font-medium hover:text-white hover:bg-slate-700 text-xs h-7`}
                                                        disabled={settingActiveId === routine.id}
                                                        onClick={(e) => { e.stopPropagation(); handleSetActive(routine.id); }}
                                                    >
                                                        {settingActiveId === routine.id ? "Setting..." : "Set Active"}
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 rounded-full"
                                                    onClick={(e) => { e.stopPropagation(); setDeletingRoutineId(routine.id); }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Template Library */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-white tracking-tight">Template Library</h3>
                        <RoutineLibrary
                            currentRoutinesCount={filteredRoutines.length}
                            userRoutineTitles={filteredRoutines.map(r => r.name)}
                            selectedSport={selectedSport}
                        />
                    </div>
                </TabsContent>

                {/* ── GAME LOG TAB ── */}
                <TabsContent value="gamelog" className="space-y-6 mt-5 focus-visible:outline-none focus-visible:ring-0">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white tracking-tight">Recent Games</h3>
                            <Button variant="link" className={`text-xs ${theme.text} p-0 h-auto`} onClick={() => router.push(`/history?sport=${encodeURIComponent(selectedSport)}`)}>
                                View all
                            </Button>
                        </div>
                        {sportLogs.length > 0 ? (
                            <div className="space-y-2">
                                {sportLogs.slice(0, 5).map((log) => (
                                    <div key={log.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900">
                                        <div>
                                            <p className="text-sm font-medium text-white">{new Date(log.log_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {log.routine_completed === 'fully' && <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Routine Done</span>}
                                                {log.routine_completed === 'partially' && <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Partial</span>}
                                                {log.routine_completed === 'skipped' && <span className="text-[10px] uppercase font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Skipped</span>}
                                                {!log.routine_completed && <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">No Log</span>}
                                            </div>
                                        </div>
                                        {(log.post_performance ?? log.pre_confidence_level) != null && (
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500">{log.post_performance != null ? 'Rating' : 'Confidence'}</p>
                                                <p className="text-sm font-bold text-white">{log.post_performance ?? log.pre_confidence_level}/10</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center bg-slate-900/40">
                                <p className="text-slate-400 text-sm mb-3">No games logged yet for <span className="text-white font-medium">{selectedSport}</span></p>
                                <Button size="sm" className={`bg-gradient-to-r ${theme.from} ${theme.to} text-white`} onClick={() => router.push(`/log/pre?sport=${encodeURIComponent(selectedSport)}`)}>
                                    <Brain className="h-4 w-4 mr-1" /> Log Pre-Game
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingRoutineId} onOpenChange={(open) => !open && !isDeleting && setDeletingRoutineId(null)}>
                <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            This action cannot be undone. This will permanently delete your pre-game mental routine.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting} className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); handleDeleteRoutine(); }}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? "Deleting..." : "Delete Routine"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
