import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HomeClient from "./HomeClient";

export default async function HomePage() {
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

    return (
        <HomeClient
            displayName={profile?.display_name || user.email?.split("@")[0] || "Athlete"}
            routines={routines || []}
            sport={athleteProfile?.sport || ""}
        />
    );
}
