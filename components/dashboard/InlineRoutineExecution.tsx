"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Pause,
    Play,
    CheckCircle,
    ArrowRight,
    Lightbulb,
    RotateCcw,
    Clock,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ──

interface InlineTechnique {
    id: string;
    name: string;
    category: string;
    duration_minutes: number;
    instruction?: string | null;
}

interface InlineRoutineStep {
    id: string;
    step_order: number;
    technique: InlineTechnique;
}

interface InlineRoutine {
    id: string;
    name: string;
    steps: InlineRoutineStep[];
}

export interface InlineRoutineExecutionProps {
    routine: InlineRoutine;
    sport: string;
    /** Called when the routine is completed so the parent can update state */
    onComplete?: () => void;
}

// ── Recommendations by category ──
const RECOMMENDATIONS: Record<string, string> = {
    'Breathing': 'Deep breathing lowers your heart rate and primes your nervous system for peak focus.',
    'Visualization': 'Seeing success in your mind builds neural pathways that make it far more likely in reality.',
    'Physical Drill': 'Physical readiness and elevated heart rate are the foundation of mental sharpness.',
    'Mental Check-in': 'Self-awareness is the first step to conquering nerves and finding your flow state.',
};

export default function InlineRoutineExecution({ routine, onComplete }: Omit<InlineRoutineExecutionProps, 'sport'>) {
    const sortedSteps = useMemo(
        () => [...routine.steps].sort((a, b) => a.step_order - b.step_order),
        [routine.steps]
    );
    const totalSteps = sortedSteps.length;

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isPaused, setIsPaused] = useState(true); // Start paused so user controls when to begin
    const [isCompleted, setIsCompleted] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [showInsight, setShowInsight] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize first step timer
    useEffect(() => {
        if (sortedSteps.length > 0) {
            setTimeLeft(sortedSteps[0].technique.duration_minutes * 60);
        }
    }, [sortedSteps]);

    // Timer tick
    useEffect(() => {
        if (!isStarted || isPaused || isCompleted) return;

        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isStarted, isPaused, isCompleted]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const totalTimeLeft = useMemo(() => {
        return sortedSteps.slice(currentStepIndex + 1).reduce(
            (acc, step) => acc + step.technique.duration_minutes * 60, 0
        ) + timeLeft;
    }, [sortedSteps, currentStepIndex, timeLeft]);

    const handleStart = () => {
        setIsStarted(true);
        setIsPaused(false);
    };

    const handleNextStep = useCallback(() => {
        if (currentStepIndex < totalSteps - 1) {
            setShowInsight(true);
            setIsPaused(true);
        } else {
            setIsCompleted(true);
            toast.success("Routine Complete!", {
                description: "Great mental preparation. You're ready for the game."
            });
            onComplete?.();
        }
    }, [currentStepIndex, totalSteps, onComplete]);

    const continueToNext = () => {
        const nextIdx = currentStepIndex + 1;
        setCurrentStepIndex(nextIdx);
        setTimeLeft(sortedSteps[nextIdx].technique.duration_minutes * 60);
        setShowInsight(false);
        setIsPaused(false);
    };

    const handleReset = () => {
        setCurrentStepIndex(0);
        setTimeLeft(sortedSteps[0].technique.duration_minutes * 60);
        setIsPaused(true);
        setIsStarted(false);
        setIsCompleted(false);
        setShowInsight(false);
    };

    // Progress percentage
    const progress = totalSteps > 0 ? ((currentStepIndex + (timeLeft === 0 ? 1 : 0)) / totalSteps) * 100 : 0;

    // ── Not started state ──
    if (!isStarted) {
        return (
            <Card className="border-slate-800 bg-slate-900 overflow-hidden">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-white">{routine.name}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {totalSteps} steps • {sortedSteps.reduce((t, s) => t + s.technique.duration_minutes, 0)} min total
                            </p>
                        </div>
                    </div>
                    {/* Step preview list */}
                    <div className="space-y-1.5 mb-4">
                        {sortedSteps.map((step, idx) => (
                            <div key={step.id} className="flex items-center gap-2.5 text-sm px-2 py-1.5 rounded-lg bg-slate-800/40">
                                <div className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                    {idx + 1}
                                </div>
                                <span className="text-slate-300 flex-1 truncate">{step.technique.name}</span>
                                <span className="text-slate-600 text-xs">{step.technique.duration_minutes}m</span>
                            </div>
                        ))}
                    </div>
                    <Button
                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold h-11 shadow-lg hover:opacity-90 transition-opacity"
                        onClick={handleStart}
                    >
                        <Play className="h-5 w-5 mr-2 fill-current" />
                        Start Routine
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // ── Completed state ──
    if (isCompleted) {
        return (
            <Card className="border-emerald-500/30 bg-emerald-500/5 overflow-hidden">
                <CardContent className="p-6 text-center">
                    <div className="inline-flex p-3 rounded-full bg-emerald-500/15 mb-3">
                        <CheckCircle className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Routine Complete!</h3>
                    <p className="text-sm text-slate-400 mb-4">You&apos;re mentally prepared for the game.</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white"
                        onClick={handleReset}
                    >
                        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                        Run Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // ── Inter-step insight ──
    if (showInsight) {
        const finishedStep = sortedSteps[currentStepIndex];
        const nextStep = sortedSteps[currentStepIndex + 1];
        const rec = RECOMMENDATIONS[finishedStep.technique.category] ||
            'Great focus. Take a moment to absorb the benefits before the next technique.';

        return (
            <Card className="border-indigo-500/30 bg-indigo-500/5 overflow-hidden">
                <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-indigo-500/15 flex-shrink-0">
                            <Lightbulb className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Quick Insight</p>
                            <p className="text-sm text-slate-200 leading-relaxed">{rec}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                        <p className="text-xs text-slate-500">
                            Up next: <span className="text-white font-medium">{nextStep.technique.name}</span>
                        </p>
                        <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                            onClick={continueToNext}
                        >
                            Continue <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // ── Active execution state ──
    const currentStep = sortedSteps[currentStepIndex];
    const technique = currentStep.technique;
    const isLastStep = currentStepIndex === totalSteps - 1;

    return (
        <Card className="border-slate-800 bg-slate-900 overflow-hidden">
            <CardContent className="p-5">
                {/* Progress bar */}
                <div className="w-full h-1 bg-slate-800 rounded-full mb-4 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Step info */}
                <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Step {currentStepIndex + 1} of {totalSteps}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {formatTime(totalTimeLeft)} left
                    </div>
                </div>

                {/* Technique name & category */}
                <div className="mb-2">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 text-[10px] font-medium tracking-wider uppercase border border-slate-700 mb-1.5">
                        {technique.category}
                    </span>
                    <h3 className="text-xl font-bold text-white">{technique.name}</h3>
                </div>

                {/* Instruction */}
                {technique.instruction && (
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">{technique.instruction}</p>
                )}

                {/* Timer display */}
                <div className="text-center py-3">
                    <p className={`text-5xl font-mono font-bold tracking-tight transition-colors ${timeLeft === 0 ? 'text-emerald-400' : 'text-white'}`}>
                        {formatTime(timeLeft)}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 mt-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300"
                        onClick={() => setIsPaused(!isPaused)}
                    >
                        {isPaused ? <Play className="h-5 w-5 ml-0.5" /> : <Pause className="h-5 w-5" />}
                    </Button>
                    <Button
                        className={`flex-1 h-12 rounded-xl font-semibold text-sm transition-all ${timeLeft === 0
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 shadow-lg'
                            : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20 shadow-lg'
                            } text-white`}
                        onClick={handleNextStep}
                    >
                        {isLastStep ? (
                            <>Complete Routine <CheckCircle className="h-4 w-4 ml-1.5" /></>
                        ) : (
                            <>Next Step <ArrowRight className="h-4 w-4 ml-1.5" /></>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
