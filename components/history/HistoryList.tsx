"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, ArrowLeft, Search, Calendar, ChevronRight, CheckCircle2, XCircle, MinusCircle } from "lucide-react";

interface GameLog {
    id: string;
    log_date: string;
    sport: string;
    routine_completed: "yes" | "partial" | "no";
    pre_anxiety_level: number;
    pre_confidence_level: number;
    pre_notes: string | null;
    post_performance: number | null;
    pre_logged_at?: string;
}

interface HistoryListProps {
    initialLogs: GameLog[];
}

export function HistoryList({ initialLogs }: HistoryListProps) {
    const router = useRouter();
    const [logs] = useState<GameLog[]>(initialLogs);
    const [filterCompleted, setFilterCompleted] = useState<string>("all");
    const [searchDate, setSearchDate] = useState("");

    // Filtering logic
    const filteredLogs = logs.filter(log => {
        const matchCompleted = filterCompleted === "all" || log.routine_completed === filterCompleted;
        const matchDate = !searchDate || log.log_date.includes(searchDate);
        return matchCompleted && matchDate;
    }).sort((a, b) => {
        const dateA = new Date(a.pre_logged_at || a.log_date).getTime();
        const dateB = new Date(b.pre_logged_at || b.log_date).getTime();
        return dateB - dateA;
    });

    const getCompletionIcon = (status: string) => {
        switch (status) {
            case "yes": return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
            case "partial": return <MinusCircle className="h-4 w-4 text-amber-400" />;
            case "no": return <XCircle className="h-4 w-4 text-red-400" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 px-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/home")}
                    className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Routine History</h1>
                    <p className="text-sm text-slate-400">Review your past performances and mental states</p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                        type="date"
                        placeholder="Search by date..."
                        className="pl-9 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                    />
                </div>
                <Select value={filterCompleted} onValueChange={setFilterCompleted}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-800 text-white">
                        <SelectValue placeholder="Filter by routine" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="all">All Entries</SelectItem>
                        <SelectItem value="yes">Routine Completed</SelectItem>
                        <SelectItem value="partial">Routine Partial</SelectItem>
                        <SelectItem value="no">Routine Skipped</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredLogs.length === 0 ? (
                    <Card className="border-slate-800 bg-slate-900/40 border-dashed">
                        <CardContent className="p-8 text-center flex flex-col items-center">
                            <Calendar className="h-10 w-10 text-slate-600 mb-3" />
                            <p className="text-slate-300 font-medium">No history found</p>
                            <p className="text-sm text-slate-500">
                                {logs.length === 0 ? "You haven't recorded any entries yet." : "Try adjusting your filters."}
                            </p>
                            {logs.length === 0 && (
                                <Button
                                    className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white"
                                    onClick={() => router.push("/log/pre")}
                                >
                                    Record Pre-Game Log
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    filteredLogs.map(log => (
                        <Card
                            key={log.id}
                            className="border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition-colors cursor-pointer group"
                            onClick={() => router.push(`/history/${log.id}`)}
                        >
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-white font-medium">
                                            {format(parseISO(log.pre_logged_at || log.log_date), "MMM d, yyyy")}
                                        </h3>
                                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/10">
                                            {log.sport}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                        <div className="flex items-center gap-1 text-slate-300">
                                            {log.pre_logged_at && format(parseISO(log.pre_logged_at), "h:mm a")}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Brain className="h-3 w-3" />
                                            Anxiety: {log.pre_anxiety_level}/5
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {getCompletionIcon(log.routine_completed)}
                                            <span className="capitalize">{log.routine_completed}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {log.post_performance ? (
                                        <div className="text-right">
                                            <div className="text-xs text-slate-500">Performance</div>
                                            <div className="text-sm font-bold text-white">{log.post_performance}/10</div>
                                        </div>
                                    ) : (
                                        <div className="text-right">
                                            <Badge variant="secondary" className="bg-slate-800 text-slate-400">Pending Post</Badge>
                                        </div>
                                    )}
                                    <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
