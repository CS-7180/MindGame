'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RoutineWithSteps } from '@/types/index'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Pause, Play, CheckCircle, ArrowRight, X } from 'lucide-react'
import { RoutineCompletion } from './RoutineCompletion'
import { toast } from 'sonner'

interface RoutineExecutionProps {
    routine: RoutineWithSteps
}

export function RoutineExecution({ routine }: RoutineExecutionProps) {
    const router = useRouter()

    // Sort steps numerically based on step_order
    const sortedSteps = [...routine.steps].sort((a, b) => a.step_order - b.step_order)
    const totalSteps = sortedSteps.length

    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [timeLeftInStep, setTimeLeftInStep] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

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

    // Timer logic
    useEffect(() => {
        if (!isLoaded || isPaused || isCompleted || timeLeftInStep <= 0) return

        const timerId = setInterval(() => {
            setTimeLeftInStep((prev) => {
                if (prev <= 1) {
                    clearInterval(timerId)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timerId)
    }, [isLoaded, isPaused, isCompleted, timeLeftInStep])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const nextStep = useCallback(() => {
        if (currentStepIndex < totalSteps - 1) {
            const nextIdx = currentStepIndex + 1
            setCurrentStepIndex(nextIdx)
            setTimeLeftInStep(sortedSteps[nextIdx].technique.duration_minutes * 60)
            // Auto play the next step
            setIsPaused(false)
        } else {
            // Finish routine
            setIsCompleted(true)
            localStorage.removeItem(storageKey)
        }
    }, [currentStepIndex, totalSteps, sortedSteps, storageKey])

    const handleExit = () => {
        if (confirm('Are you sure you want to exit? Your progress is saved.')) {
            router.push('/home')
        }
    }

    if (!isLoaded) return <div className="min-h-screen flex items-center justify-center text-white">Loading routine...</div>

    if (isCompleted) {
        return <RoutineCompletion routineName={routine.name} />
    }

    const currentStep = sortedSteps[currentStepIndex]
    const technique = currentStep.technique
    const isLastStep = currentStepIndex === totalSteps - 1

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col text-white">
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

                <div className="text-center space-y-8 w-full">
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
