"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Brain, Plus, Trash2, Calendar, ChevronRight, ChevronLeft, Edit3, CheckCircle2, AlertCircle, Play
} from "lucide-react";
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
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
    game_name: string;
    reminder_offset_mins: number;
    created_at?: string;
}

export interface SportOverviewProps {
    displayName: string;
    selectedSport: string;
    routines: Routine[];
    gameLogs: GameLog[];
    upcomingGames: UpcomingGame[];
    pastGames?: UpcomingGame[];
    onSelectGame?: (id: string) => void;
}

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

export default function SportOverview({ displayName, selectedSport, routines, gameLogs, upcomingGames, pastGames = [], onSelectGame }: SportOverviewProps) {
    const router = useRouter();

    const [deletingRoutineId, setDeletingRoutineId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [settingActiveId, setSettingActiveId] = useState<string | null>(null);
    const [pendingPostLogId, setPendingPostLogId] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);

    const filteredRoutines = routines.filter(r => r.sport === selectedSport);
    const sportLogs = gameLogs.filter(l => l.sport === selectedSport).sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
    const activeRoutine = filteredRoutines.find((r) => r.is_active);
    const sportGames = upcomingGames.filter(g => g.sport === selectedSport);

    // Combine past games and recent logs to form the recent games list
    const combinedPastGames = [...pastGames].filter(g => g.sport === selectedSport).sort((a, b) => new Date(`${b.game_date}T${b.game_time}`).getTime() - new Date(`${a.game_date}T${a.game_time}`).getTime());

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

    // Graph Data
    const graphData = [...sportLogs].reverse().slice(-10).map(log => {
        const d = new Date(log.log_date);
        return {
            date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            confidence: log.pre_confidence_level || null,
            performance: log.post_performance || null,
        };
    });

    // Analytics Stats
    const gamesPlayed = sportLogs.length;
    const avgConf = sportLogs.filter(l => l.pre_confidence_level != null).length > 0
        ? (sportLogs.reduce((acc, l) => acc + (l.pre_confidence_level || 0), 0) / sportLogs.filter(l => l.pre_confidence_level != null).length).toFixed(1)
        : '-';

    const completedCount = sportLogs.filter(l => l.routine_completed === 'fully' || l.routine_completed === 'partially').length;
    const adherence = sportLogs.length > 0 ? Math.round((completedCount / sportLogs.length) * 100) : 0;

    // To-Do Logic
    const todayStr = new Date().toISOString().split('T')[0];
    const gamesToday = sportGames.filter(g => g.game_date === todayStr);

    const handleDeleteRoutine = async () => {
        if (!deletingRoutineId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/routines/${deletingRoutineId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete routine");
            toast.success("Routine deleted.");
            router.refresh();
        } catch {
            toast.error("Failed to delete routine.");
        } finally {
            setIsDeleting(false);
            setDeletingRoutineId(null);
        }
    };

    const handleSetActive = async (id: string) => {
        setSettingActiveId(id);
        try {
            const res = await fetch(`/api/routines/${id}/active`, { method: 'PATCH' });
            if (!res.ok) throw new Error("Failed");
            toast.success("Routine updated.");
            router.refresh();
        } catch {
            toast.error("Failed to set active routine.");
        } finally {
            setSettingActiveId(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <p className="text-sm text-slate-400">Welcome back,</p>
                <h1 className="text-2xl font-bold text-white tracking-tight">{displayName} 👋</h1>
            </div>

            {/* TOP SECTION: Analytics & To-Do */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left side: Analytics */}
                <div className="xl:col-span-2 space-y-6">
                    <h2 className="text-lg font-semibold text-white">Performance Analytics</h2>

                    <div className="grid grid-cols-3 gap-4">
                        <Card className="bg-slate-900 border-slate-800">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Played</p>
                                <p className="text-3xl font-bold text-white">{gamesPlayed}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900 border-slate-800">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Avg Confidence</p>
                                <p className="text-3xl font-bold text-white flex items-baseline gap-1">
                                    {avgConf} <span className="text-sm text-slate-500 font-normal">/10</span>
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900 border-slate-800 relative overflow-hidden">
                            <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${theme.from} ${theme.to}`} style={{ width: `${adherence}%` }} />
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Adherence</p>
                                <p className="text-3xl font-bold text-white">{adherence}%</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-300">Trend (Last 10 Games)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[220px] w-full">
                                {graphData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                                                itemStyle={{ fontSize: '13px' }}
                                                labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '12px' }}
                                            />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                            <Line type="monotone" name="Confidence" dataKey="confidence" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 6 }} connectNulls />
                                            <Line type="monotone" name="Performance" dataKey="performance" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 6 }} connectNulls />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                                        Not enough data yet. Log games to see trends.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right side: To-Do */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                            Action Items
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {pendingPostLogId && (
                            <Card className="bg-amber-500/10 border-amber-500/30">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-amber-100">Pending Post-Game Log</p>
                                            <p className="text-xs text-amber-200/70 mt-1 mb-3">Reflect on your recent performance.</p>
                                            <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold" onClick={() => router.push(`/post-game/${pendingPostLogId}`)}>
                                                Complete Now
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {gamesToday.map(game => (
                            <Card key={game.id} className="bg-indigo-500/10 border-indigo-500/30">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                                        <div className="w-full">
                                            <p className="text-sm font-medium text-white">Game Today: {game.game_name}</p>
                                            <p className="text-xs text-indigo-200/70 mt-1 mb-3">at {game.game_time.substring(0, 5)}</p>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="flex-1 bg-slate-900 border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/20 hover:text-white" onClick={() => router.push(`/log/pre?sport=${encodeURIComponent(selectedSport)}`)}>
                                                    Pre-Game Log
                                                </Button>
                                                {activeRoutine && (
                                                    <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white" onClick={() => router.push(`/routine/execute/${activeRoutine.id}`)}>
                                                        Routine <Play className="h-3 w-3 ml-1 fill-current" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {!activeRoutine && (
                            <Card className="bg-slate-900 border-slate-800 border-dashed">
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <Brain className="h-8 w-8 text-slate-500 mb-2" />
                                    <p className="text-sm font-medium text-white">No Active Routine</p>
                                    <p className="text-xs text-slate-400 mt-1 mb-4">Build a routine to prep for games.</p>
                                    <Button size="sm" variant="secondary" className="w-full" onClick={() => { setShowTemplateLibrary(false); setIsCreateDialogOpen(true); }}>
                                        <Plus className="h-4 w-4 mr-1" /> Create Routine
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {!pendingPostLogId && gamesToday.length === 0 && activeRoutine && (
                            <div className="text-center p-6 border border-slate-800 rounded-xl bg-slate-900/50">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                                <p className="text-sm text-slate-400">You&apos;re all caught up!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION: Routines & Recent Games */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-6 border-t border-slate-800/50">

                {/* Routines Manager */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Routine Manager</h2>
                        {activeRoutine && (
                            <Button size="sm" variant="outline" className="border-slate-800 hover:bg-slate-800 text-slate-300 h-8" onClick={() => { setShowTemplateLibrary(false); setIsCreateDialogOpen(true); }}>
                                <Plus className="h-4 w-4 mr-1" /> Create Routine
                            </Button>
                        )}
                    </div>

                    {/* Active Routine Preview */}
                    {activeRoutine ? (
                        <Card className="border-slate-800 bg-slate-900">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base text-white flex items-center gap-2">
                                        Active Routine
                                        <span className={`px-2 py-0.5 rounded-full ${theme.light} text-[10px] font-bold ${theme.text} uppercase tracking-wider border ${theme.border}`}>
                                            Active
                                        </span>
                                    </CardTitle>
                                </div>
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white h-8 px-2" onClick={() => router.push(`/routine/builder?sport=${encodeURIComponent(selectedSport)}`)}>
                                    <Edit3 className="h-4 w-4 mr-1" /> Edit
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium text-slate-200 mb-3">{activeRoutine.name}</p>
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
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center bg-slate-900/40">
                            <p className="text-slate-400 text-sm mb-3">No active routine for <span className="text-white font-medium">{selectedSport}</span></p>
                            <Button size="sm" className={`bg-gradient-to-r ${theme.from} ${theme.to} text-white`} onClick={() => { setShowTemplateLibrary(false); setIsCreateDialogOpen(true); }}>
                                <Plus className="h-4 w-4 mr-1" /> Build Routine
                            </Button>
                        </div>
                    )}

                    {/* Routines List */}
                    {filteredRoutines.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-slate-300">Other Routines ({filteredRoutines.length})</h3>
                            <div className="space-y-2">
                                {filteredRoutines.filter(r => !r.is_active).map((routine) => (
                                    <Card key={routine.id} className="border-slate-800/60 bg-slate-900/50 hover:bg-slate-800/60 transition-all cursor-pointer group" onClick={() => router.push(`/routine/execute/${routine.id}`)}>
                                        <CardContent className="p-3 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm text-slate-200">{routine.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{routine.routine_steps?.length || 0} steps</p>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="secondary" size="sm"
                                                    className={`bg-slate-800 hover:bg-slate-700 text-xs h-7`}
                                                    disabled={settingActiveId === routine.id}
                                                    onClick={(e) => { e.stopPropagation(); handleSetActive(routine.id); }}
                                                >
                                                    {settingActiveId === routine.id ? "Setting..." : "Set Active"}
                                                </Button>
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-7 w-7 rounded-full"
                                                    onClick={(e) => { e.stopPropagation(); setDeletingRoutineId(routine.id); }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Games */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Recent Games</h2>
                        <Button variant="link" className="text-indigo-400 p-0 h-auto text-sm" onClick={() => router.push(`/history?sport=${encodeURIComponent(selectedSport)}`)}>
                            View All
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {combinedPastGames.length > 0 ? (
                            combinedPastGames.slice(0, 5).map(game => {
                                const log = sportLogs.find(l => {
                                    return l.log_date === game.game_date;
                                });
                                return (
                                    <div
                                        key={game.id}
                                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800/80 transition-colors cursor-pointer group"
                                        onClick={() => onSelectGame && onSelectGame(game.id)}
                                    >
                                        <div className="flex gap-3 items-center">
                                            <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{game.game_name}</p>
                                                <div className="flex gap-2 items-center mt-0.5">
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(game.game_date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                    {log && (
                                                        <>
                                                            <span className="text-slate-600 text-[10px]">•</span>
                                                            <span className="text-xs font-medium text-emerald-400">Logged</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
                                    </div>
                                );
                            })
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center bg-slate-900/40">
                                <p className="text-slate-400 text-sm mb-3">No recent games found.</p>
                                <Button size="sm" variant="outline" className="border-slate-700" onClick={() => router.push(`/games/new?sport=${encodeURIComponent(selectedSport)}`)}>
                                    Schedule Game
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingRoutineId} onOpenChange={(open) => !open && !isDeleting && setDeletingRoutineId(null)}>
                <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Routine?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            This cannot be undone. Are you sure?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting} className="bg-slate-800 text-white border-slate-700">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeleteRoutine(); }} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Create Routine Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                if (!open) setShowTemplateLibrary(false);
                setIsCreateDialogOpen(open);
            }}>
                <DialogContent className={`bg-slate-900 border-slate-800 text-white transition-all duration-300 ${showTemplateLibrary ? 'max-w-4xl' : 'sm:max-w-md'}`}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {showTemplateLibrary && (
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-800 -ml-2" onClick={() => setShowTemplateLibrary(false)}>
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                            )}
                            {showTemplateLibrary ? "Template Library" : "Create Routine"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {showTemplateLibrary ? "Browse and use pre-built mental routines." : `Choose how you want to start building your mental routine for ${selectedSport}.`}
                        </DialogDescription>
                    </DialogHeader>

                    {showTemplateLibrary ? (
                        <div className="pt-2 max-h-[70vh] overflow-y-auto pr-2">
                            <RoutineLibrary
                                currentRoutinesCount={filteredRoutines.length}
                                userRoutineTitles={filteredRoutines.map(r => r.name)}
                                selectedSport={selectedSport}
                                isDialog={true}
                                onClose={() => setIsCreateDialogOpen(false)}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 py-6">
                            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group" onClick={() => router.push(`/routine/builder?sport=${encodeURIComponent(selectedSport)}`)}>
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="bg-slate-900 p-3 rounded-full group-hover:bg-indigo-500/10 transition-colors">
                                        <Plus className="h-6 w-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-lg">Build from Scratch</h3>
                                        <p className="text-sm text-slate-400">Create a completely custom routine step-by-step.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group" onClick={() => setShowTemplateLibrary(true)}>
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="bg-slate-900 p-3 rounded-full group-hover:bg-indigo-500/10 transition-colors">
                                        <Brain className="h-6 w-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-lg">Use Template</h3>
                                        <p className="text-sm text-slate-400">Start with a pre-built routine for {selectedSport}.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
