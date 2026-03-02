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
    CardTitle,
    CardFooter
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Clock, GripVertical, Plus, Trash2, Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Technique } from '@/types/database'

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
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-4 bg-card border rounded-lg p-4 mb-2 shadow-sm"
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-move text-muted-foreground hover:text-foreground touch-none"
            >
                <GripVertical className="h-5 w-5" />
            </div>

            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <p className="font-medium leading-none">{step.technique.name}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {step.technique.duration_minutes} min
                    </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                    {step.technique.instruction}
                </p>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
export function RoutineBuilder({ initialTechniques }: { initialTechniques: Technique[] }) {
    const router = useRouter()
    const [routineName, setRoutineName] = useState('')
    const [steps, setSteps] = useState<BuilderStep[]>([])
    const [isSaving, setIsSaving] = useState(false)

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
        if (!routineName.trim()) {
            toast.error('Please enter a name for your routine.')
            return
        }
        if (steps.length === 0) {
            toast.error('Please add at least one technique to your routine.')
            return
        }

        setIsSaving(true)
        try {
            const response = await fetch('/api/routines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: routineName,
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

            toast.success('Routine saved successfully!')
            router.push('/') // Redirect to dashboard/home
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ----------------------------------------------------------- */}
            {/* LEFT COLUMN: Library */}
            {/* ----------------------------------------------------------- */}
            <div className="lg:col-span-4 space-y-4">
                <Card className="h-[calc(100vh-12rem)] flex flex-col">
                    <CardHeader>
                        <CardTitle>Technique Library</CardTitle>
                        <CardDescription>Click to add to your routine</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0">
                        <ScrollArea className="h-full px-6 pb-6">
                            <div className="space-y-6">
                                {Object.entries(groupedTechniques).map(([category, techs]) => (
                                    <div key={category} className="space-y-3">
                                        <h3 className="font-semibold capitalize text-sm text-muted-foreground tracking-wider">
                                            {category}
                                        </h3>
                                        <div className="space-y-2">
                                            {techs.map(tech => (
                                                <div
                                                    key={tech.id}
                                                    className="group flex flex-col p-3 border rounded-md hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer"
                                                    onClick={() => handleAddTechnique(tech)}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-medium text-sm">{tech.name}</span>
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {tech.duration_minutes}m
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {tech.instruction}
                                                    </p>
                                                    <div className="mt-2 flex items-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Plus className="w-3 h-3 mr-1" /> Add to routine
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
            <div className="lg:col-span-8 space-y-4">
                <Card className="h-[calc(100vh-12rem)] flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                        <div className="space-y-1 flex-1 mr-4">
                            <Input
                                placeholder="Give your routine a name (e.g., Final Pre-Game Focus)"
                                className="text-lg font-semibold h-12"
                                value={routineName}
                                onChange={(e) => setRoutineName(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Badge variant="secondary" className="text-sm px-3 py-1">
                                Estimated Time: {totalMinutes}m
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                {steps.length} {steps.length === 1 ? 'step' : 'steps'}
                            </span>
                        </div>
                    </CardHeader>

                    <Separator />

                    <CardContent className="flex-1 overflow-hidden p-0 bg-muted/20">
                        <ScrollArea className="h-full p-6">
                            {steps.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                                    <Plus className="h-8 w-8 mb-4 opacity-50" />
                                    <p className="text-lg font-medium">Your routine is empty</p>
                                    <p className="text-sm max-w-sm mt-1">
                                        Select techniques from the library on the left to start building your personalized pre-game mental routine.
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
                                        <div className="space-y-1">
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

                    <Separator />

                    <CardFooter className="justify-between pt-4 pb-4">
                        <Button variant="ghost" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                        <Button
                            onClick={handleSaveRoutine}
                            disabled={isSaving || steps.length === 0 || !routineName.trim()}
                        >
                            {isSaving ? 'Saving...' : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Save Routine
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

        </div>
    )
}
