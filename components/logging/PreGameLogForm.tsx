"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { CheckCircle2, AlertTriangle, XCircle, Brain, ArrowLeft } from "lucide-react";

// ── Zod schema (client-side mirror of the API schema) ──
const preGameLogSchema = z.object({
    routine_completed: z.union(
        [z.literal("yes"), z.literal("partial"), z.literal("no")],
        { message: "Please select whether you completed your routine." }
    ),
    pre_anxiety_level: z.number().int().min(1).max(5),
    pre_confidence_level: z.number().int().min(1).max(5),
    pre_notes: z
        .string()
        .max(200, "Notes must be 200 characters or fewer")
        .optional()
        .or(z.literal("")),
    sport: z.string().min(1, "Please specify a sport"),
});

type PreGameLogFormValues = z.infer<typeof preGameLogSchema>;

const ANXIETY_LABELS: Record<number, string> = {
    1: "Calm",
    2: "Slight nerves",
    3: "Moderate",
    4: "High",
    5: "Overwhelmed",
};

const CONFIDENCE_LABELS: Record<number, string> = {
    1: "Very low",
    2: "Low",
    3: "Neutral",
    4: "High",
    5: "Very high",
};

export function PreGameLogForm({ sport }: { sport?: string | null }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<PreGameLogFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(preGameLogSchema as any),
        defaultValues: {
            routine_completed: undefined,
            pre_anxiety_level: 3,
            pre_confidence_level: 3,
            pre_notes: "",
            sport: sport || "",
        },
    });

    const onSubmit = async (values: PreGameLogFormValues) => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/logs/pre", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    log_date: format(new Date(), "yyyy-MM-dd"),
                }),
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error?.message || "Failed to save log");
            }

            toast.success("Pre-game log saved!", {
                description: "Your mental state has been recorded.",
            });
            router.push("/home");
            router.refresh();
        } catch (err: unknown) {
            toast.error("Failed to save log", {
                description: err instanceof Error ? err.message : "Unknown error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const notesValue = form.watch("pre_notes") ?? "";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
            {/* Header */}
            <header className="p-4 flex items-center gap-3 border-b border-slate-800/50">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                    data-testid="back-button"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25">
                        <Brain className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="font-bold text-white text-lg">
                        Pre-{sport ? <span className="text-indigo-400">{sport}</span> : ""} Game Log
                    </h1>
                </div>
            </header>

            <main className="p-4 max-w-lg mx-auto">
                <p className="text-slate-400 mb-6">
                    Record how you&apos;re feeling before your game. This helps you track
                    patterns over time.
                </p>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* ── Sport ── */}
                        <FormField
                            control={form.control}
                            name="sport"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white text-base font-semibold">
                                        Sport <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Tennis, Basketball, Soccer"
                                            className="bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500 max-w-md focus-visible:ring-indigo-500"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-slate-400">
                                        What sport are you playing today?
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ── Routine Completed ── */}
                        <FormField
                            control={form.control}
                            name="routine_completed"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white text-base font-semibold">
                                        Did you complete your routine? <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="grid grid-cols-3 gap-3 pt-2"
                                            data-testid="routine-completed-group"
                                        >
                                            {/* Yes */}
                                            <Label
                                                htmlFor="rc-yes"
                                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${field.value === "yes"
                                                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                                                    : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600"
                                                    }`}
                                            >
                                                <RadioGroupItem value="yes" id="rc-yes" className="sr-only" />
                                                <CheckCircle2 className="h-6 w-6" />
                                                <span className="text-sm font-medium">Yes</span>
                                            </Label>
                                            {/* Partial */}
                                            <Label
                                                htmlFor="rc-partial"
                                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${field.value === "partial"
                                                    ? "border-amber-500 bg-amber-500/10 text-amber-400"
                                                    : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600"
                                                    }`}
                                            >
                                                <RadioGroupItem value="partial" id="rc-partial" className="sr-only" />
                                                <AlertTriangle className="h-6 w-6" />
                                                <span className="text-sm font-medium">Partial</span>
                                            </Label>
                                            {/* No */}
                                            <Label
                                                htmlFor="rc-no"
                                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${field.value === "no"
                                                    ? "border-red-500 bg-red-500/10 text-red-400"
                                                    : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600"
                                                    }`}
                                            >
                                                <RadioGroupItem value="no" id="rc-no" className="sr-only" />
                                                <XCircle className="h-6 w-6" />
                                                <span className="text-sm font-medium">No</span>
                                            </Label>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ── Anxiety Level ── */}
                        <FormField
                            control={form.control}
                            name="pre_anxiety_level"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white text-base font-semibold">
                                        Anxiety Level <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormDescription className="text-slate-400">
                                        How anxious are you feeling right now?
                                    </FormDescription>
                                    <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
                                        <CardContent className="p-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-3xl font-bold text-white" data-testid="anxiety-level-value">
                                                    {field.value}
                                                </span>
                                                <span className="text-sm text-slate-400">
                                                    {ANXIETY_LABELS[field.value]}
                                                </span>
                                            </div>
                                            <FormControl>
                                                <Slider
                                                    min={1}
                                                    max={5}
                                                    step={1}
                                                    value={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                    className="py-4"
                                                    data-testid="anxiety-slider"
                                                />
                                            </FormControl>
                                            <div className="flex justify-between px-1">
                                                {[1, 2, 3, 4, 5].map((n) => (
                                                    <button
                                                        key={n}
                                                        type="button"
                                                        onClick={() => field.onChange(n)}
                                                        className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${field.value === n
                                                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                                                            : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                                                            }`}
                                                    >
                                                        {n}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500 pt-1">
                                                <span>Calm</span>
                                                <span>Overwhelmed</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ── Confidence Level ── */}
                        <FormField
                            control={form.control}
                            name="pre_confidence_level"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white text-base font-semibold">
                                        Confidence Level <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormDescription className="text-slate-400">
                                        How confident do you feel about your performance?
                                    </FormDescription>
                                    <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
                                        <CardContent className="p-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-3xl font-bold text-white" data-testid="confidence-level-value">
                                                    {field.value}
                                                </span>
                                                <span className="text-sm text-slate-400">
                                                    {CONFIDENCE_LABELS[field.value]}
                                                </span>
                                            </div>
                                            <FormControl>
                                                <Slider
                                                    min={1}
                                                    max={5}
                                                    step={1}
                                                    value={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                    className="py-4"
                                                    data-testid="confidence-slider"
                                                />
                                            </FormControl>
                                            <div className="flex justify-between px-1">
                                                {[1, 2, 3, 4, 5].map((n) => (
                                                    <button
                                                        key={n}
                                                        type="button"
                                                        onClick={() => field.onChange(n)}
                                                        className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${field.value === n
                                                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                                                            : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                                                            }`}
                                                    >
                                                        {n}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500 pt-1">
                                                <span>Very low</span>
                                                <span>Very high</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ── Notes ── */}
                        <FormField
                            control={form.control}
                            name="pre_notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white text-base font-semibold">
                                        Notes{" "}
                                        <span className="text-slate-500 font-normal">(optional)</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Anything on your mind before the game..."
                                            maxLength={200}
                                            className="bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500 resize-none h-24 focus-visible:ring-indigo-500"
                                            data-testid="pre-notes"
                                            {...field}
                                        />
                                    </FormControl>
                                    <div className="flex justify-between">
                                        <FormMessage />
                                        <span className="text-xs text-slate-500 ml-auto">
                                            {notesValue.length}/200
                                        </span>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* ── Submit & Cancel ── */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-800/50">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-8 text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto h-11 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-indigo-500/25"
                                data-testid="submit-pre-game-log"
                            >
                                {isSubmitting ? "Saving..." : "Save Pre-Game Log"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </main>
        </div>
    );
}
