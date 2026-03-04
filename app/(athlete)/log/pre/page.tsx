import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PreGameLogForm } from "@/components/logging/PreGameLogForm";

export default async function PreGameLogPage() {
    const supabase = await createClient();

    // Verify auth and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/login");
    }

    // Fetch the athlete's profile to get their sport
    const { data: profile, error: profileError } = await supabase
        .from("athlete_profiles")
        .select("sport, onboarding_complete")
        .eq("athlete_id", user.id)
        .single();

    if (profileError || !profile) {
        // If they don't have a profile yet somehow, kick them to onboarding
        redirect("/onboarding");
    }

    if (!profile.onboarding_complete) {
        redirect("/onboarding");
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center py-10 px-4 max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
                <h1 className="text-4xl font-extrabold tracking-tight text-white">Pre-Game Log</h1>
                <p className="text-slate-400 text-lg">
                    Check in with yourself before your <span className="text-indigo-400 font-semibold">{profile.sport}</span> game.
                </p>
            </div>

            <div className="w-full">
                <PreGameLogForm sport={profile.sport || "game"} />
            </div>
        </div>
    );
}
