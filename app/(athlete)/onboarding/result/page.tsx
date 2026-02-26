"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Brain,
    Clock,
    Sparkles,
    ArrowRight,
    Wrench,
} from "lucide-react";
import type { RecommendedTechnique } from "@/lib/recommender";

const CATEGORY_ICONS: Record<string, string> = {
    breathing: "🌬️",
    visualization: "👁️",
    affirmations: "💬",
    focus: "🎯",
    grounding: "🧘",
};

export default function OnboardingResultPage() {
    const router = useRouter();
    const [recommended, setRecommended] = useState<RecommendedTechnique[]>([]);
    const [sport, setSport] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = sessionStorage.getItem("recommended_routine");
            const storedSport = sessionStorage.getItem("onboarding_sport");
            if (stored) {
                setRecommended(JSON.parse(stored));
            }
            if (storedSport) {
                setSport(storedSport);
            }
        }
    }, []);

    const totalTime = recommended.reduce((sum, t) => sum + t.duration_minutes, 0);

    const handleSaveAndContinue = async () => {
        setSaving(true);

        // Create a routine from the recommended techniques
        const response = await fetch("/api/routines", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: `My ${sport || "Pre-Game"} Routine`,
                source: "recommended",
                steps: recommended.map((t, index) => ({
                    technique_id: t.id,
                    step_order: index + 1,
                })),
            }),
        });

        if (response.ok) {
            // Clean up session storage
            sessionStorage.removeItem("recommended_routine");
            sessionStorage.removeItem("onboarding_sport");
            router.push("/home");
        }

        setSaving(false);
    };

    const handleBuildOwn = () => {
        sessionStorage.removeItem("recommended_routine");
        sessionStorage.removeItem("onboarding_sport");
        router.push("/home");
    };

    if (recommended.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4 flex items-center justify-center">
                <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-sm max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <Brain className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">No Recommendations Found</h2>
                        <p className="text-slate-400 mb-6">
                            We couldn&apos;t generate a routine with your preferences. Try building your own!
                        </p>
                        <Button
                            onClick={() => router.push("/home")}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"
                        >
                            Go to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                            <Sparkles className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Your Personalized Routine</h1>
                    <p className="text-slate-400">
                        Based on your profile, here&apos;s a routine tailored just for you
                    </p>
                </div>

                {/* Time Badge */}
                <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">{totalTime} minutes total</span>
                    </div>
                </div>

                {/* Technique Cards */}
                <div className="space-y-3 mb-8">
                    {recommended.map((technique, index) => (
                        <Card
                            key={technique.id}
                            className="border-slate-800 bg-slate-900/80 backdrop-blur-sm overflow-hidden"
                            data-testid={`recommendation-${index}`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
                                        {CATEGORY_ICONS[technique.category] || "✨"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-white">{technique.name}</h3>
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {technique.duration_minutes} min
                                            </span>
                                        </div>
                                        <p className="text-sm text-indigo-300 mb-1">{technique.match_reason}</p>
                                        <p className="text-xs text-slate-500 capitalize">{technique.category}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={handleSaveAndContinue}
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-indigo-500/25 h-12 text-base"
                        data-testid="save-routine"
                    >
                        {saving ? "Saving..." : "Save & Continue"}
                        <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                    <Button
                        onClick={handleBuildOwn}
                        variant="ghost"
                        className="w-full text-slate-400 hover:text-white hover:bg-slate-800/50 h-12"
                        data-testid="build-own"
                    >
                        <Wrench className="h-4 w-4 mr-2" />
                        I&apos;ll Build My Own Instead
                    </Button>
                </div>
            </div>
        </div>
    );
}
