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
            <Label className="text-base font-semibold">{label}</Label>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                    <button
                        key={num}
                        type="button"
                        onClick={() => onChange(num)}
                        className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg transition-all border ${value === num
                            ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-lg shadow-primary/20'
                            : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted focus:ring-2 focus:ring-ring focus:outline-none'
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
                <Label htmlFor="descriptor" className="text-base font-semibold">One-Word Descriptor (Optional)</Label>
                <p className="text-sm text-muted-foreground">How did you feel overall? Keep it short and impactful.</p>
                <Input
                    id="descriptor"
                    value={descriptor}
                    onChange={(e) => setDescriptor(e.target.value)}
                    placeholder="e.g. Focused, Frustrated, Energized"
                    className="max-w-md bg-muted/30"
                    maxLength={30}
                    disabled={isSubmitting}
                />
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                <Button type="submit" disabled={isSubmitting} className="font-semibold shadow-lg shadow-primary/20">
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
                    className="text-muted-foreground hover:text-foreground"
                >
                    Dismiss
                </Button>
            </div>
        </form>
    );
}
