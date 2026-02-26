"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    ArrowLeft,
    ArrowRight,
    SkipForward,
    Brain,
    Check,
} from "lucide-react";
import type { AnxietySymptom, TimePreference } from "@/lib/recommender";

const SPORTS = [
    "Soccer", "Basketball", "Tennis", "Baseball", "Swimming",
    "Track & Field", "Volleyball", "Football", "Hockey", "Golf",
    "Lacrosse", "Wrestling", "Softball", "Rugby",
];

const LEVELS = [
    { value: "recreational", label: "Recreational", desc: "Weekend leagues, casual play" },
    { value: "college", label: "College", desc: "Competing at the collegiate level" },
    { value: "semi_pro", label: "Semi-Pro", desc: "Competitive / semi-professional" },
];

const SYMPTOMS: { value: AnxietySymptom; label: string; emoji: string }[] = [
    { value: "overthinking", label: "Overthinking", emoji: "🧠" },
    { value: "physical_tension", label: "Physical Tension", emoji: "💪" },
    { value: "loss_of_focus", label: "Loss of Focus", emoji: "🎯" },
    { value: "self_doubt", label: "Self-Doubt", emoji: "😟" },
    { value: "rushing", label: "Rushing / Impatience", emoji: "⚡" },
    { value: "negativity_after_errors", label: "Negativity After Errors", emoji: "😤" },
];

const TIME_OPTIONS: { value: TimePreference; label: string; desc: string }[] = [
    { value: "2min", label: "2 Minutes", desc: "Quick reset — perfect when time is tight" },
    { value: "5min", label: "5 Minutes", desc: "Standard — the sweet spot for most athletes" },
    { value: "10min", label: "10 Minutes", desc: "Extended — deep preparation for big games" },
];

export default function OnboardingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentStep = parseInt(searchParams.get("step") || "1");

    const [sport, setSport] = useState("");
    const [customSport, setCustomSport] = useState("");
    const [level, setLevel] = useState("");
    const [symptoms, setSymptoms] = useState<AnxietySymptom[]>([]);
    const [timePreference, setTimePreference] = useState<TimePreference | "">("");
    const [loading, setLoading] = useState(false);

    const toggleSymptom = (symptom: AnxietySymptom) => {
        setSymptoms((prev) =>
            prev.includes(symptom)
                ? prev.filter((s) => s !== symptom)
                : [...prev, symptom]
        );
    };

    const goToStep = (step: number) => {
        router.push(`/onboarding?step=${step}`);
    };

    const handleSkip = () => {
        router.push("/home");
    };

    const handleComplete = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push("/login");
            return;
        }

        const finalSport = sport === "Other" ? customSport : sport;

        // Save onboarding data via API
        const response = await fetch("/api/onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sport: finalSport,
                competitive_level: level,
                anxiety_symptoms: symptoms,
                time_preference: timePreference,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            // Store recommended techniques for the result page
            if (typeof window !== "undefined") {
                sessionStorage.setItem("recommended_routine", JSON.stringify(data.data.recommended));
                sessionStorage.setItem("onboarding_sport", finalSport);
            }
            router.push("/onboarding/result");
        } else {
            setLoading(false);
        }
    };

    const progressValue = (currentStep / 4) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                            <Brain className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">Set Up Your Profile</h1>
                    <p className="text-slate-400 text-sm">Step {currentStep} of 4</p>
                </div>

                {/* Progress Bar */}
                <Progress value={progressValue} className="mb-6 h-2 bg-slate-800" data-testid="onboarding-progress" />

                {/* Step 1: Sport Selection */}
                {currentStep === 1 && (
                    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-sm shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">What sport do you play?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {SPORTS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => { setSport(s); setCustomSport(""); }}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${sport === s
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                                            : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                                            }`}
                                        data-testid={`sport-${s.toLowerCase().replace(/[^a-z]/g, "")}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setSport("Other")}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${sport === "Other"
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                                        }`}
                                    data-testid="sport-other"
                                >
                                    Other
                                </button>
                            </div>

                            {sport === "Other" && (
                                <Input
                                    type="text"
                                    placeholder="Enter your sport"
                                    value={customSport}
                                    onChange={(e) => setCustomSport(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500"
                                    data-testid="sport-custom-input"
                                />
                            )}

                            <div className="flex justify-between items-center pt-4">
                                <Button
                                    variant="ghost"
                                    onClick={handleSkip}
                                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                                    data-testid="onboarding-skip"
                                >
                                    <SkipForward className="h-4 w-4 mr-2" />
                                    Skip Setup
                                </Button>
                                <Button
                                    onClick={() => goToStep(2)}
                                    disabled={!sport || (sport === "Other" && !customSport)}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                                    data-testid="onboarding-next"
                                >
                                    Continue
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Competitive Level */}
                {currentStep === 2 && (
                    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-sm shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">What&apos;s your competitive level?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {LEVELS.map((l) => (
                                <button
                                    key={l.value}
                                    onClick={() => setLevel(l.value)}
                                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 ${level === l.value
                                        ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                        }`}
                                    data-testid={`level-${l.value}`}
                                >
                                    <div className={`font-medium ${level === l.value ? "text-indigo-300" : "text-slate-300"}`}>
                                        {l.label}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">{l.desc}</div>
                                </button>
                            ))}

                            <div className="flex justify-between items-center pt-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => goToStep(1)}
                                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                                    data-testid="onboarding-back"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <Button
                                    onClick={() => goToStep(3)}
                                    disabled={!level}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                                    data-testid="onboarding-next"
                                >
                                    Continue
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Anxiety Symptoms */}
                {currentStep === 3 && (
                    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-sm shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">What do you experience before games?</CardTitle>
                            <p className="text-sm text-slate-400 mt-1">Select all that apply</p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                {SYMPTOMS.map((s) => (
                                    <button
                                        key={s.value}
                                        onClick={() => toggleSymptom(s.value)}
                                        className={`p-4 rounded-xl text-left transition-all duration-200 border-2 relative ${symptoms.includes(s.value)
                                            ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                            }`}
                                        data-testid={`symptom-${s.value}`}
                                    >
                                        {symptoms.includes(s.value) && (
                                            <div className="absolute top-2 right-2">
                                                <Check className="h-4 w-4 text-indigo-400" />
                                            </div>
                                        )}
                                        <div className="text-xl mb-1">{s.emoji}</div>
                                        <div className={`text-sm font-medium ${symptoms.includes(s.value) ? "text-indigo-300" : "text-slate-300"}`}>
                                            {s.label}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => goToStep(2)}
                                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                                    data-testid="onboarding-back"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <Button
                                    onClick={() => goToStep(4)}
                                    disabled={symptoms.length === 0}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                                    data-testid="onboarding-next"
                                >
                                    Continue
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 4: Time Preference */}
                {currentStep === 4 && (
                    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-sm shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">How much time do you have before games?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {TIME_OPTIONS.map((t) => (
                                <button
                                    key={t.value}
                                    onClick={() => setTimePreference(t.value)}
                                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 ${timePreference === t.value
                                        ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                        }`}
                                    data-testid={`time-${t.value}`}
                                >
                                    <div className={`font-medium ${timePreference === t.value ? "text-indigo-300" : "text-slate-300"}`}>
                                        {t.label}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">{t.desc}</div>
                                </button>
                            ))}

                            <div className="flex justify-between items-center pt-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => goToStep(3)}
                                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                                    data-testid="onboarding-back"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <Button
                                    onClick={handleComplete}
                                    disabled={!timePreference || loading}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                                    data-testid="onboarding-complete"
                                >
                                    {loading ? "Generating routine..." : "See My Routine"}
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
