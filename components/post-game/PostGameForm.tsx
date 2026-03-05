'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PostGameFormProps {
    logId: string;
}

export default function PostGameForm({ logId }: PostGameFormProps) {
    const router = useRouter();


    const [performance, setPerformance] = useState<number>(0);
    const [mentalState, setMentalState] = useState<number>(0);
    const [descriptor, setDescriptor] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (performance === 0 || mentalState === 0) {
            toast.error("Incomplete Reflection", {
                description: "Please rate both your performance and mental state.",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/logs/post', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    log_id: logId,
                    post_performance: performance,
                    post_mental_state: mentalState,
                    post_descriptor: descriptor || undefined,
                    skipped: false
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit reflection');
            }

            toast.success("Reflection Saved", {
                description: "Your post-game reflection has been successfully recorded.",
            });

            router.push(`/history/${logId}`);
            router.refresh();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error("Error", {
                description: "There was a problem saving your reflection. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/logs/post', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    log_id: logId,
                    skipped: true
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to skip reflection');
            }

            router.push('/home');
            router.refresh();
        } catch (error) {
            console.error('Skip error:', error);
            toast.error("Error", {
                description: "There was a problem skipping the reflection.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const RatingSelector = ({ value, onChange, label }: { value: number, onChange: (val: number) => void, label: string }) => (
        <div className="space-y-3">
            <Label className="text-base font-semibold text-white">{label}</Label>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                    <button
                        key={num}
                        type="button"
                        onClick={() => onChange(num)}
                        className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg transition-all border-2 ${value === num
                            ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-lg shadow-primary/20'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-indigo-400 hover:bg-slate-800 hover:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none'
                            }`}
                        aria-label={`Rate ${label} ${num} out of 5`}
                        aria-pressed={value === num}
                    >
                        {num}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <RatingSelector
                value={performance}
                onChange={setPerformance}
                label="Self-Rated Performance (1-5)"
            />

            <RatingSelector
                value={mentalState}
                onChange={setMentalState}
                label="Mental State During Game (1-5)"
            />

            <div className="space-y-3">
                <Label htmlFor="descriptor" className="text-base font-semibold text-white">One-Word Descriptor (Optional)</Label>
                <p className="text-sm text-slate-400">How did you feel overall? Keep it short and impactful.</p>
                <Input
                    id="descriptor"
                    value={descriptor}
                    onChange={(e) => setDescriptor(e.target.value)}
                    placeholder="e.g. Focused, Frustrated, Energized"
                    className="max-w-md bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                    maxLength={30}
                    disabled={isSubmitting}
                />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-800/50">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-indigo-500/25"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Reflection'
                    )}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSkip}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto text-slate-400 hover:text-white hover:bg-slate-800"
                >
                    Dismiss
                </Button>
            </div>
        </form>
    );
}
