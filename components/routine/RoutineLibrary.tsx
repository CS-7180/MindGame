'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Download, ArrowRight, Loader2, Play } from 'lucide-react'
import { RoutineWithSteps } from '@/types/index'
import { TIME_TIERS, getTierForDuration, TimeTierId } from '@/lib/constants'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface RoutineLibraryProps {
    currentRoutinesCount: number;
}

export function RoutineLibrary({ currentRoutinesCount }: RoutineLibraryProps) {
    const router = useRouter()
    const [templates, setTemplates] = useState<RoutineWithSteps[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTierFilter, setActiveTierFilter] = useState<TimeTierId | 'ALL'>('ALL')
    const [isCopying, setIsCopying] = useState<string | null>(null)
    const [showLimitDialog, setShowLimitDialog] = useState(false)

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await fetch('/api/templates')
                const json = await res.json()
                if (json.error) throw new Error(json.error.message)
                setTemplates(json.data || [])
            } catch (err: any) {
                toast.error("Failed to load templates", { description: err.message })
            } finally {
                setIsLoading(false)
            }
        }
        fetchTemplates()
    }, [])

    const handleCopyTemplate = async (template: RoutineWithSteps) => {
        if (currentRoutinesCount >= 5) {
            setShowLimitDialog(true);
            return;
        }

        setIsCopying(template.id)
        try {
            // Re-format steps to match builder schema
            const stepsPayload = template.steps.map(s => ({
                technique_id: s.technique_id,
                step_order: s.step_order
            }))

            const res = await fetch('/api/routines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: template.name, // Keep the same name
                    steps: stepsPayload
                })
            })

            const json = await res.json()
            if (!res.ok) {
                throw new Error(json.error?.message || "Failed to copy routine")
            }

            toast.success("Routine added to your list!")
            router.refresh() // refresh server data in parent
        } catch (err: any) {
            toast.error("Failed to copy", { description: err.message })
        } finally {
            setIsCopying(null)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        )
    }

    // Determine the total time and tier for each template
    const templatesWithTime = templates.map(t => {
        const totalMin = t.steps.reduce((acc, step) => acc + step.technique.duration_minutes, 0)
        const tier = getTierForDuration(totalMin)
        return { ...t, totalMin, tier }
    })

    const filteredTemplates = activeTierFilter === 'ALL'
        ? templatesWithTime
        : templatesWithTime.filter(t => t.tier.id === TIME_TIERS[activeTierFilter].id)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Template Library</h2>
                <p className="text-slate-400">Browse and add pre-built mental routines to your collection.</p>
            </div>

            {/* Tier Filters */}
            <div className="flex flex-wrap gap-2">
                <Badge
                    variant={activeTierFilter === 'ALL' ? 'default' : 'outline'}
                    className={`cursor-pointer px-4 py-1.5 text-sm transition-colors ${activeTierFilter === 'ALL' ? 'bg-indigo-600 hover:bg-indigo-500' : 'hover:bg-slate-800'}`}
                    onClick={() => setActiveTierFilter('ALL')}
                >
                    All
                </Badge>
                {Object.entries(TIME_TIERS).map(([key, tier]) => (
                    <Badge
                        key={key}
                        variant={activeTierFilter === key ? 'default' : 'outline'}
                        className={`cursor-pointer px-4 py-1.5 text-sm transition-colors ${activeTierFilter === key ? 'bg-indigo-600 hover:bg-indigo-500' : 'hover:bg-slate-800'}`}
                        onClick={() => setActiveTierFilter(key as TimeTierId)}
                    >
                        {tier.label} ({tier.description})
                    </Badge>
                ))}
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.length === 0 ? (
                    <div className="col-span-full py-8 text-center border border-dashed rounded-xl border-white/10">
                        <p className="text-slate-400">No templates found for this tier.</p>
                    </div>
                ) : (
                    filteredTemplates.map(template => (
                        <Card key={template.id} className="bg-slate-900 border-white/10 hover:border-indigo-500/50 transition-colors flex flex-col h-full">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg text-slate-100">{template.name}</CardTitle>
                                        <div className="flex items-center text-sm text-slate-400 pt-1">
                                            <Badge variant="secondary" className="mr-2 bg-slate-800 text-slate-300 hover:bg-slate-800 font-medium">
                                                {template.tier.label}
                                            </Badge>
                                            <Clock className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                                            <span>{template.totalMin} min</span>
                                            <span className="mx-2">•</span>
                                            <span>{template.steps.length} steps</span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 pb-4">
                                {/* Preview Steps list */}
                                <div className="space-y-2">
                                    {template.steps.slice(0, 3).map((step, idx) => (
                                        <div key={idx} className="flex items-center text-sm text-slate-300 bg-slate-800/50 px-3 py-2 rounded-md">
                                            <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] mr-3 font-semibold text-slate-300">
                                                {step.step_order + 1}
                                            </span>
                                            <span className="truncate flex-1">{step.technique.name}</span>
                                            <span className="text-slate-500 ml-2">{step.technique.duration_minutes}m</span>
                                        </div>
                                    ))}
                                    {template.steps.length > 3 && (
                                        <div className="text-xs text-slate-500 text-center pt-1 font-medium italic">
                                            + {template.steps.length - 3} more steps
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <div className="p-4 pt-0 mt-auto flex gap-3">
                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                                    onClick={() => handleCopyTemplate(template)}
                                    disabled={isCopying === template.id}
                                >
                                    {isCopying === template.id ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4 mr-2" />
                                    )}
                                    Add to My Routines
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Limit Reached Dialog */}
            <AlertDialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
                <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Routine Limit Reached</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            You have reached the maximum limit of 5 saved routines. Please delete an existing custom routine from your Dashboard before copying a new template.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setShowLimitDialog(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            Okay, Got it
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
