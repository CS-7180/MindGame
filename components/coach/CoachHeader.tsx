"use client";

import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Brain, LogOut, ArrowLeft } from "lucide-react";

export function CoachHeader() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <header className="p-4 flex items-center justify-between border-b border-white/5 bg-slate-950/40 backdrop-blur-xl sticky top-0 z-50">
            <div className="flex items-center gap-3">
                {pathname !== "/coach/home" && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/coach/home")}
                        className="text-slate-400 hover:text-white hover:bg-white/5 -ml-2 mr-1 rounded-xl transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                )}
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(99,102,241,0.3)] group">
                    <Brain className="h-5 w-5 text-white animate-pulse" />
                </div>
                <span className="font-bold text-white text-lg tracking-tight">MindGame <span className="text-indigo-400 font-medium text-sm ml-1 opacity-80">Coach</span></span>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                    data-testid="logout-button"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </header>
    );
}
