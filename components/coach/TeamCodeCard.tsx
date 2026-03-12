"use client";

import { useState } from "react";
import { Copy, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

interface TeamCodeCardProps {
    code: string;
}

export function TeamCodeCard({ code }: TeamCodeCardProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            toast.success("Team code copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy code");
        }
    };

    return (
        <Card className="border-indigo-500/20 bg-indigo-950/20 backdrop-blur-xl relative overflow-hidden rounded-3xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="pb-2 border-none">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-indigo-400">
                    <Users className="h-4 w-4" />
                    <span>Invite Athletes</span>
                </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <p className="text-4xl font-mono font-bold text-white tracking-widest" data-testid="coach-code">{code}</p>
                        <p className="text-xs text-slate-500">Athletes enter this code when signing up</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyToClipboard}
                        className="h-14 w-14 text-indigo-400 hover:bg-white/5 hover:text-indigo-300 rounded-2xl transition-all border border-transparent hover:border-indigo-500/20"
                        title="Copy code"
                    >
                        {copied ? (
                            <Check className="h-6 w-6 text-emerald-400" />
                        ) : (
                            <Copy className="h-6 w-6" />
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
