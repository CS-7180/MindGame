'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export const AVAILABLE_SPORTS = [
    "Soccer",
    "Basketball",
    "Football",
    "Baseball",
    "Tennis",
    "Track & Field",
    "Swimming",
    "Volleyball",
    "Golf",
    "Esports",
    "Unspecified"
]
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, GripVertical, Plus, Trash2, Save, ArrowLeft, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { Technique } from '@/types/index'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Local state representation of a step before saving
interface BuilderStep {
    id: string // local uuid
    technique: Technique
}

// ----------------------------------------------------------------------
// Sortable Step Item Component
// ----------------------------------------------------------------------
function SortableStepItem({ step, onRemove }: { step: BuilderStep, onRemove: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: step.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.8 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-4 border p-4 mb-3 rounded-2xl shadow-sm transition-all duration-200 ${isDragging
                ? 'bg-indigo-900/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                : 'bg-slate-900/60 border-white/5 hover:border-white/10 hover:bg-slate-800/60'
                }`}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-move text-slate-500 hover:text-indigo-400 touch-none transition-colors p-1 rounded-md hover:bg-white/5"
            >
                <GripVertical className="h-5 w-5" />
            </div>

            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-200 tracking-wide text-sm">{step.technique.name}</p>
                    <div className="flex items-center text-xs text-indigo-300 font-medium px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                        <Clock className="mr-1.5 h-3 w-3" />
                        {step.technique.duration_minutes} min
                    </div>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {step.technique.instruction}
                </p>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-full h-9 w-9 transition-colors"
                onClick={() => onRemove(step.id)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}

// ----------------------------------------------------------------------
// Main Builder Component
// ----------------------------------------------------------------------
interface InitialRoutine {
    id?: string;
    name?: string;
    sport?: string;
    routine_steps?: Array<{
        step_order: number;
        technique?: Technique;
        techniques?: Partial<Technique>;
    }>;
}

export function RoutineBuilder({
    initialTechniques,
    initialRoutine,
    currentRoutinesCount = 0,
    defaultSport = 'Unspecified',
    isSportLocked = false,
    onSaved
}: {
    initialTechniques: Technique[];
    initialRoutine?: InitialRoutine;
    currentRoutinesCount?: number;
    defaultSport?: string;
    isSportLocked?: boolean;
    onSaved?: (routineId: string) => void;
}) {
    const router = useRouter()
    const [routineName, setRoutineName] = useState(initialRoutine?.name || '')
    const [sport, setSport] = useState(initialRoutine?.sport || defaultSport)

    // Parse initial routine steps if provided
    const [steps, setSteps] = useState<BuilderStep[]>(() => {
        if (!initialRoutine?.routine_steps) return [];
        return initialRoutine.routine_steps
            .sort((a, b) => a.step_order - b.step_order)
            .map((rs) => ({
                id: crypto.randomUUID(),
                technique: rs.technique || rs.techniques as Technique
            }));
    });
    const [isSaving, setIsSaving] = useState(false)
    const [showLimitDialog, setShowLimitDialog] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Calculate total time
    const totalMinutes = steps.reduce((total, step) => total + step.technique.duration_minutes, 0)

    // Group techniques by category for the library
    const groupedTechniques = initialTechniques.reduce((acc, current) => {
        const cat = current.category
        if (!acc[cat]) { acc[cat] = [] }
        acc[cat].push(current)
        return acc
    }, {} as Record<string, Technique[]>)

    const handleAddTechnique = (technique: Technique) => {
        setSteps(prev => [...prev, { id: uuidv4(), technique }])
    }

    const handleRemoveStep = (id: string) => {
        setSteps(prev => prev.filter(step => step.id !== id))
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setSteps((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id)
                const newIndex = items.findIndex((i) => i.id === over.id)
                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    const handleSaveRoutine = async () => {
        if (!initialRoutine && currentRoutinesCount >= 5) {
            setShowLimitDialog(true);
            return;
        }

        if (!routineName.trim()) {
            toast.error('Please enter a name for your routine.')
            return
        }
        if (!sport.trim()) {
            toast.error('Please enter a sport for your routine.')
            return
        }
        if (steps.length === 0) {
            toast.error('Please add at least one technique to your routine.')
            return
        }

        setIsSaving(true)
        try {
            const url = initialRoutine ? `/api/routines/${initialRoutine.id}` : '/api/routines';
            const method = initialRoutine ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: routineName,
                    sport: sport,
                    steps: steps.map((step, index) => ({
                        technique_id: step.technique.id,
                        step_order: index
                    }))
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error?.message || 'Failed to save routine')
            }

            toast.success(initialRoutine ? "Routine updated successfully!" : "Routine saved successfully!")

            if (onSaved) {
                onSaved(result.data.id);
            } else {
                router.push('/home') // Redirect to dashboard/home if standalone
                router.refresh()
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Unknown error")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[calc(100vh-[12rem])] pb-10">

            {/* ----------------------------------------------------------- */}
            {/* LEFT COLUMN: Library */}
            {/* ----------------------------------------------------------- */}
            <div className="xl:col-span-4 space-y-4">
                <Card className="h-[calc(100vh-14rem)] flex flex-col border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl relative overflow-hidden rounded-3xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50"></div>

                    <CardHeader className="border-b border-white/5 bg-slate-950/40 pb-5 pt-6 px-6">
                        <CardTitle className="text-white flex items-center gap-3 text-xl font-bold tracking-tight">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <BookOpen className="h-5 w-5 text-indigo-400" />
                            </div>
                            Technique Library
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-2 text-sm">
                            Click to add techniques to your routine
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-hidden p-0">
                        <ScrollArea className="h-full px-6 pb-8 pt-5">
                            <div className="space-y-8">
                                {Object.entries(groupedTechniques).map(([category, techs]) => (
                                    <div key={category} className="space-y-4">
                                        <h3 className="font-bold capitalize text-sm bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 tracking-widest flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                                            {category}
                                        </h3>
                                        <div className="space-y-3">
                                            {(techs as Technique[]).map((tech: Technique) => (
                                                <div
                                                    key={tech.id}
                                                    data-testid={`technique-item-${tech.id}`}
                                                    className="group relative flex flex-col p-4 border border-white/5 bg-slate-800/30 rounded-2xl hover:border-indigo-500/40 hover:bg-slate-800/80 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
                                                    onClick={() => handleAddTechnique(tech)}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                                    <div className="relative z-10">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <span className="font-semibold text-sm text-slate-200 group-hover:text-indigo-100 transition-colors pr-2 leading-tight">
                                                                {tech.name}
                                                            </span>
                                                            <div className="flex items-center text-xs text-indigo-300 bg-indigo-950/50 px-2.5 py-1 rounded-lg border border-indigo-500/20 whitespace-nowrap">
                                                                <Clock className="w-3 h-3 mr-1.5" />
                                                                {tech.duration_minutes}m
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mt-1">
                                                            {tech.instruction}
                                                        </p>
                                                        <div className="mt-3 flex items-center text-xs text-indigo-400 font-semibold opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                                            <Plus className="w-3.5 h-3.5 mr-1" /> Add to Routine
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* RIGHT COLUMN: Builder */}
            {/* ----------------------------------------------------------- */}
            <div className="xl:col-span-8 space-y-4">
                <Card className="h-[calc(100vh-14rem)] flex flex-col border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl rounded-3xl relative overflow-hidden">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 pt-6 px-8 border-b border-white/5 bg-slate-950/40 z-10">
                        <div className="flex-1 w-full max-w-xl flex gap-3">
                            <Input
                                placeholder="Routine Name (e.g., Final Focus)"
                                className="text-xl font-bold h-14 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 placeholder:font-normal focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-5 transition-all w-2/3"
                                value={routineName}
                                onChange={(e) => setRoutineName(e.target.value)}
                            />
                            <div className="w-1/3">
                                {isSportLocked ? (
                                    <div className="h-14 bg-slate-950/30 border border-white/5 text-slate-300 rounded-xl px-4 flex items-center justify-between opacity-80 cursor-not-allowed">
                                        <span className="truncate">{sport}</span>
                                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-white/10 bg-white/5 text-slate-400">Locked</Badge>
                                    </div>
                                ) : (
                                    <Select value={sport} onValueChange={setSport}>
                                        <SelectTrigger className="h-14 bg-slate-950/50 border-white/10 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl">
                                            <SelectValue placeholder="Select Sport" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10">
                                            {AVAILABLE_SPORTS.map((s) => (
                                                <SelectItem key={s} value={s} className="text-slate-200 focus:bg-indigo-500/20 focus:text-white cursor-pointer hover:bg-indigo-500/20">
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 w-full sm:w-auto">
                            <Badge className="text-sm px-4 py-1.5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold shadow-none whitespace-nowrap">
                                Estimated Time: {totalMinutes}m
                            </Badge>
                            <span className="text-xs text-slate-400 font-medium px-1 tracking-wide">
                                {steps.length} {steps.length === 1 ? 'step' : 'steps'} configured
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-hidden p-0 relative bg-slate-950/20">
                        {/* Decorative background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

                        <ScrollArea className="h-full px-8 py-6 relative z-10">
                            {steps.length === 0 ? (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                                    <div className="p-5 rounded-2xl bg-slate-800/50 border border-white/5 mb-6 shadow-inner">
                                        <Plus className="h-10 w-10 text-slate-400" />
                                    </div>
                                    <p className="text-2xl font-semibold text-white mb-3">Your routine is empty</p>
                                    <p className="text-base max-w-md text-slate-400 leading-relaxed">
                                        Select techniques from the library on the left to start building your personalized pre-game mental routine. Drag to reorder!
                                    </p>
                                </div>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={steps.map(s => s.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-1 max-w-4xl mx-auto">
                                            {steps.map((step) => (
                                                <SortableStepItem
                                                    key={step.id}
                                                    step={step}
                                                    onRemove={handleRemoveStep}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}
                        </ScrollArea>
                    </CardContent>

                    <div className="px-8 py-5 border-t border-white/5 bg-slate-950/60 flex items-center justify-between gap-4 z-10 backdrop-blur-md">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                if (onSaved) {
                                    onSaved(""); // empty string signals cancel/back if we have a callback
                                } else {
                                    router.back();
                                }
                            }}
                            className="text-slate-400 hover:text-white hover:bg-slate-800 transition-colors px-5 rounded-xl text-sm font-medium h-11"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                        <Button
                            onClick={handleSaveRoutine}
                            disabled={isSaving || steps.length === 0 || !routineName.trim()}
                            className="h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:shadow-none hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-all duration-300 px-8 rounded-xl disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : (
                                <span className="flex items-center">
                                    <Save className="mr-2 h-4 w-4" /> {initialRoutine ? 'Save Edits' : 'Save Routine'}
                                </span>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Limit Reached Dialog */}
            <AlertDialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
                <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Routine Limit Reached</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            You have reached the maximum limit of 5 saved routines. Please delete an existing custom routine from your Dashboard before creating a new one.
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
