"use client";

import { useState } from "react";
import { Users, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function JoinTeamCard() {
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [joinedCoach, setJoinedCoach] = useState<string | null>(null);

    const handleJoin = async () => {
        if (!code || code.length !== 6) {
            toast.error("Please enter a valid 6-character code");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/coach/roster/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ team_code: code.toUpperCase() }),
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error?.message || "Failed to join team");
            }

            setJoinedCoach(json.data.coach_name);
            toast.success(`Succesfully joined ${json.data.coach_name}'s team!`);
            setCode("");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (joinedCoach) {
        return (
            <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm">
                <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-2 rounded-full bg-emerald-500/20">
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">Team Joined</p>
                        <p className="text-xs text-slate-400">You are now on <span className="text-emerald-400 font-semibold">{joinedCoach}</span>&apos;s roster. They can now share routine templates with you.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-slate-800 bg-gradient-to-br from-slate-900/90 to-indigo-950/30 backdrop-blur-sm">
            <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-indigo-400" />
                    <h2 className="text-md font-bold text-white">Join a Team</h2>
                </div>

                <p className="text-xs text-slate-400 mb-4">
                    Enter the team code provided by your coach to join their roster and receive shared routine templates.
                </p>

                <div className="flex gap-2">
                    <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="TEAM-CODE"
                        maxLength={6}
                        disabled={isLoading}
                        className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500 font-mono tracking-widest text-center"
                    />
                    <Button
                        onClick={handleJoin}
                        disabled={isLoading || code.length !== 6}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[80px]"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Join"
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
