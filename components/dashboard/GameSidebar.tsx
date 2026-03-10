"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Calendar, Clock, ChevronRight, Trophy, CheckCircle2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface UpcomingGame {
    id: string;
    sport: string;
    game_name: string;
    game_date: string;
    game_time: string;
    reminder_offset_mins: number;
    created_at?: string;
}

export interface GameSidebarProps {
    upcomingGames: UpcomingGame[];
    pastGames: UpcomingGame[];
    selectedGameId: string | null;
    onSelectGame: Dispatch<SetStateAction<string | null>>;
    selectedSport: string;
}

export default function GameSidebar({ upcomingGames, pastGames, selectedGameId, onSelectGame, selectedSport }: GameSidebarProps) {
    const router = useRouter();

    const formatDateLabel = (dateStr: string) => {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const tmrw = new Date(now);
        tmrw.setDate(tmrw.getDate() + 1);
        const tmrwStr = `${tmrw.getFullYear()}-${String(tmrw.getMonth() + 1).padStart(2, '0')}-${String(tmrw.getDate()).padStart(2, '0')}`;

        if (dateStr === todayStr) return 'Today';
        if (dateStr === tmrwStr) return 'Tomorrow';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' });
    };

    const isGameDay = (dateStr: string) => {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        return dateStr === todayStr;
    };

    return (
        <aside className="w-72 h-[calc(100vh-65px)] sticky top-[65px] border-r border-slate-800/60 bg-slate-950 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-800/40">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Games</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 h-7 px-2 text-xs font-medium"
                        onClick={() => router.push(`/games/new?sport=${encodeURIComponent(selectedSport)}`)}
                    >
                        <CalendarPlus className="h-3.5 w-3.5 mr-1" />
                        Schedule
                    </Button>
                </div>
                {/* Sport Overview button */}
                <button
                    onClick={() => onSelectGame(null)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${selectedGameId === null
                        ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                >
                    <Trophy className="h-4 w-4" />
                    Sport Overview
                </button>
            </div>

            {/* Game Lists */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {/* Upcoming Games */}
                {upcomingGames.length > 0 && (
                    <div className="p-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Upcoming</p>
                        <div className="space-y-1">
                            {upcomingGames.map((game) => {
                                const dateLabel = formatDateLabel(game.game_date);
                                const isToday = isGameDay(game.game_date);
                                const isSelected = selectedGameId === game.id;

                                return (
                                    <button
                                        key={game.id}
                                        onClick={() => onSelectGame(game.id)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${isSelected
                                            ? 'bg-indigo-500/15 text-white border border-indigo-500/30'
                                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                                            }`}
                                    >
                                        <div className={`p-1.5 rounded-md ${isToday ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                                            <Calendar className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-semibold truncate ${isToday ? 'text-amber-400' : ''}`}>
                                                {game.game_name}
                                            </p>
                                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 mt-0.5">
                                                <Calendar className="h-3 w-3" /> {dateLabel} • <Clock className="h-3 w-3" /> {game.game_time.substring(0, 5)}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <ChevronRight className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Past Games */}
                {pastGames.length > 0 && (
                    <div className="p-3 pt-0">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Past</p>
                        <div className="space-y-1">
                            {pastGames.slice(0, 5).map((game) => {
                                const dateLabel = formatDateLabel(game.game_date);
                                const isSelected = selectedGameId === game.id;

                                return (
                                    <button
                                        key={game.id}
                                        onClick={() => onSelectGame(game.id)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${isSelected
                                            ? 'bg-indigo-500/15 text-white border border-indigo-500/30'
                                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-300'
                                            }`}
                                    >
                                        <div className="p-1.5 rounded-md bg-slate-800/50 text-slate-600">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate text-slate-400">
                                                {game.game_name}
                                            </p>
                                            <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                                                <Calendar className="h-3 w-3" /> {dateLabel} • <Clock className="h-3 w-3" /> {game.game_time.substring(0, 5)}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                            {pastGames.length > 5 && (
                                <p className="text-[11px] text-center text-slate-600 py-1">
                                    +{pastGames.length - 5} more
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {upcomingGames.length === 0 && pastGames.length === 0 && (
                    <div className="p-6 flex flex-col items-center text-center">
                        <div className="p-3 rounded-xl bg-slate-800/50 mb-3">
                            <Calendar className="h-6 w-6 text-slate-600" />
                        </div>
                        <p className="text-sm text-slate-500 mb-3">No games yet</p>
                        <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                            onClick={() => router.push(`/games/new?sport=${encodeURIComponent(selectedSport)}`)}
                        >
                            <CalendarPlus className="h-3.5 w-3.5 mr-1" />
                            Schedule Game
                        </Button>
                    </div>
                )}
            </div>
        </aside>
    );
}
