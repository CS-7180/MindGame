"use client";

import { AlertCircle, BarChart3, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdherenceChart } from "./AdherenceChart";
import { StreakCard } from "./StreakCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CorrelationData {
    total_logged: number;
    has_enough_data: boolean;
    routine_done_avg_perf: number;
    routine_skip_avg_perf: number;
    routine_done_avg_mental: number;
    routine_skip_avg_mental: number;
    current_streak: number;
}

interface CorrelationDashboardProps {
    data: CorrelationData | null;
}

export function CorrelationDashboard({ data }: CorrelationDashboardProps) {
    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
                <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
                <h2 className="text-xl font-semibold text-white">Failed to load insights</h2>
                <p>Could not load your correlation data. Please try again later.</p>
            </div>
        );
    }

    if (!data.has_enough_data) {
        const remaining = 5 - data.total_logged;
        return (
            <div className="max-w-2xl mx-auto mt-12 space-y-6">
                <Link href="/home">
                    <Button variant="ghost" className="mb-4 text-slate-400 hover:text-white hover:bg-slate-800">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>

                <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-sm text-center p-8">
                    <CardHeader>
                        <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <BarChart3 className="w-8 h-8 text-slate-400" />
                        </div>
                        <CardTitle className="text-2xl text-white">Unlocking Insights</CardTitle>
                        <CardDescription className="text-base mt-2 text-slate-400">
                            You need 5 completed games (with both pre-game routine and post-game reflection logged) to see correlation insights.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-lg mt-4 inline-block">
                            <p className="text-3xl font-bold text-indigo-400">{data.total_logged} / 5</p>
                            <p className="text-sm font-medium text-slate-400 mt-1">Games Logged</p>
                        </div>
                        <p className="mt-6 text-slate-400">
                            Log {remaining} more {remaining === 1 ? "game" : "games"} to unlock!
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/home">
                        <Button variant="ghost" className="mb-2 -ml-4 text-slate-400 hover:text-white hover:bg-slate-800">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Routine & Performance Insights</h1>
                    <p className="text-slate-400 mt-1">
                        See how your pre-game routine correlates with your performance and mental state.
                    </p>
                </div>
            </div>

            <StreakCard streak={data.current_streak} />

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Average Performance by Routine Adherence</h2>
                <AdherenceChart
                    donePerf={data.routine_done_avg_perf}
                    skipPerf={data.routine_skip_avg_perf}
                    doneMental={data.routine_done_avg_mental}
                    skipMental={data.routine_skip_avg_mental}
                />
            </div>
        </div>
    );
}
