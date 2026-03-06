import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HomeClient from "./HomeClient";

export default async function HomePage({ searchParams }: { searchParams: { sport?: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // Redirect coaches
    if (profile?.role === "coach") {
        redirect("/coach/home");
    }

    // Check onboarding status
    const { data: athleteProfile } = await supabase
        .from("athlete_profiles")
        .select("*")
        .eq("athlete_id", user.id)
        .single();

    if (!athleteProfile?.onboarding_complete) {
        redirect("/onboarding?step=1");
    }

    // Fetch routines
    const { data: routines } = await supabase
        .from("routines")
        .select(`
      *,
      routine_steps (
        *,
        techniques (*)
      )
    `)
        .eq("athlete_id", user.id)
        .order("created_at", { ascending: false });

    // Fetch game logs for dashboard stats
    const { data: gameLogs } = await supabase
        .from("game_logs")
        .select("*")
        .eq("athlete_id", user.id)
        .order("log_date", { ascending: false });

    // Build sports list from profile + routines (backward compat)
    const profileSports: string[] = athleteProfile?.sports?.length
        ? athleteProfile.sports
        : athleteProfile?.sport ? [athleteProfile.sport] : [];
    const routineSports = (routines || []).map((r: { sport: string }) => r.sport).filter(Boolean);
    const allSports = Array.from(new Set([...profileSports, ...routineSports]));

    return (
        <HomeClient
            displayName={profile?.display_name || user.email?.split("@")[0] || "Athlete"}
            routines={routines || []}
            sports={allSports}
            defaultSport={searchParams.sport || allSports[0] || ""}
            gameLogs={gameLogs || []}
        />
    );
}
