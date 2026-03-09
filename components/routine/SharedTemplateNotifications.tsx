"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, X, Check, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";

interface TemplateStep {
    id: string;
    technique: {
        name: string;
        duration_minutes: number;
    };
}

export interface SharedTemplateNotification {
    id: string;
    coach: {
        display_name: string;
    };
    template: {
        id: string;
        name: string;
        time_tier: string;
        coach_note: string;
        steps: TemplateStep[];
    };
}

interface Props {
    notifications: SharedTemplateNotification[];
}

export function SharedTemplateNotifications({ notifications: initialNotifications }: Props) {
    const [notifications, setNotifications] = useState(initialNotifications);
    const [actionId, setActionId] = useState<string | null>(null);
    const router = useRouter();

    const handleSave = async (notificationId: string) => {
        setActionId(notificationId);
        try {
            const res = await fetch(`/api/notifications/${notificationId}/save`, {
                method: "POST",
            });
            const json = await res.json();

            if (!res.ok) throw new Error(json.error?.message || "Failed to save template");

            toast.success("Template saved! Let's customize it.");
            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
            router.push(`/routine/builder?edit=${json.data.routine_id}`);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to save template");
        } finally {
            setActionId(null);
        }
    };

    const handleDismiss = async (notificationId: string) => {
        setActionId(notificationId);
        try {
            const res = await fetch(`/api/notifications/${notificationId}/dismiss`, {
                method: "POST",
            });

            if (!res.ok) throw new Error("Failed to dismiss notification");

            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
            toast.info("Notification dismissed");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to dismiss notification");
        } finally {
            setActionId(null);
        }
    };

    if (notifications.length === 0) return null;

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20">
                    <LayoutTemplate className="h-4 w-4 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white">Coach Notifications</h3>
            </div>

            <div className="space-y-3">
                {notifications.map((notif) => {
                    const totalMinutes = notif.template.steps.reduce(
                        (acc, step) => acc + (step.technique?.duration_minutes || 0),
                        0
                    );

                    return (
                        <Card key={notif.id} className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                            <CardHeader className="pb-3 border-b border-white/5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-white text-base">
                                            {notif.template.name}
                                        </CardTitle>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Shared by Coach <span className="text-indigo-400 font-medium">{notif.coach.display_name}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
                                            {notif.template.time_tier}
                                        </Badge>
                                        <div className="flex items-center text-xs text-slate-400">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {totalMinutes}m
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="py-4">
                                {notif.template.coach_note && (
                                    <div className="text-sm text-slate-300 italic mb-4 border-l-2 border-indigo-500/40 pl-3 py-1">
                                        &quot;{notif.template.coach_note}&quot;
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Routine Preview
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {notif.template.steps.map((step, idx) => (
                                            <Badge key={step.id} variant="outline" className="text-[10px] py-0 border-white/10 text-slate-400 font-normal">
                                                {idx + 1}. {step.technique.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="bg-white/5 p-3 flex gap-2">
                                <Button
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs h-9"
                                    onClick={() => handleSave(notif.id)}
                                    disabled={actionId !== null}
                                >
                                    <Check className="w-3.5 h-3.5 mr-2" />
                                    {actionId === notif.id ? "Saving..." : "Customize & Save"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-400 hover:text-white hover:bg-white/5 text-xs h-9 px-3"
                                    onClick={() => handleDismiss(notif.id)}
                                    disabled={actionId !== null}
                                >
                                    <X className="w-3.5 h-3.5 mr-2" />
                                    Dismiss
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}
