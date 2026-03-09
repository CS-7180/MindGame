"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import GameSidebar from '@/components/dashboard/GameSidebar';
import SportOverview from '@/components/dashboard/SportOverview';
import GameDetail from '@/components/dashboard/GameDetail';
import {
    Brain,
    Plus,
    Settings,
    LogOut,
    Lock,
    CalendarPlus,
    Trophy,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SharedTemplateNotification } from "@/components/routine/SharedTemplateNotifications";
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



const getEmoji = (sport: string) => SPORT_EMOJIS[sport?.toLowerCase()] || "🏆";

interface UpcomingGame {
    id: string;
    sport: string;
    game_name: string;
    game_date: string;
    game_time: string;
    reminder_offset_mins: number;
    created_at?: string;
}

interface Technique {
    id: string;
    name: string;
    category: string;
    duration_minutes: number;
    instruction: string;
    slug: string;
    created_at: string | null;
}

interface HomeClientProps {
    displayName: string;
    routines: Routine[];
    sports: string[];
    defaultSport: string;
    gameLogs: GameLog[];
    upcomingGames: UpcomingGame[];
    pastGames: UpcomingGame[];
    techniques: Technique[];
    notifications: SharedTemplateNotification[];
}

export default function HomeClient({ displayName, routines, sports: initialSports, defaultSport, gameLogs, upcomingGames, pastGames, techniques, notifications }: HomeClientProps) {
    const router = useRouter();

    // Core root state
    const [selectedSport, setSelectedSport] = useState<string>(defaultSport);
    const [sports, setSports] = useState<string[]>(initialSports);

    // Two-panel architecture state
    const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

    // Modals
    const [showAddSport, setShowAddSport] = useState(false);
    const [customSportInput, setCustomSportInput] = useState("");
    const [addingSport, setAddingSport] = useState(false);

    const handleSportChange = (newSport: string) => {
        setSelectedSport(newSport);
        setSelectedGameId(null); // Reset game view on sport change
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

            const newSports = Array.from(new Set([...sports, sportName.trim()]));
            setSports(newSports);
            setShowAddSport(false);
            setCustomSportInput("");
            handleSportChange(sportName.trim());
            toast.success("Sport added!");
        } catch (error: Error | unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to add sport.");
        } finally {
            setAddingSport(false);
        }
    };

    // Derive data for the selected sport
    const sportUpcomingGames = upcomingGames.filter(g => g.sport === selectedSport);
    const sportPastGames = pastGames.filter(g => g.sport === selectedSport);

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
                        <Button variant="ghost" size="icon" onClick={async () => {
                            const supabase = createClient();
                            await supabase.auth.signOut();
                            router.push("/login");
                            router.refresh();
                        }} className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full" data-testid="logout-button">
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
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-50 selection:bg-indigo-500/30 overflow-hidden">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                        <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">MindGame</h1>
                        <p className="text-xs text-slate-400 font-medium tracking-wide">Athlete Portal</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    {sports.map(s => (
                        <Button
                            key={s}
                            variant="ghost"
                            onClick={() => handleSportChange(s)}
                            className={`rounded-full px-4 font-medium transition-all ${selectedSport === s
                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(79,70,229,0.1)]"
                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                                }`}
                        >
                            <span className="mr-2 text-base">{getEmoji(s)}</span>
                            {s}
                        </Button>
                    ))}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowAddSport(true)}
                        className="rounded-full text-slate-400 hover:text-white hover:bg-slate-800 focus:ring-1 focus:ring-indigo-500"
                        title="Add Sport"
                    >
                        <Plus className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/settings")}
                        className="rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Settings"
                    >
                        <Settings className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                            const supabase = createClient();
                            await supabase.auth.signOut();
                            router.push("/login");
                            router.refresh();
                        }}
                        className="rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Log Out"
                    >
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: Game Sidebar (hidden on small screens, can implement a mobile drawer later) */}
                <div className="hidden md:block">
                    <GameSidebar
                        upcomingGames={sportUpcomingGames}
                        pastGames={sportPastGames}
                        selectedGameId={selectedGameId}
                        onSelectGame={setSelectedGameId}
                        selectedSport={selectedSport}
                    />
                </div>

                {/* Right Panel: Dynamic Content */}
                <main className="flex-1 overflow-y-auto w-full bg-slate-950">
                    {/* Mobile Game Picker (visible on small screens only) */}
                    <div className="md:hidden border-b border-slate-800/60 bg-slate-900/50 p-3">
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                            <button
                                onClick={() => setSelectedGameId(null)}
                                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedGameId === null
                                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                                    : 'text-slate-400 bg-slate-800 hover:text-white'
                                    }`}
                            >
                                Overview
                            </button>
                            {sportUpcomingGames.slice(0, 5).map((game) => {
                                const _now = new Date();
                                const isToday = game.game_date === `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`;
                                return (
                                    <button
                                        key={game.id}
                                        onClick={() => setSelectedGameId(game.id)}
                                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedGameId === game.id
                                            ? 'bg-indigo-500/15 text-white border border-indigo-500/30'
                                            : isToday
                                                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                                                : 'text-slate-400 bg-slate-800 hover:text-white'
                                            }`}
                                    >
                                        <span className="font-semibold">{game.game_name.length > 15 ? game.game_name.substring(0, 15) + '...' : game.game_name}</span> · {game.game_time.substring(0, 5)}
                                    </button>
                                );
                            })}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="shrink-0 text-indigo-400 hover:text-indigo-300 text-xs h-7 px-2"
                                onClick={() => router.push(`/games/new?sport=${encodeURIComponent(selectedSport)}`)}
                            >
                                <CalendarPlus className="h-3 w-3 mr-1" /> Schedule
                            </Button>
                        </div>
                    </div>

                    <div className="max-w-5xl mx-auto p-4 md:p-8">
                        {selectedGameId ? (
                            <GameDetail
                                gameId={selectedGameId}
                                sport={selectedSport}
                                upcomingGames={sportUpcomingGames}
                                pastGames={sportPastGames}
                                routines={routines}
                                gameLogs={gameLogs}
                                onBack={() => setSelectedGameId(null)}
                            />
                        ) : (
                            <SportOverview
                                displayName={displayName}
                                selectedSport={selectedSport}
                                routines={routines}
                                gameLogs={gameLogs}
                                upcomingGames={sportUpcomingGames}
                                pastGames={sportPastGames}
                                techniques={techniques}
                                notifications={notifications}
                                onSelectGame={setSelectedGameId}
                            />
                        )}
                    </div>

                    {/* Privacy Footer */}
                    <footer className="flex items-center justify-center gap-2 text-xs text-slate-600 pb-8 mt-12" data-testid="privacy-footer">
                        <Lock className="h-3 w-3" />
                        <span>All your data is private — only visible to you</span>
                    </footer>
                </main>
            </div>

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
