"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"
import {
    Brain,
    Play,
    Plus,
    Settings,
    LogOut,
    Trash2,
    Lock,
    Activity,
    Calendar,
    CalendarPlus,
    ChevronRight,
    Target,
    Trophy,
    Edit3,
    TrendingUp,
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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

const SPORT_EMOJIS: Record<string, string> = {
    soccer: "⚽", basketball: "🏀", tennis: "🎾", baseball: "⚾",
    football: "🏈", track: "🏃", swimming: "🏊", volleyball: "🏐",
    golf: "⛳", hockey: "🏒", cricket: "🏏", rugby: "🏉",
};

const PRESET_SPORTS = ["Soccer", "Basketball", "Tennis", "Baseball", "Football", "Track"];

const getTheme = (sport: string) => {
    const s = sport?.toLowerCase() || '';
    if (s === 'soccer') return { text: 'text-emerald-400', bg: 'bg-emerald-500', from: 'from-emerald-500', to: 'to-emerald-700', border: 'border-emerald-500/50', light: 'bg-emerald-500/10', ring: 'ring-emerald-500/40' };
    if (s === 'basketball') return { text: 'text-orange-400', bg: 'bg-orange-500', from: 'from-orange-500', to: 'to-orange-700', border: 'border-orange-500/50', light: 'bg-orange-500/10', ring: 'ring-orange-500/40' };
    if (s === 'tennis') return { text: 'text-yellow-400', bg: 'bg-yellow-500', from: 'from-yellow-400', to: 'to-yellow-600', border: 'border-yellow-500/50', light: 'bg-yellow-500/10', ring: 'ring-yellow-500/40' };
    if (s === 'baseball') return { text: 'text-blue-400', bg: 'bg-blue-500', from: 'from-blue-500', to: 'to-blue-700', border: 'border-blue-500/50', light: 'bg-blue-500/10', ring: 'ring-blue-500/40' };
    if (s === 'football') return { text: 'text-red-400', bg: 'bg-red-500', from: 'from-red-500', to: 'to-red-700', border: 'border-red-500/50', light: 'bg-red-500/10', ring: 'ring-red-500/40' };
    if (s === 'track') return { text: 'text-cyan-400', bg: 'bg-cyan-500', from: 'from-cyan-500', to: 'to-cyan-700', border: 'border-cyan-500/50', light: 'bg-cyan-500/10', ring: 'ring-cyan-500/40' };
    return { text: 'text-indigo-400', bg: 'bg-indigo-500', from: 'from-indigo-500', to: 'to-purple-600', border: 'border-indigo-500/50', light: 'bg-indigo-500/10', ring: 'ring-indigo-500/40' };
};

const getEmoji = (sport: string) => SPORT_EMOJIS[sport?.toLowerCase()] || "🏆";

interface HomeClientProps {
    displayName: string;
    routines: Routine[];
    sports: string[];
    defaultSport: string;
    gameLogs: GameLog[];
}

export default function HomeClient({ displayName, routines, sports: initialSports, defaultSport, gameLogs }: HomeClientProps) {
    const router = useRouter();
    const [deletingRoutineId, setDeletingRoutineId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [settingActiveId, setSettingActiveId] = useState<string | null>(null);
    const [pendingPostLogId, setPendingPostLogId] = useState<string | null>(null);
    const [selectedSport, setSelectedSport] = useState<string>(defaultSport);
    const [sports, setSports] = useState<string[]>(initialSports);
    const [showAddSport, setShowAddSport] = useState(false);
    const [customSportInput, setCustomSportInput] = useState("");
    const [addingSport, setAddingSport] = useState(false);

    const handleSportChange = (newSport: string) => {
        setSelectedSport(newSport);
        router.replace(`/home?sport=${encodeURIComponent(newSport)}`, { scroll: false });
    };

    const handleAddSport = async (sportName: string) => {
        if (!sportName.trim()) return;
        setAddingSport(true);
        try {
            const res = await fetch("/api/athlete/sports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sport: sportName.trim() }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error?.message || "Failed to add sport");

            const updatedSports: string[] = json.data.sports;
            setSports(updatedSports);
            setSelectedSport(sportName.trim());
            setShowAddSport(false);
            setCustomSportInput("");
            toast.success(`${sportName.trim()} added!`);
            router.replace(`/home?sport=${encodeURIComponent(sportName.trim())}`, { scroll: false });
            router.refresh();
        } catch (err: unknown) {
            toast.error("Failed to add sport", { description: err instanceof Error ? err.message : "Unknown error" });
        } finally {
            setAddingSport(false);
        }
    };

    const filteredRoutines = routines.filter(r => r.sport === selectedSport);
    const sportLogs = gameLogs.filter(l => l.sport === selectedSport).sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
    const lastGame = sportLogs[0] || null;
    const completedCount = sportLogs.filter(l => l.routine_completed === 'fully' || l.routine_completed === 'partially').length;
    const completionRate = sportLogs.length > 0 ? Math.round((completedCount / sportLogs.length) * 100) : 0;
    const theme = getTheme(selectedSport);

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

    const handleDeleteRoutine = async () => {
        if (!deletingRoutineId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/routines/${deletingRoutineId}`, {
                method: 'DELETE'
            });
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
            const res = await fetch(`/api/routines/${routineId}/active`, {
                method: 'PATCH'
            });
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

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    const activeRoutine = filteredRoutines.find((r) => r.is_active);
    const totalTime = activeRoutine
        ? activeRoutine.routine_steps.reduce((sum, s) => sum + (s.techniques?.duration_minutes || 0), 0)
        : 0;

    // ── ZERO-SPORT WELCOME STATE ──
    if (sports.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-slate-200 flex flex-col">
                <header className="p-5 flex items-center justify-between border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                            <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-white text-xl tracking-tight">MindGame</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.push("/settings")} className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full">
                            <Settings className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full" data-testid="logout-button">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                            <Trophy className="h-10 w-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Welcome to MindGame!</h1>
                            <p className="text-slate-400 text-lg">Your mental training hub. Start by adding your first sport.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {PRESET_SPORTS.map((s) => (
                                <Button
                                    key={s}
                                    variant="outline"
                                    className="border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white h-14 text-base font-medium"
                                    disabled={addingSport}
                                    onClick={() => handleAddSport(s)}
                                >
                                    <span className="mr-2 text-lg">{getEmoji(s)}</span>
                                    {s}
                                </Button>
                            ))}
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                            <div className="relative flex justify-center"><span className="px-3 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-sm text-slate-500">or type your own</span></div>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleAddSport(customSportInput); }} className="flex gap-2">
                            <Input
                                placeholder="e.g. Swimming, Golf..."
                                value={customSportInput}
                                onChange={(e) => setCustomSportInput(e.target.value)}
                                className="bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500"
                            />
                            <Button type="submit" disabled={!customSportInput.trim() || addingSport} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                                Add
                            </Button>
                        </form>
                    </div>
                </main>

                <footer className="flex items-center justify-center gap-2 text-xs text-slate-600 pb-8">
                    <Lock className="h-3 w-3" />
                    <span>All your data is private — only visible to you</span>
                </footer>
            </div>
        );
    }

    // ── MAIN DASHBOARD (1+ SPORTS) ──
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-slate-200 pb-10">
            {/* Header */}
            <header className="p-5 flex items-center justify-between border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${theme.from} ${theme.to} shadow-lg shadow-black/20`}>
                        <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-white text-xl tracking-tight">MindGame</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/settings")} className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full" data-testid="settings-button">
                        <Settings className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full" data-testid="logout-button">
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            <main className="p-4 max-w-lg mx-auto space-y-5 mt-2">
                {/* Welcome */}
                <div>
                    <p className="text-sm text-slate-400">Welcome back,</p>
                    <h1 className="text-2xl font-bold text-white tracking-tight">{displayName} 👋</h1>
                </div>

                {/* ── Sport Chip Bar ── */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {sports.map((s) => (
                        <button
                            key={s}
                            onClick={() => handleSportChange(s)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${selectedSport === s
                                ? `${getTheme(s).bg} text-white border-transparent shadow-lg ring-2 ${getTheme(s).ring}`
                                : 'bg-slate-900 text-slate-300 border-slate-700/50 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <span>{getEmoji(s)}</span>
                            {s}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowAddSport(true)}
                        className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 transition-all"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Sport
                    </button>
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
                            {lastGame && (
                                <div className={`px-3 py-1.5 rounded-lg ${theme.light} border ${theme.border} text-center`}>
                                    <p className={`text-xs ${theme.text} font-semibold uppercase tracking-wider`}>Last Game</p>
                                    <p className="text-sm font-bold text-white mt-0.5">Confidence: {lastGame.pre_confidence_level ?? '-'}/10</p>
                                </div>
                            )}
                        </div>
                        {activeRoutine ? (
                            <Button
                                className={`w-full bg-gradient-to-r ${theme.from} ${theme.to} text-white font-bold h-12 shadow-lg hover:opacity-90 transition-opacity`}
                                data-testid="start-routine"
                                onClick={() => router.push(`/routine/execute/${activeRoutine.id}`)}
                            >
                                <Play className="h-5 w-5 mr-2 fill-current" />
                                Start Routine
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
                <Tabs defaultValue="overview" className="w-full">
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
                        {/* Quick Actions */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-white tracking-tight">Quick Actions</h3>
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
                        {/* Recent Games */}
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
            </main>

            {/* Privacy Footer */}
            <footer className="flex items-center justify-center gap-2 text-xs text-slate-600 pb-8" data-testid="privacy-footer">
                <Lock className="h-3 w-3" />
                <span>All your data is private — only visible to you</span>
            </footer>

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

            {/* Add Sport Dialog */}
            <Dialog open={showAddSport} onOpenChange={setShowAddSport}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Add a Sport</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Choose from common sports or type your own.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div className="grid grid-cols-2 gap-2">
                            {PRESET_SPORTS.filter(s => !sports.includes(s)).map((s) => (
                                <Button
                                    key={s}
                                    variant="outline"
                                    className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white h-11"
                                    disabled={addingSport}
                                    onClick={() => handleAddSport(s)}
                                >
                                    <span className="mr-2">{getEmoji(s)}</span>
                                    {s}
                                </Button>
                            ))}
                        </div>
                        {PRESET_SPORTS.filter(s => !sports.includes(s)).length > 0 && (
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                                <div className="relative flex justify-center"><span className="px-3 bg-slate-900 text-sm text-slate-500">or</span></div>
                            </div>
                        )}
                        <form onSubmit={(e) => { e.preventDefault(); handleAddSport(customSportInput); }} className="flex gap-2">
                            <Input
                                placeholder="Type sport name..."
                                value={customSportInput}
                                onChange={(e) => setCustomSportInput(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                            />
                            <Button type="submit" disabled={!customSportInput.trim() || addingSport} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4">
                                Add
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
