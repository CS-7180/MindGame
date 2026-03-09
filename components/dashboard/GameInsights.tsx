"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    TrendingUp,
    BarChart3,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
} from "lucide-react";
import { useMemo } from "react";

interface GameLog {
    id: string;
    log_date: string;
    sport: string;
    pre_confidence_level: number | null;
    pre_anxiety_level: number | null;
    routine_completed: string | null;
    post_performance: number | null;
}

export interface GameInsightsProps {
    sport: string;
    gameLogs: GameLog[];
}

export default function GameInsights({ sport, gameLogs }: GameInsightsProps) {
    const sportLogs = useMemo(
        () => gameLogs.filter(l => l.sport === sport).sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime()),
        [gameLogs, sport]
    );

    // Compute adherence stats
    const stats = useMemo(() => {
        if (sportLogs.length === 0) return null;

        const withRoutine = sportLogs.filter(l => l.routine_completed === 'fully');
        const withPartial = sportLogs.filter(l => l.routine_completed === 'partially');
        const withSkipped = sportLogs.filter(l => l.routine_completed === 'skipped');

        const adherenceRate = sportLogs.length > 0
            ? Math.round(((withRoutine.length + withPartial.length * 0.5) / sportLogs.length) * 100)
            : 0;

        // Performance when routine was done vs skipped
        const perfWithRoutine = withRoutine
            .filter(l => l.post_performance != null)
            .map(l => l.post_performance!);
        const perfWithoutRoutine = withSkipped
            .filter(l => l.post_performance != null)
            .map(l => l.post_performance!);

        const avgPerfWith = perfWithRoutine.length > 0
            ? (perfWithRoutine.reduce((a, b) => a + b, 0) / perfWithRoutine.length).toFixed(1)
            : null;
        const avgPerfWithout = perfWithoutRoutine.length > 0
            ? (perfWithoutRoutine.reduce((a, b) => a + b, 0) / perfWithoutRoutine.length).toFixed(1)
            : null;

        // Confidence trend (last 5 vs previous 5)
        const recentLogs = sportLogs.slice(0, 5).filter(l => l.pre_confidence_level != null);
        const olderLogs = sportLogs.slice(5, 10).filter(l => l.pre_confidence_level != null);
        let confidenceTrend: 'up' | 'down' | 'stable' = 'stable';
        if (recentLogs.length >= 2 && olderLogs.length >= 2) {
            const recentAvg = recentLogs.reduce((a, l) => a + (l.pre_confidence_level || 0), 0) / recentLogs.length;
            const olderAvg = olderLogs.reduce((a, l) => a + (l.pre_confidence_level || 0), 0) / olderLogs.length;
            if (recentAvg > olderAvg + 0.5) confidenceTrend = 'up';
            else if (recentAvg < olderAvg - 0.5) confidenceTrend = 'down';
        }

        return {
            totalGames: sportLogs.length,
            adherenceRate,
            fullRoutine: withRoutine.length,
            partialRoutine: withPartial.length,
            skippedRoutine: withSkipped.length,
            avgPerfWith,
            avgPerfWithout,
            confidenceTrend,
        };
    }, [sportLogs]);

    // Not enough data
    if (!stats || stats.totalGames < 3) {
        const needed = 3 - (stats?.totalGames || 0);
        return (
            <Card className="border-slate-800 bg-slate-900/50">
                <CardContent className="p-6 text-center">
                    <div className="inline-flex p-3 rounded-full bg-slate-800/50 mb-3">
                        <BarChart3 className="h-6 w-6 text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-400 mb-1">Not enough data for insights yet.</p>
                    <p className="text-xs text-slate-500">
                        {needed} more game{needed !== 1 ? 's' : ''} needed to unlock insights.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const TrendIcon = stats.confidenceTrend === 'up' ? ArrowUpRight :
        stats.confidenceTrend === 'down' ? ArrowDownRight : Minus;
    const trendColor = stats.confidenceTrend === 'up' ? 'text-emerald-400' :
        stats.confidenceTrend === 'down' ? 'text-red-400' : 'text-slate-400';

    return (
        <div className="space-y-3">
            {/* Adherence Overview */}
            <div className="grid grid-cols-3 gap-3">
                <Card className="border-slate-800 bg-slate-900">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-white">{stats.adherenceRate}%</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Adherence</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-800 bg-slate-900">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-white">{stats.totalGames}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Games</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-800 bg-slate-900">
                    <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                            <TrendIcon className={`h-5 w-5 ${trendColor}`} />
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Confidence</p>
                    </CardContent>
                </Card>
            </div>

            {/* Routine Impact Comparison */}
            {(stats.avgPerfWith || stats.avgPerfWithout) && (
                <Card className="border-slate-800 bg-slate-900">
                    <CardContent className="p-4">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Routine Impact on Performance</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                                <p className="text-lg font-bold text-white">{stats.avgPerfWith ?? '—'}<span className="text-xs text-slate-400">/10</span></p>
                                <p className="text-[10px] text-emerald-400/70 uppercase font-semibold">With Routine</p>
                            </div>
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                                <AlertCircle className="h-4 w-4 text-red-400 mx-auto mb-1" />
                                <p className="text-lg font-bold text-white">{stats.avgPerfWithout ?? '—'}<span className="text-xs text-slate-400">/10</span></p>
                                <p className="text-[10px] text-red-400/70 uppercase font-semibold">Without Routine</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Adherence Breakdown */}
            <Card className="border-slate-800 bg-slate-900">
                <CardContent className="p-4">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Routine Breakdown</h4>
                    <div className="space-y-2.5">
                        {[
                            { label: 'Full Routine', count: stats.fullRoutine, color: 'bg-emerald-500', pct: (stats.fullRoutine / stats.totalGames * 100).toFixed(0) },
                            { label: 'Partial', count: stats.partialRoutine, color: 'bg-amber-500', pct: (stats.partialRoutine / stats.totalGames * 100).toFixed(0) },
                            { label: 'Skipped', count: stats.skippedRoutine, color: 'bg-red-500', pct: (stats.skippedRoutine / stats.totalGames * 100).toFixed(0) },
                        ].map(({ label, count, color, pct }) => (
                            <div key={label} className="flex items-center gap-3">
                                <span className="text-xs text-slate-400 w-20">{label}</span>
                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${color} rounded-full transition-all duration-500`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-500 w-12 text-right">{count} ({pct}%)</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Key Insight */}
            {stats.avgPerfWith && stats.avgPerfWithout && Number(stats.avgPerfWith) > Number(stats.avgPerfWithout) && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <TrendingUp className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-white font-medium">Your performance is {(Number(stats.avgPerfWith) - Number(stats.avgPerfWithout)).toFixed(1)} points higher</p>
                        <p className="text-xs text-slate-400 mt-0.5">when you complete your full pre-game routine.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
