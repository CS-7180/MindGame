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
        <header className="p-4 flex items-center justify-between border-b border-slate-800/50 bg-slate-950/20 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center gap-3">
                {pathname !== "/coach/home" && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/coach/home")}
                        className="text-slate-400 hover:text-white hover:bg-slate-800 -ml-2 mr-1"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                )}
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                    <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-white text-lg">MindGame</span>
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                    data-testid="logout-button"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </header>
    );
}
