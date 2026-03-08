'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { RoutineWithSteps } from '@/types/index'
import { Button } from '@/components/ui/button'
import { Pause, Play, CheckCircle, ArrowRight, X, Lightbulb } from 'lucide-react'
import { RoutineCompletion } from './RoutineCompletion'
import { toast } from 'sonner'

interface RoutineExecutionProps {
    routine: RoutineWithSteps
    sport?: string
}

export function RoutineExecution({ routine, sport }: RoutineExecutionProps) {
    const router = useRouter()

    // Memoize sorted steps so the reference is stable across renders
    const sortedSteps = useMemo(
        () => [...routine.steps].sort((a, b) => a.step_order - b.step_order),
        [routine.steps]
    )
    const totalSteps = sortedSteps.length

    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [timeLeftInStep, setTimeLeftInStep] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [showExitConfirm, setShowExitConfirm] = useState(false)
    const [showRecommendation, setShowRecommendation] = useState(false)

    // Ref for the interval so we can clear it from inside the updater
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // Calculate total time remaining starting from the current step
    const totalRemainingTime = sortedSteps.slice(currentStepIndex + 1).reduce(
        (acc, step) => acc + step.technique.duration_minutes * 60, 0
    ) + timeLeftInStep

    const storageKey = `mindgame_routine_state_${routine.id}`

    // Hydrate state from localStorage on initial load
    useEffect(() => {
        const savedState = localStorage.getItem(storageKey)
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState)
                // Only resume if it's the exact same routine structure (optional safety check)
                if (parsed.currentStepIndex < totalSteps) {
                    setCurrentStepIndex(parsed.currentStepIndex)
                    setTimeLeftInStep(parsed.timeLeftInStep)
                    setIsPaused(true) // Always start paused when resuming
                    toast.success('Resumed previous session.')
                } else {
                    // Invalid state, reset
                    setTimeLeftInStep(sortedSteps[0]?.technique.duration_minutes * 60 || 0)
                }
            } catch (error) {
                console.error('Failed to parse saved state', error)
                setTimeLeftInStep(sortedSteps[0]?.technique.duration_minutes * 60 || 0)
            }
        } else {
            // No saved state, initialize first step
            setTimeLeftInStep(sortedSteps[0]?.technique.duration_minutes * 60 || 0)
        }
        setIsLoaded(true)
    }, [storageKey, sortedSteps, totalSteps])

    // Save state whenever it changes
    useEffect(() => {
        if (!isLoaded || isCompleted) return

        const stateToSave = {
            currentStepIndex,
            timeLeftInStep,
            lastUpdated: new Date().toISOString()
        }
        localStorage.setItem(storageKey, JSON.stringify(stateToSave))
    }, [currentStepIndex, timeLeftInStep, isLoaded, isCompleted, storageKey])

    // Timer logic — intentionally excludes `timeLeftInStep` from deps to prevent
    // re-creating the interval on every tick (which caused the flicker).
    // The interval is only started/stopped when play/pause/load state changes.
    useEffect(() => {
        if (!isLoaded || isPaused || isCompleted) return

        intervalRef.current = setInterval(() => {
            setTimeLeftInStep((prev) => {
                if (prev <= 1) {
                    // Clear from ref when we naturally hit zero
                    if (intervalRef.current) clearInterval(intervalRef.current)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, isPaused, isCompleted])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const nextStep = useCallback(() => {
        if (currentStepIndex < totalSteps - 1) {
            setShowRecommendation(true)
            setIsPaused(true)
        } else {
            // Finish routine
            setIsCompleted(true)
            localStorage.removeItem(storageKey)
        }
    }, [currentStepIndex, totalSteps, storageKey])

    const continueToNextStep = () => {
        const nextIdx = currentStepIndex + 1
        setCurrentStepIndex(nextIdx)
        setTimeLeftInStep(sortedSteps[nextIdx].technique.duration_minutes * 60)
        setShowRecommendation(false)
        // Auto play the next step
        setIsPaused(false)
    }

    const handleExit = () => {
        setIsPaused(true) // Pause timer while confirming
        setShowExitConfirm(true)
    }

    if (!isLoaded) return <div className="min-h-screen flex items-center justify-center text-white">Loading routine...</div>

    if (isCompleted) {
        return <RoutineCompletion routineName={routine.name} sport={sport} />
    }

    if (showRecommendation) {
        const finishedStep = sortedSteps[currentStepIndex]
        const upcomingStep = sortedSteps[currentStepIndex + 1]

        const getRecommendation = (currentCategory: string) => {
            const recommendations: Record<string, string> = {
                'Breathing': 'Great job centering yourself. Deep breathing lowers your heart rate and prepares your nervous system for peak performance.',
                'Visualization': 'Excellent visualization. Seeing success in your mind builds neural pathways that make it far more likely to happen in reality.',
                'Physical Drill': 'Nice work. Physical readiness and an elevated heart rate are the foundation of mental sharpness.',
                'Mental Check-in': 'Good self-awareness. Acknowledging your current mental state is the crucial first step to conquering it.',
            }
            return recommendations[currentCategory] || 'Great focus. Take a second to reset and absorb the benefits before moving to the next technique.'
        }

        return (
            <div className="min-h-screen bg-slate-950 flex flex-col text-white items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 blur-[150px] opacity-20 transition-colors duration-1000 -z-10 rounded-full bg-indigo-600" />

                <div className="max-w-2xl w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                    <div className="inline-flex p-4 rounded-full bg-indigo-500/20 text-indigo-400 mb-2">
                        <Lightbulb className="w-10 h-10" />
                    </div>

                    <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Quick Insight</h2>

                    <p className="text-xl sm:text-2xl text-slate-300 leading-relaxed font-light">
                        {getRecommendation(finishedStep.technique.category)}
                    </p>

                    <div className="pt-8 flex flex-col sm:flex-row gap-6 justify-center items-center border-t border-slate-800/50 mt-8">
                        <div className="text-left text-sm text-slate-400 hidden sm:block mr-auto">
                            Up next: <span className="font-semibold text-white truncate max-w-[200px] inline-block align-bottom">{upcomingStep.technique.name}</span>
                        </div>
                        <Button
                            size="lg"
                            className="w-full sm:w-auto px-10 h-14 rounded-full text-lg font-semibold bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all"
                            onClick={continueToNextStep}
                        >
                            Continue <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const currentStep = sortedSteps[currentStepIndex]
    const technique = currentStep.technique
    const isLastStep = currentStepIndex === totalSteps - 1

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col text-white">
            {/* Exit Confirmation Banner */}
            {showExitConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center space-y-5">
                        <h3 className="text-xl font-bold text-white">Exit Routine?</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Your progress is saved. You can resume this routine later.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
                                onClick={() => { setShowExitConfirm(false); setIsPaused(false) }}
                            >
                                Keep Going
                            </Button>
                            <Button
                                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white"
                                onClick={() => router.push('/home')}
                            >
                                Exit
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* Top Bar / Progress Indicator */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
                <div>
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">
                        {routine.name}
                    </p>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        Step {currentStepIndex + 1} of {totalSteps}
                    </h2>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-sm text-slate-400">Total Time Left</p>
                        <p className="text-xl font-mono text-indigo-400 font-medium">
                            {formatTime(totalRemainingTime)}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleExit} className="hover:bg-slate-800 rounded-full h-10 w-10 text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 max-w-4xl mx-auto w-full relative">

                {/* Background ambient glow based on state */}
                <div className={`absolute inset-0 blur-[150px] opacity-20 transition-colors duration-1000 -z-10 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-indigo-600'}`} />

                <div className="text-center space-y-8 w-full" data-testid="step-display">
                    {/* Category Badge */}
                    <div className="inline-block px-4 py-1.5 rounded-full bg-slate-800 text-indigo-300 text-sm font-medium tracking-wide border border-slate-700">
                        {technique.category}
                    </div>

                    {/* Technique Title */}
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent pb-2">
                        {technique.name}
                    </h1>

                    {/* Instruction Text */}
                    <p className="text-xl sm:text-2xl text-slate-300 leading-relaxed max-w-2xl mx-auto font-light">
                        {technique.instruction}
                    </p>

                    {/* Large Countdown Timer */}
                    <div className="py-8">
                        <div className={`text-8xl sm:text-[160px] font-mono tracking-tighter transition-colors duration-300 ${timeLeftInStep === 0 ? 'text-green-400' : 'text-white'}`}>
                            {formatTime(timeLeftInStep)}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="fixed sm:static bottom-0 left-0 right-0 p-6 sm:p-0 bg-slate-950/90 sm:bg-transparent border-t border-slate-800 sm:border-0 backdrop-blur-md sm:backdrop-blur-none mt-10">
                    <div className="max-w-md mx-auto flex items-center justify-center gap-4">

                        <Button
                            variant="outline"
                            size="lg"
                            className="h-16 w-16 rounded-full border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:text-white text-slate-300 transition-all"
                            onClick={() => setIsPaused(!isPaused)}
                        >
                            {isPaused ? <Play className="h-6 w-6 ml-1" /> : <Pause className="h-6 w-6" />}
                        </Button>

                        <Button
                            size="lg"
                            className={`h-16 px-8 rounded-full text-lg font-semibold whitespace-nowrap flex-1 transition-all ${timeLeftInStep === 0
                                ? 'bg-green-600 hover:bg-green-500 shadow-[0_0_30px_rgba(22,163,74,0.3)]'
                                : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.3)]'
                                }`}
                            onClick={nextStep}
                        >
                            {isLastStep ? (
                                <>
                                    Complete Routine <CheckCircle className="ml-2 h-5 w-5" />
                                </>
                            ) : (
                                <>
                                    Next Step <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>

                    </div>
                </div>
            </div>
        </div>
    )
}
