"use client";

import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, CheckCircle2, MinusCircle, XCircle, Activity, Target, NotepadText } from "lucide-react";

interface GameLog {
    id: string;
    log_date: string;
    sport: string;
    routine_completed: "yes" | "partial" | "no";
    pre_anxiety_level: number;
    pre_confidence_level: number;
    pre_notes: string | null;
    pre_logged_at: string | null;
    post_performance: number | null;
    post_mental_state: number | null;
    post_descriptor: string | null;
    post_logged_at: string | null;
}

export function HistoryDetail({ log }: { log: GameLog }) {
    const router = useRouter();

    const getCompletionBadge = (status: string) => {
        switch (status) {
            case "yes":
                return <Badge className="bg-emerald-500/20 text-emerald-300 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
            case "partial":
                return <Badge className="bg-amber-500/20 text-amber-300 border-none"><MinusCircle className="w-3 h-3 mr-1" /> Partial</Badge>;
            case "no":
                return <Badge className="bg-red-500/20 text-red-300 border-none"><XCircle className="w-3 h-3 mr-1" /> Skipped</Badge>;
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
                    onClick={() => router.push("/history")}
                    className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Entry Details</h1>
                    <p className="text-sm text-slate-400">
                        {format(parseISO(log.log_date), "EEEE, MMMM d, yyyy")}
                    </p>
                </div>
            </div>

            {/* Overview Card */}
            <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/10 text-sm px-3 py-1">
                            {log.sport}
                        </Badge>
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-slate-500">Routine Execution</span>
                            {getCompletionBadge(log.routine_completed)}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                            <div className="flex items-center gap-2 mb-2 text-indigo-400">
                                <Activity className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Anxiety</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{log.pre_anxiety_level}<span className="text-slate-500 text-sm font-normal">/5</span></div>
                        </div>
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                            <div className="flex items-center gap-2 mb-2 text-purple-400">
                                <Target className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Confidence</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{log.pre_confidence_level}<span className="text-slate-500 text-sm font-normal">/5</span></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pre-Game Notes */}
            {log.pre_notes && (
                <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
                    <CardHeader className="pb-3 border-b border-slate-800/50">
                        <div className="flex items-center gap-2 text-slate-300">
                            <NotepadText className="w-5 h-5 text-indigo-400" />
                            <CardTitle className="text-lg">Pre-Game Notes</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                            {log.pre_notes}
                        </p>
                        {log.pre_logged_at && (
                            <p className="text-xs text-slate-500 mt-4 text-right">
                                Logged at {format(parseISO(log.pre_logged_at), "h:mm a")}
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Post-Game Reflection (Future User Story implemented) */}
            <Card className="border-slate-800 bg-slate-900/30 border-dashed">
                <CardHeader className="pb-3 border-b border-slate-800/50">
                    <div className="flex items-center justify-between text-slate-300">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-slate-500" />
                            <CardTitle className="text-lg text-slate-400">Post-Game Reflection</CardTitle>
                        </div>
                        {log.post_logged_at && log.post_performance ? (
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">Completed</Badge>
                        ) : log.post_logged_at && !log.post_performance ? (
                            <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10">Skipped</Badge>
                        ) : (
                            <Badge variant="outline" className="border-slate-700 text-slate-500 bg-slate-800/50">Pending</Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {log.post_logged_at && log.post_performance ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Performance</div>
                                <div className="text-2xl font-bold text-white">{log.post_performance}<span className="text-slate-500 text-sm font-normal">/5</span></div>
                            </div>
                            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Mental State</div>
                                <div className="text-2xl font-bold text-white">{log.post_mental_state}<span className="text-slate-500 text-sm font-normal">/5</span></div>
                            </div>
                            {log.post_descriptor && (
                                <div className="col-span-2 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Descriptor</div>
                                    <p className="text-sm font-medium text-slate-300 capitalize">&quot;{log.post_descriptor}&quot;</p>
                                </div>
                            )}
                        </div>
                    ) : log.post_logged_at && !log.post_performance ? (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                            <p className="text-slate-500 text-sm mb-4">You skipped the post-game reflection for this event.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                            <p className="text-slate-500 text-sm mb-4">You haven&apos;t completed your post-game reflection for this game yet.</p>
                            <Button
                                onClick={() => router.push(`/post-game/${log.id}`)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                            >
                                Complete Reflection Now
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
