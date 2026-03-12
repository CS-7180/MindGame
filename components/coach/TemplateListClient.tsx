"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Clock, Plus, Share2, Trash2, LayoutTemplate, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";


type TemplateStep = {
    id: string;
    step_order: number;
    technique: { name: string; duration_minutes: number };
};

type Template = {
    id: string;
    name: string;
    time_tier: string;
    coach_note?: string | null;
    steps?: TemplateStep[];
    sharedCount?: number;
};

export function TemplateListClient({ initialTemplates, rosterCount }: { initialTemplates: Template[], rosterCount: number }) {
    const [templates, setTemplates] = useState<Template[]>(initialTemplates);
    const [isSharing, setIsSharing] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async (id: string) => {
        setIsDeleting(id);
        try {
            const res = await fetch(`/api/coach/templates/${id}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Failed to delete");

            setTemplates(prev => prev.filter(t => t.id !== id));
            toast.success("Template deleted successfully");
            router.refresh();
        } catch {
            toast.error("Could not delete template.");
        } finally {
            setIsDeleting(null);
            setDeleteConfirmId(null);
        }
    };

    const handleShare = async (id: string, name: string) => {
        setIsSharing(id);
        try {
            const res = await fetch(`/api/coach/templates/${id}/share`, {
                method: "POST"
            });

            const body = await res.json();

            if (!res.ok) {
                toast.error(body.error?.message || "Could not share template.");
                return;
            }

            toast.success(body.data.count > 0
                ? `${name} was sent to ${body.data.count} new athlete(s).`
                : "All athletes already have this template."
            );

            // Optimistically update shared count
            if (body.data.sharedCount !== undefined) {
                setTemplates(prev => prev.map(t =>
                    t.id === id ? { ...t, sharedCount: body.data.sharedCount } : t
                ));
            }
        } catch {
            toast.error("Could not share template.");
        } finally {
            setIsSharing(null);
        }
    };

    if (templates.length === 0) {
        return (
            <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm border-dashed text-center py-8">
                <CardContent className="p-0">
                    <div className="bg-slate-800/50 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-4">
                        <LayoutTemplate className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">No templates yet</h3>
                    <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                        Create a routine template to share with your athletes to help them prepare mentally.
                    </p>
                    <Link href="/coach/templates/new">
                        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md">
                            <Plus className="mr-2 h-4 w-4" />
                            Create First Template
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 pb-4 pt-1 custom-scrollbar">
            {templates.map((template) => {
                const totalMinutes = template.steps?.reduce((acc: number, step) => acc + (step.technique?.duration_minutes || 0), 0) || 0;

                const sharedCount = template.sharedCount || 0;
                const allShared = rosterCount > 0 && sharedCount >= rosterCount;
                const hasRoster = rosterCount > 0;

                return (
                    <Card key={template.id} className="border-white/5 bg-slate-900/40 backdrop-blur-xl hover:border-indigo-500/30 transition-all duration-300 text-white flex flex-col group/card rounded-3xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                        <CardHeader className="pb-4 relative">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl text-white font-bold tracking-tight">{template.name}</CardTitle>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="secondary" className="capitalize bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold px-3 py-0.5 rounded-lg">
                                            {template.time_tier}
                                        </Badge>
                                        <div className="flex items-center text-xs text-slate-400 font-bold bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                                            <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                                            {totalMinutes} MIN
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 pb-4 relative">
                            {template.coach_note && (
                                <div className="text-sm text-slate-300 bg-white/5 p-4 rounded-2xl mb-4 italic border border-white/5 leading-relaxed">
                                    &quot;{template.coach_note}&quot;
                                </div>
                            )}

                            <div className="space-y-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                                    {template.steps?.length || 0} Routine Steps
                                </p>
                                <ul className="space-y-2">
                                    {template.steps?.sort((a, b) => a.step_order - b.step_order).slice(0, 3).map((step) => (
                                        <li key={step.id} className="flex items-center text-sm text-slate-400 group/item">
                                            <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-bold mr-3 border border-indigo-500/20 group-hover/item:bg-indigo-500 group-hover/item:text-white transition-colors">
                                                {step.step_order + 1}
                                            </span>
                                            <span className="truncate font-medium">{step.technique?.name}</span>
                                        </li>
                                    ))}
                                    {(template.steps?.length || 0) > 3 && (
                                        <li className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-9">
                                            + {(template.steps?.length || 0) - 3} additional techniques
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </CardContent>

                        <CardFooter className="pt-2 p-6 flex gap-3 relative border-t border-white/5 bg-white/5">
                            <Button
                                className={`flex-1 h-12 rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${allShared ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20'}`}
                                onClick={() => handleShare(template.id, template.name)}
                                disabled={isSharing === template.id || allShared}
                                data-testid={`share-button-${template.id}`}
                            >
                                {isSharing === template.id ? (
                                    <span className="flex items-center gap-2 animate-pulse text-sm">
                                        <Share2 className="w-4 h-4 animate-spin" /> Sharing...
                                    </span>
                                ) : allShared ? (
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> SHARED WITH TEAM
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Share2 className="w-4 h-4" />
                                        {hasRoster && sharedCount > 0
                                            ? `SYNC (${sharedCount}/${rosterCount})`
                                            : "SHARE WITH TEAM"}
                                    </span>
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-12 w-12 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-2xl border border-white/5 group-hover/card:border-rose-500/20 transition-all"
                                onClick={() => setDeleteConfirmId(template.id)}
                                disabled={isDeleting === template.id}
                                data-testid={`delete-button-${template.id}`}
                            >
                                <Trash2 className="w-5 h-5" />
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            This will permanently delete the template. Athletes who already received it will keep their routines, but you will no longer be able to share it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                            disabled={!!isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
