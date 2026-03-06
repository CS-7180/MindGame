"use client";

import { useState } from "react";
import { Copy, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
        <Card className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm overflow-hidden border-2">
            <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/20">
                            <Users className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Team Invite Code</p>
                            <p className="text-xs text-slate-400">Share this code with your athletes so they can join your roster.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono text-xl font-bold tracking-widest text-indigo-400 shadow-inner">
                            {code}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={copyToClipboard}
                            className="h-11 w-11 border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white"
                        >
                            {copied ? (
                                <Check className="h-5 w-5 text-emerald-400" />
                            ) : (
                                <Copy className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
