'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight } from 'lucide-react'

export function RoutineCompletion({ routineName }: { routineName: string }) {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/20 blur-[120px] rounded-full point-events-none" />

            <div className="z-10 max-w-md w-full text-center space-y-8">
                <div className="flex justify-center mb-8">
                    <div className="h-32 w-32 rounded-full bg-green-500/10 flex items-center justify-center border-2 border-green-500/20">
                        <CheckCircle className="h-16 w-16 text-green-400" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl font-extrabold tracking-tight">Routine Complete!</h1>
                    <p className="text-slate-400 text-lg">
                        You&apos;ve successfully completed your <span className="text-indigo-400 font-semibold">{routineName}</span> routine.
                    </p>
                    <p className="text-slate-300 font-medium pt-2">
                        Your mind is focused. Your body is ready.
                    </p>
                </div>

                <div className="pt-8">
                    <Button
                        size="lg"
                        className="w-full h-14 rounded-full text-lg font-bold bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.3)]"
                        onClick={() => router.push('/log/pre')}
                    >
                        Log Pre-Game Entry <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full mt-4 text-slate-400 hover:text-white"
                        onClick={() => router.push('/home')}
                    >
                        Back to Home
                    </Button>
                </div>
            </div>
        </div>
    )
}
