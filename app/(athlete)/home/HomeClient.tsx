"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Brain,
    Play,
    Plus,
    Lock,
    LogOut,
    Clock,
    Trash2,
    Settings,
    CheckCircle2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoutineLibrary } from "@/components/routine/RoutineLibrary";
import { SharedTemplateNotifications } from "@/components/routine/SharedTemplateNotifications";
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
import { useState } from "react";
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
    routine_steps: RoutineStep[];
}

interface SharedTemplateNotification {
    id: string;
    coach: {
        display_name: string;
    };
    template: {
        id: string;
        name: string;
        time_tier: string;
        coach_note: string;
        steps: {
            id: string;
            technique: {
                name: string;
                duration_minutes: number;
            };
        }[];
    };
}

interface HomeClientProps {
    displayName: string;
    routines: Routine[];
    sport: string;
    notifications: SharedTemplateNotification[];
}

export default function HomeClient({ displayName, routines, sport, notifications }: HomeClientProps) {
    const router = useRouter();
    const [deletingRoutineId, setDeletingRoutineId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isActivating, setIsActivating] = useState<string | null>(null);

    const handleActivateRoutine = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setIsActivating(id);
        try {
            const res = await fetch(`/api/routines/${id}/activate`, {
                method: 'POST'
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error?.message || "Failed to activate routine");

            toast.success("Routine activated successfully!");
            router.refresh();
        } catch (err: unknown) {
            toast.error("Failed to activate", { description: err instanceof Error ? err.message : "Unknown error" });
        } finally {
            setIsActivating(null);
        }
    };

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

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    const activeRoutine = routines.find((r) => r.is_active);
    const totalTime = activeRoutine
        ? activeRoutine.routine_steps.reduce((sum, s) => sum + (s.techniques?.duration_minutes || 0), 0)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
            {/* Header */}
            <header className="p-4 flex items-center justify-between border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                        <Brain className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-white text-lg">MindGame</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/settings")}
                        className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                        data-testid="settings-button"
                    >
                        <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                        data-testid="logout-button"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </header>

            <main className="p-4 max-w-lg mx-auto space-y-6">
                {/* Welcome Section */}
                <div className="pt-4">
                    <h1 className="text-2xl font-bold text-white">
                        Welcome back, {displayName} 👋
                    </h1>
                    <p className="text-slate-400 mt-1">
                        {sport ? `Ready to dominate your next ${sport} game?` : "Ready to build your mental game?"}
                    </p>
                </div>

                {/* Shared Template Notifications */}
                <SharedTemplateNotifications notifications={notifications} />

                {/* Active Routine Card */}
                {activeRoutine ? (
                    <Card className="border-slate-800 bg-gradient-to-br from-slate-900/90 to-indigo-950/50 backdrop-blur-sm overflow-hidden shadow-xl" data-testid="active-routine">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-1">Active Routine</p>
                                    <h2 className="text-xl font-bold text-white">{activeRoutine.name}</h2>
                                </div>
                                <div className="flex items-center gap-1 text-slate-400">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm">{totalTime} min</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mb-4 text-sm text-slate-400">
                                <span>{activeRoutine.routine_steps.length} steps</span>
                                <span>•</span>
                                <span className="capitalize">{activeRoutine.source === "recommended" ? "Personalized for you" : "Custom"}</span>
                            </div>
                            <Button
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-indigo-500/25 h-12"
                                data-testid="start-routine"
                                onClick={() => router.push(`/routine/execute/${activeRoutine.id}`)}
                            >
                                <Play className="h-5 w-5 mr-2" />
                                Start Routine
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-sm border-dashed" data-testid="no-routine">
                        <CardContent className="p-8 text-center">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                                <Plus className="h-6 w-6 text-slate-500" />
                            </div>
                            <h3 className="font-semibold text-white mb-2">No Routine Yet</h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Build your first pre-game mental routine
                            </p>
                            <Button
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"
                                data-testid="build-routine"
                                onClick={() => router.push("/routine/builder")}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Build Routine
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <Tabs defaultValue="my-routines" className="w-full space-y-6">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-slate-800 p-1">
                        <TabsTrigger value="my-routines" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-slate-400 transition-all">
                            My Routines
                        </TabsTrigger>
                        <TabsTrigger value="library" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-slate-400 transition-all">
                            Template Library
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="my-routines" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
                        {/* Saved Routines */}
                        {routines.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-white">Your Routines</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400">{routines.length}/5 Saved</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {routines.map((routine) => (
                                        <Card
                                            key={routine.id}
                                            className="border-white/5 bg-slate-900/40 backdrop-blur-md hover:bg-slate-800/60 hover:border-white/10 transition-all cursor-pointer shadow-sm group"
                                            onClick={() => router.push(`/routine/execute/${routine.id}`)}
                                        >
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">{routine.name}</p>
                                                        {routine.is_active ? (
                                                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20 h-8 rounded-full px-3"
                                                                onClick={(e) => handleActivateRoutine(routine.id, e)}
                                                                disabled={isActivating === routine.id}
                                                            >
                                                                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                                                {isActivating === routine.id ? '...' : 'Activate'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {routine.routine_steps?.length || 0} steps • {routine.source === "recommended" ? "Personalized" : "Custom"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                            variant="ghost"
                                                        size="icon"
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 rounded-full"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeletingRoutineId(routine.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white hover:bg-slate-800 h-8 w-8 rounded-full">
                                                        <Play className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-white">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Card
                                    className="border-slate-800 bg-slate-900/60 backdrop-blur-sm hover:bg-slate-900/80 transition-all cursor-pointer"
                                    onClick={() => router.push("/routine/builder")}
                                >
                                    <CardContent className="p-4 text-center">
                                        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                            <Plus className="h-5 w-5 text-indigo-400" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-300">Routine Builder</p>
                                    </CardContent>
                                </Card>
                                <Card
                                    className="border-slate-800 bg-slate-900/60 backdrop-blur-sm hover:bg-slate-900/80 transition-all cursor-pointer"
                                    onClick={() => router.push("/log/pre")}
                                >
                                    <CardContent className="p-4 text-center">
                                        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                            <Brain className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-300">Pre-Game Log</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="library" className="focus-visible:outline-none focus-visible:ring-0">
                        <RoutineLibrary
                            currentRoutinesCount={routines.length}
                            userRoutineTitles={routines.map(r => r.name)}
                        />
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
                            onClick={(e) => {
                                e.preventDefault();
                                handleDeleteRoutine();
                            }}
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
