"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Clock, Plus, Share2, Trash2, LayoutTemplate } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type TemplateStep = {
    id: string;
    step_order: number;
    technique: { name: string; duration_minutes: number };
};

type Template = {
    id: string;
    name: string;
    time_tier: string;
    coach_note?: string;
    steps?: TemplateStep[];
};

export function TemplateListClient({ initialTemplates }: { initialTemplates: Template[] }) {
    const [templates, setTemplates] = useState<Template[]>(initialTemplates);
    const [isSharing, setIsSharing] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = async (id: string) => {
        setIsDeleting(id);
        try {
            const res = await fetch(`/api/coach/templates/${id}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Failed to delete");

            setTemplates(prev => prev.filter(t => t.id !== id));
            toast({
                title: "Template Deleted",
                description: "The template has been removed.",
            });
            router.refresh();
        } catch {
            toast({
                title: "Error",
                description: "Could not delete template.",
                variant: "destructive"
            });
        } finally {
            setIsDeleting(null);
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
                toast({
                    title: "Error Sharing",
                    description: body.error?.message || "Could not share template.",
                    variant: "destructive"
                });
                return;
            }

            toast({
                title: "Template Shared",
                description: `${name} was sent to ${body.data.count} athletes.`,
            });
        } catch {
            toast({
                title: "Error",
                description: "Could not share template.",
                variant: "destructive"
            });
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
        <div className="grid grid-cols-1 gap-4">
            {templates.map((template) => {
                const totalMinutes = template.steps?.reduce((acc: number, step) => acc + (step.technique?.duration_minutes || 0), 0) || 0;

                return (
                    <Card key={template.id} className="border-slate-800 bg-slate-900/60 backdrop-blur-sm hover:bg-slate-900/80 transition-all text-white flex flex-col">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-lg text-white">{template.name}</CardTitle>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="secondary" className="capitalize bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                                            {template.time_tier}
                                        </Badge>
                                        <div className="flex items-center text-xs text-slate-400 font-medium">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {totalMinutes} min
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 pb-4">
                            {template.coach_note && (
                                <div className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-md mb-4 italic">
                                    &quot;{template.coach_note}&quot;
                                </div>
                            )}

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                    {template.steps?.length || 0} Steps
                                </p>
                                <ul className="space-y-2">
                                    {template.steps?.sort((a, b) => a.step_order - b.step_order).slice(0, 3).map((step) => (
                                        <li key={step.id} className="flex items-center text-sm text-slate-300">
                                            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] mr-2 flex-shrink-0">
                                                {step.step_order + 1}
                                            </span>
                                            <span className="truncate">{step.technique?.name}</span>
                                        </li>
                                    ))}
                                    {(template.steps?.length || 0) > 3 && (
                                        <li className="text-xs text-slate-500 italic pl-7">
                                            + {(template.steps?.length || 0) - 3} more
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </CardContent>

                        <CardFooter className="pt-0 flex gap-2">
                            <Button
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md border-none"
                                onClick={() => handleShare(template.id, template.name)}
                                disabled={isSharing === template.id}
                            >
                                {isSharing === template.id ? (
                                    <>Sharing...</>
                                ) : (
                                    <>
                                        <Share2 className="w-4 h-4 mr-2" /> Share with Team
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 border-slate-700 bg-slate-800/50"
                                onClick={() => handleDelete(template.id)}
                                disabled={isDeleting === template.id}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}
