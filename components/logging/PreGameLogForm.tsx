"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Loader2, ArrowRight } from "lucide-react";

// Form Schema
const preGameLogSchema = z.object({
    sport: z.string().min(1, "Sport is required"),
    routine_completed: z.enum(["yes", "partial", "no"], {
        required_error: "Please indicate if you completed a routine.",
    }),
    pre_anxiety_level: z.number().int().min(1).max(5),
    pre_confidence_level: z.number().int().min(1).max(5),
    pre_notes: z.string().max(200, "Notes cannot exceed 200 characters").optional(),
});

type PreGameLogValues = z.infer<typeof preGameLogSchema>;

interface PreGameLogFormProps {
    sport: string;
}

export function PreGameLogForm({ sport }: PreGameLogFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<PreGameLogValues>({
        resolver: zodResolver(preGameLogSchema),
        defaultValues: {
            sport: sport,
            routine_completed: "yes", // We default to 'yes' since usually they just came from Guided Execution
            pre_anxiety_level: 3,
            pre_confidence_level: 3,
            pre_notes: "",
        },
    });

    async function onSubmit(data: PreGameLogValues) {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await fetch("/api/logs/pre", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error?.message || "Failed to submit log");
            }

            // Success! Route them to home to see their dashboard
            router.push("/home");
            router.refresh();
        } catch (error: any) {
            console.error("Error submitting pre-game log:", error);
            setSubmitError(error.message || "An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl w-full max-w-md mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* Routine Completed Status */}
                    <FormField
                        control={form.control}
                        name="routine_completed"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-slate-200 text-base font-semibold">
                                    Did you complete your pre-game routine?
                                </FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        <FormItem className="flex items-center space-x-3 space-y-0 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                            <FormControl>
                                                <RadioGroupItem value="yes" />
                                            </FormControl>
                                            <FormLabel className="font-normal text-slate-300 cursor-pointer w-full">
                                                Yes, completed fully
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                            <FormControl>
                                                <RadioGroupItem value="partial" />
                                            </FormControl>
                                            <FormLabel className="font-normal text-slate-300 cursor-pointer w-full">
                                                Partially completed
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                            <FormControl>
                                                <RadioGroupItem value="no" />
                                            </FormControl>
                                            <FormLabel className="font-normal text-slate-300 cursor-pointer w-full">
                                                No, skipped it
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Pre-Game Anxiety Slider */}
                    <FormField
                        control={form.control}
                        name="pre_anxiety_level"
                        render={({ field }) => (
                            <FormItem className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <FormLabel className="text-slate-200 text-base font-semibold">
                                        Current Anxiety Level
                                    </FormLabel>
                                    <span className="text-indigo-400 font-bold text-lg">{field.value}</span>
                                </div>
                                <FormControl>
                                    <div className="px-2">
                                        <Slider
                                            min={1}
                                            max={5}
                                            step={1}
                                            value={[field.value]}
                                            onValueChange={(val) => field.onChange(val[0])}
                                            className="py-4"
                                        />
                                        <div className="flex justify-between text-xs text-slate-500 mt-2">
                                            <span>1 - Very Calm</span>
                                            <span>5 - High Anxiety</span>
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Pre-Game Confidence Slider */}
                    <FormField
                        control={form.control}
                        name="pre_confidence_level"
                        render={({ field }) => (
                            <FormItem className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <FormLabel className="text-slate-200 text-base font-semibold">
                                        Current Confidence Level
                                    </FormLabel>
                                    <span className="text-emerald-400 font-bold text-lg">{field.value}</span>
                                </div>
                                <FormControl>
                                    <div className="px-2">
                                        <Slider
                                            min={1}
                                            max={5}
                                            step={1}
                                            value={[field.value]}
                                            onValueChange={(val) => field.onChange(val[0])}
                                            className="py-4"
                                        />
                                        <div className="flex justify-between text-xs text-slate-500 mt-2">
                                            <span>1 - Low</span>
                                            <span>5 - High</span>
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Optional Notes */}
                    <FormField
                        control={form.control}
                        name="pre_notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-200 text-base font-semibold">
                                    Any quick notes? <span className="text-slate-500 font-normal text-sm block sm:inline sm:ml-2">(Optional)</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="How is your body feeling right now? Any specific worries?"
                                        className="resize-none bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-600 focus-visible:ring-indigo-500 min-h-[100px]"
                                        {...field}
                                    />
                                </FormControl>
                                <div className="text-right text-xs text-slate-500">
                                    {field.value?.length || 0} / 200
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {submitError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm text-center">
                            {submitError}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Saving Log...
                            </>
                        ) : (
                            <>
                                Save Game Log <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
