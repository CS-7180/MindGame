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
} from "lucide-react";

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

interface HomeClientProps {
    displayName: string;
    routines: Routine[];
    sport: string;
}

export default function HomeClient({ displayName, routines, sport }: HomeClientProps) {
    const router = useRouter();

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
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Build Routine
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm hover:bg-slate-900/80 transition-all cursor-pointer">
                        <CardContent className="p-4 text-center">
                            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <Plus className="h-5 w-5 text-indigo-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-300">Routine Builder</p>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm hover:bg-slate-900/80 transition-all cursor-pointer">
                        <CardContent className="p-4 text-center">
                            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Brain className="h-5 w-5 text-purple-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-300">Pre-Game Log</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Privacy Footer */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-600 pt-4 pb-8" data-testid="privacy-footer">
                    <Lock className="h-3 w-3" />
                    <span>All your data is private — only visible to you</span>
                </div>
            </main>
        </div>
    );
}
